/**
 * Nextcloud - Tasks
 *
 * @author Raimund Schlüßler
 * @copyright 2017 Raimund Schlüßler <raimund.schluessler@googlemail.com>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

angular.module('Tasks').factory('TasksBusinessLayer', [
	'TasksModel', 'Persistence', 'VTodoService', 'VTodo', '$timeout',
	function(TasksModel, Persistence, VTodoService, VTodo, $timeout) {
		'use strict';
		var TasksBusinessLayer;
		TasksBusinessLayer = (function() {
			function TasksBusinessLayer(_$tasksmodel, _persistence, _$vtodoservice, _$vtodo, $timeout) {
				this._$tasksmodel = _$tasksmodel;
				this._persistence = _persistence;
				this._$vtodoservice = _$vtodoservice;
			}

			TasksBusinessLayer.prototype.getAll = function(calendar, completed, parent) {
				return this._$vtodoservice.getAll(calendar, completed, parent).then(function(tasks) {
					var task, _i, _len, _results;
					_results = [];
					for (_i = 0, _len = tasks.length; _i < _len; _i++) {
						task = tasks[_i];
						var vTodo = new VTodo(task.calendar, task.properties, task.uri);
						_results.push(TasksModel.ad(vTodo));
					}
					return _results;
				});
			};

			TasksBusinessLayer.prototype.add = function(task) {
				return this._$vtodoservice.create(task.calendar, task.data).then(function(task) {
					var vTodo = new VTodo(task.calendar, task.properties, task.uri);
					TasksModel.ad(vTodo);
					return vTodo;
				});
			};

			TasksBusinessLayer.prototype.getTask = function(calendar, uri) {
				return this._$vtodoservice.get(calendar, uri).then(function(task) {
					TasksModel.ad(task);
					return task;
				});
			};

			TasksBusinessLayer.prototype.setPriority = function(task, priority) {
				if (task.calendar.writable) {
					task.priority = priority;
					this.doUpdate(task);
				}
			};

			TasksBusinessLayer.prototype.setPercentComplete = function(task, percentComplete) {
				if (task.calendar.writable) {
					if (percentComplete < 100) {
						this.uncompleteParents(task.related);
					} else {
						this.completeChildren(task);
					}
					task.complete = percentComplete;
					this.triggerUpdate(task);
				}
			};

			TasksBusinessLayer.prototype.triggerUpdate = function(task, duration) {
				if (!duration) {
					duration = 1000;
				}
				if (task.timers.update) {
					$timeout.cancel(task.timers.update);
				}
				task.timers.update = $timeout(function(task) {
					VTodoService.update(task);
				}, duration, true, task);
			};

			TasksBusinessLayer.prototype.doUpdate = function(task) {
				return this._$vtodoservice.update(task);
			};

			TasksBusinessLayer.prototype.completeChildren = function(task) {
				var child, _i, _len;
				var children = this._$tasksmodel.getChildren(task);
				var _results = [];
				for (_i = 0, _len = children.length; _i < _len; _i++) {
					child = children[_i];
					_results.push(this.setPercentComplete(child, 100));
				}
				return _results;
			};

			TasksBusinessLayer.prototype.uncompleteParents = function(uid) {
				if (uid) {
					var parent = this._$tasksmodel.getByUid(uid);
					if (parent.completed) {
						return this.setPercentComplete(parent, 0);
					}
				}
			};

			TasksBusinessLayer.prototype.setHideSubtasks = function(task, hide) {
				task.hideSubtasks = hide;
				if (task.calendar.writable) {
					this.doUpdate(task);
				}
			};

			TasksBusinessLayer.prototype.setHideCheckLists = function(task, hide) {
				task.hideCheckLists = hide;
				if (task.calendar.writable) {
					this.doUpdate(task);
				}
			};

			TasksBusinessLayer.prototype.setHideCompletedSubtasks = function(task, hide) {
				task.hideCompletedSubtasks = hide;
				if (task.calendar.writable) {
					this.doUpdate(task);
				}
			};

			TasksBusinessLayer.prototype.deleteTask = function(task) {
				var child, children, _i, _len;
				children = this._$tasksmodel.getChildren(task);
				for (_i = 0, _len = children.length; _i < _len; _i++) {
					child = children[_i];
					this.deleteTask(child);
				}
				return this._$vtodoservice["delete"](task).then(function() {
					return TasksModel["delete"](task);
				});
			};

			TasksBusinessLayer.prototype.momentToICALTime = function(moment, asDate) {
				if(asDate) {
					return ICAL.Time.fromDateString(moment.format('YYYY-MM-DD'));
				} else {
					return ICAL.Time.fromDateTimeString(moment.format('YYYY-MM-DDTHH:mm:ss'));
				}
			};

			TasksBusinessLayer.prototype.initDueDate = function(task) {
				var start = moment(task.start, "YYYY-MM-DDTHH:mm:ss");
				var due = moment(task.due, "YYYY-MM-DDTHH:mm:ss");
				if (!due.isValid()) {
					var reference = start.isAfter() ? start : moment();
					if(task.allDay) {
						reference.startOf('day').add(1, 'd');
					} else {
						reference.startOf('hour').add(1, 'h');
					}
					return this.setDue(task, reference, 'all');
				}
			};

			TasksBusinessLayer.prototype.setDue = function(task, date, type) {
				if (type === null) {
					type = 'day';
				}
				var allDay = task.allDay;
				var start = moment(task.start, "YYYY-MM-DDTHH:mm:ss");
				var olddue = moment(task.due, "YYYY-MM-DDTHH:mm:ss");
				var due = olddue.clone();
				if (type === 'day') {
					if (moment(due).isValid()) {
						due.year(date.year()).month(date.month()).date(date.date());
					} else {
						due = date.add(12, 'h');
					}
				} else if (type === 'time') {
					if (moment(due).isValid()) {
						due.hour(date.hour()).minute(date.minute());
					} else {
						due = date;
					}
				} else if (type === 'all') {
					due = date;
				} else {
					return;
				}
				if (due.isBefore(start) || due.isSame(start)) {
					start.subtract(olddue.diff(due), 'ms');
					task.start = this.momentToICALTime(start, allDay);
				}
				task.due = this.momentToICALTime(due, allDay);
				// this.checkReminderDate(task);
				this.doUpdate(task);
			};

			TasksBusinessLayer.prototype.deleteDueDate = function(task) {
				// var reminder = task.reminder;
				//  if (reminder !== null && reminder.type === 'DURATION' && reminder.duration.params.related === 'END') {
				// this.deleteReminderDate(task);
				//  }
				task.due = null;
				this.doUpdate(task);
			};

			TasksBusinessLayer.prototype.initStartDate = function(task) {
				var start = moment(task.start, "YYYY-MM-DDTHH:mm:ss");
				var due = moment(task.due, "YYYY-MM-DDTHH:mm:ss");
				if (!start.isValid()) {
					var reference = moment().add(1, 'h');
					if (due.isBefore(reference)) {
						reference = due.subtract(1, 'm');
					}
					reference.startOf(task.allDay ? 'day' : 'hour');
					return this.setStart(task, reference, 'all');
				}
			};

			TasksBusinessLayer.prototype.setStart = function(task, date, type) {
				if (type === null) {
					type = 'day';
				}
				var allDay = task.allDay;
				var due = moment(task.due, "YYYY-MM-DDTHH:mm:ss");
				var oldstart = moment(task.start, "YYYY-MM-DDTHH:mm:ss");
				var start = oldstart.clone();
				if (type === 'day') {
					if (moment(start).isValid()) {
						start.year(date.year()).month(date.month()).date(date.date());
					} else {
						start = date.add(12, 'h');
					}
				} else if (type === 'time') {
					if (moment(start).isValid()) {
						start.hour(date.hour()).minute(date.minute());
					} else {
						start = date;
					}
				} else if (type === 'all') {
					start = date;
				} else {
					return;
				}
				if(start.isAfter(due) || start.isSame(due)) {
					due.add(start.diff(oldstart), 'ms');
					task.due = this.momentToICALTime(due, allDay);
				}
				task.start = this.momentToICALTime(start, allDay);
				// this.checkReminderDate(taskID);
				this.doUpdate(task);
			};

			TasksBusinessLayer.prototype.deleteStartDate = function(task) {
				// var reminder = task.reminder;
				// if (reminder !== null && reminder.type === 'DURATION' && reminder.duration.params.related === 'START') {
					// this.deleteReminderDate(task);
				// }
				task.start = null;
				this.doUpdate(task);
			};

 			TasksBusinessLayer.prototype.setAllDay = function(task, allDay) {
 				task.allDay = allDay;
				if (allDay) {
					var due = moment(task.due, "YYYY-MM-DDTHH:mm:ss");
					var start = moment(task.start, "YYYY-MM-DDTHH:mm:ss");
					if(start.isAfter(due) || start.isSame(due)) {
						start = moment(due).subtract(1, 'day');
						task.start = this.momentToICALTime(start, allDay);
					}
				}
 				this.doUpdate(task);
 			};

			TasksBusinessLayer.prototype.initReminder = function(taskID) {
				var p, task;
				if (!this.checkReminderDate(taskID)) {
					task = this._$tasksmodel.getById(taskID);
					task.reminder = {
						type: 'DURATION',
						action: 'DISPLAY',
						duration: {
							token: 'week',
							week: 0,
							day: 0,
							hour: 0,
							minute: 0,
							second: 0,
							params: {
							  invert: true
						}
					}
				};
				if (moment(task.start, "YYYYMMDDTHHmmss").isValid()) {
					p = task.reminder.duration.params;
					p.related = 'START';
					p.id = '10';
				} else if (moment(task.due, "YYYYMMDDTHHmmss").isValid()) {
					p = task.reminder.duration.params;
					p.related = 'END';
					p.id = '11';
				} else {
					task.reminder.type = 'DATE-TIME';
					task.reminder.date = moment().startOf('hour').add(1, 'h').format('YYYYMMDDTHHmmss');
				}
				return this.setReminder(taskID);
				}
			};

			TasksBusinessLayer.prototype.setReminderDate = function(taskID, date, type) {
				var newreminder, reminder, reminderdate;
				if (type === null) {
					type = 'day';
				}
				reminder = this._$tasksmodel.getById(taskID).reminder;
				newreminder = {
					type: 'DATE-TIME',
					action: 'DISPLAY',
					duration: null
				};
				if (type === 'day') {
					if (this.checkReminderDate(taskID) || reminder === null) {
						reminderdate = moment(reminder.date, "YYYYMMDDTHHmmss");
						newreminder.action = reminder.action;
						if (reminderdate.isValid() && reminder.type === 'DATE-TIME') {
							reminderdate.year(date.year()).month(date.month()).date(date.date());
						} else {
							reminderdate = date.add(12, 'h');
						}
					} else {
						reminderdate = date.add(12, 'h');
					}
				} else if (type === 'time') {
					if (this.checkReminderDate(taskID) || reminder === null) {
						reminderdate = moment(reminder.date, "YYYYMMDDTHHmmss");
						newreminder.action = reminder.action;
						if (reminderdate.isValid() && reminder.type === 'DATE-TIME') {
							reminderdate.hour(date.hour()).minute(date.minute());
						} else {
							reminderdate = date;
						}
					} else {
						reminderdate = date;
					}
				} else {
					return;
				}
				newreminder.date = reminderdate.format('YYYYMMDDTHHmmss');
				this._$tasksmodel.setReminder(taskID, newreminder);
				return this._persistence.setReminder(taskID, newreminder);
			};

			TasksBusinessLayer.prototype.setReminder = function(taskID) {
				var reminder;
				if (this.checkReminderDate(taskID)) {
					reminder = this._$tasksmodel.getById(taskID).reminder;
					return this._persistence.setReminder(taskID, reminder);
				}
			};

			TasksBusinessLayer.prototype.checkReminderDate = function(taskID) {
				var d, date, duration, rel, related, reminder, seg, task, token;
				task = this._$tasksmodel.getById(taskID);
				reminder = task.reminder;
				if (reminder !== null && reminder.type === 'DURATION') {
					if (!reminder.duration) {
						return false;
					} else if (reminder.duration.params.related === 'START') {
						token = 'start';
					} else if (reminder.duration.params.related === 'END') {
						token = 'due';
					} else {
						return false;
					}
					date = moment(task[token], "YYYYMMDDTHHmmss");
					duration = reminder.duration;
					d = {
						w: duration.week,
						d: duration.day,
						h: duration.hour,
						m: duration.minute,
						s: duration.second
					};
					if (duration.params.invert) {
						date = date.subtract(d);
					} else {
						date = date.add(d);
					}
					task.reminder.date = date.format('YYYYMMDDTHHmmss');
				} else if (reminder !== null && reminder.type === 'DATE-TIME') {
					duration = reminder.duration;
					date = moment(reminder.date, "YYYYMMDDTHHmmss");
					if (!date.isValid()) {
						return false;
					}
					if (duration) {
						if (duration.params.related === 'START') {
							related = moment(task.start, "YYYYMMDDTHHmmss");
						} else {
							related = moment(task.due, "YYYYMMDDTHHmmss");
						}
						seg = this.secondsToSegments(date.diff(related, 'seconds'));
						duration.params.invert = seg.invert;
						duration.token = 'week';
						duration.week = seg.week;
						duration.day = seg.day;
						duration.hour = seg.hour;
						duration.minute = seg.minute;
						duration.second = seg.second;
					} else {
						if (task.start) {
							related = moment(task.start, "YYYYMMDDTHHmmss");
							rel = 'START';
							d = 0;
						} else if (task.due) {
							related = moment(task.due, "YYYYMMDDTHHmmss");
							rel = 'END';
							d = 1;
						} else {
							return true;
						}
						seg = this.secondsToSegments(date.diff(related, 'seconds'));
						reminder.duration = {
							token: 'week',
							params: {
								related: rel,
								invert: seg.invert,
								id: +seg.invert + '' + d
							},
							week: seg.week,
							day: seg.day,
							hour: seg.hour,
							minute: seg.minute,
							second: seg.second
						};
					}
				} else {
					return false;
				}
				return true;
			};

			TasksBusinessLayer.prototype.secondsToSegments = function(s) {
				var d, h, i, m, w;
				if (s < 0) {
					s *= -1;
					i = true;
				} else {
					i = false;
				}
				w = Math.floor(s / 604800);
				s -= w * 604800;
				d = Math.floor(s / 86400);
				s -= d * 86400;
				h = Math.floor(s / 3600);
				s -= h * 3600;
				m = Math.floor(s / 60);
				s -= m * 60;
				return {
					week: w,
					day: d,
					hour: h,
					minute: m,
					second: s,
					invert: i
				};
			};

			TasksBusinessLayer.prototype.deleteReminderDate = function(taskID) {
				this._$tasksmodel.setReminder(taskID, null);
				return this._persistence.setReminder(taskID, false);
			};

			TasksBusinessLayer.prototype.changeCalendar = function(task, newCalendar) {
				if(task.calendar !== newCalendar && newCalendar.writable) {
					var newTask = angular.copy(task);
					newTask.calendar = newCalendar;
					if (!TasksModel.hasNoParent(newTask)) {
						var parent = TasksModel.getByUid(newTask.related);
						if (parent.calendar.uri !== newTask.calendar.uri) {
							newTask.related = null;
							TasksBusinessLayer.prototype.setPercentComplete(newTask, 0);
						}
					}
					return VTodoService.create(newCalendar, newTask.data).then(function(newVTodo) {
						var vTodo = new VTodo(newVTodo.calendar, newVTodo.properties, newVTodo.uri);
						TasksModel.ad(vTodo);
						return VTodoService["delete"](task).then(function() {
							TasksModel["delete"](task);
							var queries = [];
							var children = TasksModel.getChildren(newTask);
							var _i, _len, child;
							for (_i = 0, _len = children.length; _i < _len; _i++) {
								child = children[_i];
								if (child.calendar.uri !== newTask.calendar.uri) {
									queries.push(TasksBusinessLayer.prototype.changeCalendar(child, newTask.calendar));
								}
							}
							return Promise.all(queries);
						});
					});
				} else {
					return Promise.resolve(true);
				}
			};

			// called from outside
			TasksBusinessLayer.prototype.changeCollection = function(taskID, collectionID) {
				var task = this._$tasksmodel.getById(taskID);
				switch (collectionID) {
					case 'starred':
						task.priority = 9;
						return this.doUpdate(task);
					case 'completed':
						return this.setPercentComplete(task, 100);
					case 'uncompleted':
						if (task.completed) {
							return this.setPercentComplete(task, 0);
						} else {
							return false;
						}
						break;
					case 'today':
						return this.setDue(task, moment().startOf('day').add(12, 'h'), 'all');
					case 'week':
					case 'all':
						return false;
					default:
						return false;
				}
			};

			TasksBusinessLayer.prototype.changeParent = function(task, parent) {
				if (parent.calendar.writable) {
					task.related = parent.uid;
					parent.hideSubtasks = 0;
					parent.hideCheckLists = 0;
					if (parent.completed && !task.completed) {
						this.setPercentComplete(parent, 0);
					} else {
						this.doUpdate(parent);
					}
					if (parent.calendar.uri !== task.calendar.uri) {
						this.changeCalendar(task, parent.calendar);
					} else {
						this.doUpdate(task);
					}
				}
			};

			TasksBusinessLayer.prototype.makeRootTask = function(task, newCalendar, collectionID) {
				if (newCalendar.writable) {
					var requests = [];
					task.related = null;
					if (collectionID !== "completed" && task.completed) {
						task.complete = 0;
					}
					requests.push(this.changeCollection(task.uri, collectionID));
					if (task.calendar !== newCalendar) {
						requests.push(this.changeCalendar(task, newCalendar));
					} else {
						requests.push(this.doUpdate(task));
					}
					return requests;
				}
			};

			TasksBusinessLayer.prototype.addComment = function(comment, onSuccess, onFailure) {
				var success,
				_this = this;
				if (!onSuccess) {
					onSuccess = function() {};
				}
				if (!onFailure) {
					onFailure = function() {};
				}
				this._$tasksmodel.addComment(comment);
				success = function(response) {
					if (response.status === 'error') {
						return onFailure();
					} else {
						return onSuccess(response.data);
					}
				};
				return this._persistence.addComment(comment, success);
			};

			TasksBusinessLayer.prototype.deleteComment = function(taskID, commentID) {
				this._$tasksmodel.deleteComment(taskID, commentID);
				return this._persistence.deleteComment(taskID, commentID);
			};

            TasksBusinessLayer.prototype.updateOnChecklistTaskTrigger = function(task) {
            	console.log("update");
                if (task.calendar.writable) {
                    this.doUpdate(task);
                }
            };


		return TasksBusinessLayer;

	  })();
	  return new TasksBusinessLayer(TasksModel, Persistence, VTodoService, VTodo, $timeout);
	}
]);

/**
 * ownCloud - Tasks
 *
 * @author Raimund Schlüßler
 * @copyright 2016 Raimund Schlüßler <raimund.schluessler@googlemail.com>
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
	'TasksModel', 'Persistence', 'VTodoService', function(TasksModel, Persistence, VTodoService) {
		var TasksBusinessLayer;
		TasksBusinessLayer = (function() {
			function TasksBusinessLayer(_$tasksmodel, _persistence, _$vtodoservice) {
				this._$tasksmodel = _$tasksmodel;
				this._persistence = _persistence;
				this._$vtodoservice = _$vtodoservice;
			}

			TasksBusinessLayer.prototype.init = function(calendar) {
				return this._$vtodoservice.getAll(calendar).then(function(tasks) {
					var task, _i, _len, _results;
					_results = [];
					for (_i = 0, _len = tasks.length; _i < _len; _i++) {
						task = tasks[_i];
						_results.push(TasksModel.ad(task));
					}
					return _results;
				});
			};

			TasksBusinessLayer.prototype.add = function(task) {
				return this._$vtodoservice.create(task.calendar, task.data).then(function(task) {
					TasksModel.ad(task);
					return task;
				});
			};

		TasksBusinessLayer.prototype.getTask = function(taskID, onSuccess, onFailure) {
		  if (onSuccess == null) {
			onSuccess = null;
		  }
		  if (onFailure == null) {
			onFailure = null;
		  }
		  onSuccess || (onSuccess = function() {});
		  return this._persistence.getTask(taskID, onSuccess, true);
		};

			TasksBusinessLayer.prototype.setPriority = function(task, priority) {
				task.priority = priority;
				this._$vtodoservice.update(task).then(function(task) {
				});
			};

			TasksBusinessLayer.prototype.setPercentComplete = function(task, percentComplete) {
				task.complete = percentComplete;
				if (percentComplete < 100) {
					task.completed = null;
					if (percentComplete === 0) {
						task.status = 'NEEDS-ACTION';
					} else {
						task.status = 'IN-PROCESS';
					}
					// this.uncompleteParents(task.related);
				} else {
					task.completed = ICAL.Time.now();
					task.status = 'COMPLETED';
					// this.completeChildren(task);
				}
				this._$vtodoservice.update(task).then(function(task) {
				});
			};

		TasksBusinessLayer.prototype.completeChildren = function(taskID) {
		  var childID, childrenID, _i, _len, _results;
		  childrenID = this._$tasksmodel.getChildrenID(taskID);
		  _results = [];
		  for (_i = 0, _len = childrenID.length; _i < _len; _i++) {
			childID = childrenID[_i];
			_results.push(this.setPercentComplete(childID, 100));
		  }
		  return _results;
		};

		TasksBusinessLayer.prototype.uncompleteParents = function(uid) {
		  var parentID;
		  if (uid) {
			parentID = this._$tasksmodel.getIdByUid(uid);
			if (this._$tasksmodel.completed(parentID)) {
			  return this.setPercentComplete(parentID, 0);
			}
		  }
		};

		TasksBusinessLayer.prototype.unhideSubtasks = function(taskID) {
		  this._$tasksmodel.setHideSubtasks(taskID, false);
		  return this._persistence.setHideSubtasks(taskID, false);
		};

		TasksBusinessLayer.prototype.hideSubtasks = function(taskID) {
		  this._$tasksmodel.setHideSubtasks(taskID, true);
		  return this._persistence.setHideSubtasks(taskID, true);
		};

		TasksBusinessLayer.prototype.deleteTask = function(taskID) {
		  var childID, childrenID, _i, _len;
		  childrenID = this._$tasksmodel.getChildrenID(taskID);
		  for (_i = 0, _len = childrenID.length; _i < _len; _i++) {
			childID = childrenID[_i];
			this.deleteTask(childID);
		  }
		  this._$tasksmodel.removeById(taskID);
		  return this._persistence.deleteTask(taskID);
		};

		TasksBusinessLayer.prototype.initDueDate = function(taskID) {
		  var due;
		  due = moment(this._$tasksmodel.getById(taskID).due, "YYYYMMDDTHHmmss");
		  if (!due.isValid()) {
			return this.setDue(taskID, moment().startOf('hour').add(1, 'h'), 'time');
		  }
		};

		TasksBusinessLayer.prototype.setDue = function(taskID, date, type) {
		  var due;
		  if (type == null) {
			type = 'day';
		  }
		  due = moment(this._$tasksmodel.getById(taskID).due, "YYYYMMDDTHHmmss");
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
		  this._$tasksmodel.setDueDate(taskID, due.format('YYYYMMDDTHHmmss'));
		  this.checkReminderDate(taskID);
		  return this._persistence.setDueDate(taskID, due.isValid() ? due.unix() : false);
		};

		TasksBusinessLayer.prototype.deleteDueDate = function(taskID) {
		  var reminder;
		  reminder = this._$tasksmodel.getById(taskID).reminder;
		  if (reminder !== null && reminder.type === 'DURATION' && reminder.duration.params.related === 'END') {
			this.deleteReminderDate(taskID);
		  }
		  this._$tasksmodel.setDueDate(taskID, null);
		  return this._persistence.setDueDate(taskID, false);
		};

		TasksBusinessLayer.prototype.initStartDate = function(taskID) {
		  var start;
		  start = moment(this._$tasksmodel.getById(taskID).start, "YYYYMMDDTHHmmss");
		  if (!start.isValid()) {
			return this.setStart(taskID, moment().startOf('hour').add(1, 'h'), 'time');
		  }
		};

		TasksBusinessLayer.prototype.setStart = function(taskID, date, type) {
		  var start;
		  if (type == null) {
			type = 'day';
		  }
		  start = moment(this._$tasksmodel.getById(taskID).start, "YYYYMMDDTHHmmss");
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
		  } else {
			return;
		  }
		  this._$tasksmodel.setStartDate(taskID, start.format('YYYYMMDDTHHmmss'));
		  this.checkReminderDate(taskID);
		  return this._persistence.setStartDate(taskID, start.isValid() ? start.unix() : false);
		};

		TasksBusinessLayer.prototype.deleteStartDate = function(taskID) {
		  var reminder;
		  reminder = this._$tasksmodel.getById(taskID).reminder;
		  if (reminder !== null && reminder.type === 'DURATION' && reminder.duration.params.related === 'START') {
			this.deleteReminderDate(taskID);
		  }
		  this._$tasksmodel.setStartDate(taskID, null);
		  return this._persistence.setStartDate(taskID, false);
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
		  if (type == null) {
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

		TasksBusinessLayer.prototype.changeCalendarId = function(taskID, calendarID) {
		  var child, childID, childrenID, parent, parentID, task, _i, _len;
		  this._$tasksmodel.changeCalendarId(taskID, calendarID);
		  this._persistence.changeCalendarId(taskID, calendarID);
		  childrenID = this._$tasksmodel.getChildrenID(taskID);
		  task = this._$tasksmodel.getById(taskID);
		  for (_i = 0, _len = childrenID.length; _i < _len; _i++) {
			childID = childrenID[_i];
			child = this._$tasksmodel.getById(childID);
			if (child.calendarid !== task.calendarid) {
			  this.changeCalendarId(childID, task.calendarid);
			}
		  }
		  if (!this._$tasksmodel.hasNoParent(task)) {
			parentID = this._$tasksmodel.getIdByUid(task.related);
			parent = this._$tasksmodel.getById(parentID);
			if (parent.calendarid !== task.calendarid) {
			  return this.changeParent(taskID, '', '');
			}
		  }
		};

		TasksBusinessLayer.prototype.setTaskNote = function(taskID, note) {
		  return this._persistence.setTaskNote(taskID, note);
		};

		TasksBusinessLayer.prototype.setTaskName = function(taskID, name) {
		  return this._persistence.setTaskName(taskID, name);
		};

		TasksBusinessLayer.prototype.changeCollection = function(taskID, collectionID) {
		  switch (collectionID) {
			case 'starred':
			  return this.starTask(taskID);
			case 'completed':
			  return this.completeTask(taskID);
			case 'uncompleted':
			  return this.uncompleteTask(taskID);
			case 'today':
			  return this.setDue(taskID, moment().startOf('day').add(12, 'h'), 'all');
			case 'week':
			case 'all':
			  return false;
			default:
			  return false;
		  }
		};

		TasksBusinessLayer.prototype.changeParent = function(taskID, parentID, collectionID) {
		  var parent, related, task;
		  task = this._$tasksmodel.getById(taskID);
		  if (parentID) {
			parent = this._$tasksmodel.getById(parentID);
			this.unhideSubtasks(parentID);
			related = parent.uid;
			if (parent.completed && !task.completed) {
			  this.uncompleteTask(parentID);
			}
			if (parent.calendarid !== task.calendarid) {
			  this.changeCalendarId(taskID, parent.calendarid);
			}
		  } else {
			related = "";
			if (collectionID !== "completed" && task.completed) {
			  this.uncompleteTask(taskID);
			}
		  }
		  this._$tasksmodel.changeParent(taskID, related);
		  return this._persistence.changeParent(taskID, related);
		};

		TasksBusinessLayer.prototype.updateModel = function() {
		  var success,
			_this = this;
		  this._$tasksmodel.voidAll();
		  success = function() {
			return _this._$tasksmodel.removeVoid();
		  };
		  return this._persistence.getTasks('init', 'all', success, true);
		};

		TasksBusinessLayer.prototype.setShowHidden = function(showHidden) {
		  return this._persistence.setShowHidden(showHidden);
		};

		TasksBusinessLayer.prototype.addComment = function(comment, onSuccess, onFailure) {
		  var success,
			_this = this;
		  if (onSuccess == null) {
			onSuccess = null;
		  }
		  if (onFailure == null) {
			onFailure = null;
		  }
		  onSuccess || (onSuccess = function() {});
		  onFailure || (onFailure = function() {});
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

		TasksBusinessLayer.prototype.getCompletedTasks = function(listID) {
		  return this._persistence.getTasks('completed', listID);
		};

		TasksBusinessLayer.prototype.addCategory = function(taskID, category) {
		  return this._persistence.addCategory(taskID, category);
		};

		TasksBusinessLayer.prototype.removeCategory = function(taskID, category) {
		  return this._persistence.removeCategory(taskID, category);
		};

		return TasksBusinessLayer;

	  })();
	  return new TasksBusinessLayer(TasksModel, Persistence, VTodoService);
	}
]);

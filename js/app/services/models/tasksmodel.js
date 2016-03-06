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

(function() {
  var __hasProp = {}.hasOwnProperty,
	__extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	__indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  angular.module('Tasks').factory('TasksModel', [
	'_Model', function(_Model) {
		var TasksModel;
		TasksModel = (function(_super) {
			__extends(TasksModel, _super);

			function TasksModel() {
				this._tmpIdCache = {};
				TasksModel.__super__.constructor.call(this);
			}

			TasksModel.prototype.ad = function(task, clearCache) {
				if (clearCache == null) {
					clearCache = true;
				}
				var updateByUri = angular.isDefined(task.uri) && angular.isDefined(this.getByUri(task.uri));
				if (updateByUri) {
					return this.update(task, clearCache);
				} else {
					if (angular.isDefined(task.uri)) {
						if (clearCache) {
							this._invalidateCache();
						}
						if (angular.isDefined(this._dataMap[task.uri])) {

						} else {
							this._data.push(task);
							return this._dataMap[task.uri] = task;
						}
					}
				}
			};

			TasksModel.prototype.getByUri = function(uri) {
				return this._dataMap[uri];
			};

		TasksModel.prototype.add = function(task, clearCache) {
		  var tmptask, updateById, updateByTmpId;
		  if (clearCache == null) {
			clearCache = true;
		  }
		  tmptask = this._tmpIdCache[task.tmpID];
		  updateById = angular.isDefined(task.id) && angular.isDefined(this.getById(task.id));
		  updateByTmpId = angular.isDefined(tmptask);
		  if (updateById || updateByTmpId) {
			return this.update(task, clearCache);
		  } else {
			if (angular.isDefined(task.id) && angular.isUndefined(task.tmpID)) {
			  return TasksModel.__super__.add.call(this, task, clearCache);
			} else {
			  this._tmpIdCache[task.tmpID] = task;
			  this._data.push(task);
			  if (clearCache) {
				return this._invalidateCache();
			  }
			}
		  }
		};

		TasksModel.prototype.update = function(task, clearCache) {
		  var tmptask;
		  if (clearCache == null) {
			clearCache = true;
		  }
		  tmptask = this._tmpIdCache[task.tmpID];
		  if (angular.isDefined(task.id) && angular.isDefined(tmptask)) {
			tmptask.id = task.id;
			this._dataMap[task.id] = tmptask;
		  }
		  task["void"] = false;
		  return TasksModel.__super__.update.call(this, task, clearCache);
		};

		TasksModel.prototype.removeById = function(taskID) {
		  return TasksModel.__super__.removeById.call(this, taskID);
		};

		TasksModel.prototype.voidAll = function() {
		  var task, tasks, _i, _len, _results;
		  tasks = this.getAll();
		  _results = [];
		  for (_i = 0, _len = tasks.length; _i < _len; _i++) {
			task = tasks[_i];
			_results.push(task["void"] = true);
		  }
		  return _results;
		};

		TasksModel.prototype.removeVoid = function() {
		  var id, task, taskIDs, tasks, _i, _j, _len, _len1, _results;
		  tasks = this.getAll();
		  taskIDs = [];
		  for (_i = 0, _len = tasks.length; _i < _len; _i++) {
			task = tasks[_i];
			if (task["void"]) {
			  taskIDs.push(task.id);
			}
		  }
		  _results = [];
		  for (_j = 0, _len1 = taskIDs.length; _j < _len1; _j++) {
			id = taskIDs[_j];
			_results.push(this.removeById(id));
		  }
		  return _results;
		};

		TasksModel.prototype.removeByList = function(listID) {
		  var id, task, taskIDs, tasks, _i, _j, _len, _len1, _results;
		  tasks = this.getAll();
		  taskIDs = [];
		  for (_i = 0, _len = tasks.length; _i < _len; _i++) {
			task = tasks[_i];
			if (task.calendarid === listID) {
			  taskIDs.push(task.id);
			}
		  }
		  _results = [];
		  for (_j = 0, _len1 = taskIDs.length; _j < _len1; _j++) {
			id = taskIDs[_j];
			_results.push(this.removeById(id));
		  }
		  return _results;
		};

		TasksModel.prototype.taskAtDay = function(task, date) {
		  var diff, due, duediff, start, startdiff;
		  start = moment(task.start, "YYYYMMDDTHHmmss");
		  due = moment(task.due, "YYYYMMDDTHHmmss");
		  if (start.isValid() && !due.isValid()) {
			diff = start.diff(moment().startOf('day'), 'days', true);
			if (!date && diff < date + 1) {
			  return true;
			} else if (diff < date + 1 && diff >= date) {
			  return true;
			}
		  }
		  if (due.isValid() && !start.isValid()) {
			diff = due.diff(moment().startOf('day'), 'days', true);
			if (!date && diff < date + 1) {
			  return true;
			} else if (diff < date + 1 && diff >= date) {
			  return true;
			}
		  }
		  if (start.isValid() && due.isValid()) {
			startdiff = start.diff(moment().startOf('day'), 'days', true);
			duediff = due.diff(moment().startOf('day'), 'days', true);
			if (!date && (startdiff < date + 1 || duediff < date + 1)) {
			  return true;
			} else if (startdiff < date + 1 && startdiff >= date && duediff >= date) {
			  return true;
			} else if (duediff < date + 1 && duediff >= date && startdiff >= date) {
			  return true;
			}
		  }
		  return false;
		};

		TasksModel.prototype.isLoaded = function(task) {
		  if (this.getById(task.id)) {
			return true;
		  } else {
			return false;
		  }
		};

		TasksModel.prototype.hasSubtasks = function(uid) {
		  var task, tasks, _i, _len;
		  tasks = this.getAll();
		  for (_i = 0, _len = tasks.length; _i < _len; _i++) {
			task = tasks[_i];
			if (task.related === uid) {
			  return true;
			}
		  }
		  return false;
		};

		TasksModel.prototype.hasNoParent = function(task) {
		  var t, tasks, _i, _len;
		  if (!task.related) {
			return true;
		  } else {
			tasks = this.getAll();
			for (_i = 0, _len = tasks.length; _i < _len; _i++) {
			  t = tasks[_i];
			  if (task.related === t.uid) {
				return false;
			  }
			}
			return true;
		  }
		};

		TasksModel.prototype.getIdByUid = function(uid) {
		  var task, tasks, _i, _len;
		  tasks = this.getAll();
		  for (_i = 0, _len = tasks.length; _i < _len; _i++) {
			task = tasks[_i];
			if (task.uid === uid) {
			  return task.id;
			}
		  }
		  return false;
		};

		TasksModel.prototype.getChildrenID = function(taskID) {
		  var childrenID, t, task, tasks, _i, _len;
		  task = this.getById(taskID);
		  tasks = this.getAll();
		  childrenID = [];
		  for (_i = 0, _len = tasks.length; _i < _len; _i++) {
			t = tasks[_i];
			if (t.related === task.uid) {
			  childrenID.push(t.id);
			}
		  }
		  return childrenID;
		};

		TasksModel.prototype.getDescendantID = function(taskID) {
		  var childID, childrenID, descendantID, _i, _len;
		  childrenID = this.getChildrenID(taskID);
		  descendantID = [];
		  descendantID = descendantID.concat(childrenID);
		  for (_i = 0, _len = childrenID.length; _i < _len; _i++) {
			childID = childrenID[_i];
			descendantID = descendantID.concat(this.getDescendantID(childID));
		  }
		  return descendantID;
		};

			TasksModel.prototype.filterTasks = function(task, filter) {
					switch (filter) {
					case 'completed':
						return task.completed === true;
					case 'all':
						return task.completed === false;
					case 'current':
						return task.completed === false && this.current(task.start, task.due);
					case 'starred':
						return task.completed === false && task.priority > 5;
					case 'today':
						return task.completed === false && (this.today(task.start) || this.today(task.due));
					case 'week':
						return task.completed === false && (this.week(task.start) || this.week(task.due));
					default:
						return '' + task.calendaruri === '' + filter;
				}
			};

		TasksModel.prototype.filteredTasks = function(needle) {
		  var ancestors, parentID, ret, task, tasks, _i, _len;
		  ret = [];
		  tasks = this.getAll();
		  if (!needle) {
			ret = tasks;
		  } else {
			for (_i = 0, _len = tasks.length; _i < _len; _i++) {
			  task = tasks[_i];
			  if (this.filterTasksByString(task, needle)) {
				if (this.objectExists(task, ret)) {
				  continue;
				}
				ret.push(task);
				parentID = this.getIdByUid(task.related);
				ancestors = this.getAncestor(parentID, ret);
				if (ancestors) {
				  ret = ret.concat(ancestors);
				}
			  }
			}
		  }
		  return ret;
		};

		TasksModel.prototype.objectExists = function(task, ret) {
		  var re, _i, _len;
		  for (_i = 0, _len = ret.length; _i < _len; _i++) {
			re = ret[_i];
			if (re.id === task.id) {
			  return true;
			}
		  }
		  return false;
		};

		TasksModel.prototype.getAncestor = function(taskID, ret) {
		  var ancestors, parentID, task, tasks;
		  tasks = [];
		  task = this.getById(taskID);
		  if (task) {
			if (this.objectExists(task, ret)) {
			  return tasks;
			}
			tasks.push(task);
			if (this.hasNoParent(task)) {
			  return tasks;
			}
			parentID = this.getIdByUid(task.related);
			ancestors = this.getAncestor(parentID, ret);
			if (ancestors) {
			  tasks = tasks.concat(ancestors);
			}
		  }
		  return tasks;
		};

		TasksModel.prototype.filterTasksByString = function(task, filter) {
		  var category, comment, key, keys, value, _i, _j, _len, _len1, _ref, _ref1;
		  keys = ['name', 'note', 'location', 'categories', 'comments'];
		  filter = filter.toLowerCase();
		  for (key in task) {
			value = task[key];
			if (__indexOf.call(keys, key) >= 0) {
			  if (key === 'comments') {
				_ref = task.comments;
				for (_i = 0, _len = _ref.length; _i < _len; _i++) {
				  comment = _ref[_i];
				  if (comment.comment.toLowerCase().indexOf(filter) !== -1) {
					return true;
				  }
				}
			  } else if (key === 'categories') {
				_ref1 = task.categories;
				for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
				  category = _ref1[_j];
				  if (category.toLowerCase().indexOf(filter) !== -1) {
					return true;
				  }
				}
			  } else if (value.toLowerCase().indexOf(filter) !== -1) {
				return true;
			  }
			}
		  }
		  return false;
		};

		TasksModel.prototype.hideSubtasks = function(taskID) {
		  return this.getById(taskID).hidesubtasks;
		};

		TasksModel.prototype.setHideSubtasks = function(taskID, hide) {
		  return this.update({
			id: taskID,
			hidesubtasks: hide
		  });
		};

		TasksModel.prototype.setDueDate = function(taskID, date) {
		  return this.update({
			id: taskID,
			due: date
		  });
		};

		TasksModel.prototype.setReminder = function(taskID, reminder) {
		  return this.update({
			id: taskID,
			reminder: reminder
		  });
		};

		TasksModel.prototype.setStartDate = function(taskID, date) {
		  return this.update({
			id: taskID,
			start: date
		  });
		};

		TasksModel.prototype.overdue = function(due) {
		  return moment(due, "YYYYMMDDTHHmmss").isValid() && moment(due, "YYYYMMDDTHHmmss").diff(moment()) < 0;
		};

		TasksModel.prototype.due = function(due) {
		  return moment(due, 'YYYYMMDDTHHmmss').isValid();
		};

		TasksModel.prototype.today = function(due) {
		  return moment(due, "YYYYMMDDTHHmmss").isValid() && moment(due, "YYYYMMDDTHHmmss").diff(moment().startOf('day'), 'days', true) < 1;
		};

		TasksModel.prototype.week = function(due) {
		  return moment(due, "YYYYMMDDTHHmmss").isValid() && moment(due, "YYYYMMDDTHHmmss").diff(moment().startOf('day'), 'days', true) < 7;
		};

		TasksModel.prototype.current = function(start, due) {
		  return !moment(start, "YYYYMMDDTHHmmss").isValid() || moment(start, "YYYYMMDDTHHmmss").diff(moment(), 'days', true) < 0 || moment(due, "YYYYMMDDTHHmmss").diff(moment(), 'days', true) < 0;
		};

		TasksModel.prototype.changeCalendarId = function(taskID, calendarID) {
		  return this.update({
			id: taskID,
			calendarid: calendarID
		  });
		};

		TasksModel.prototype.changeParent = function(taskID, related) {
		  return this.update({
			id: taskID,
			related: related
		  });
		};

		TasksModel.prototype.setNote = function(taskID, note) {
		  return this.update({
			id: taskID,
			note: note
		  });
		};

		TasksModel.prototype.addComment = function(comment) {
		  var task;
		  task = this.getById(comment.taskID);
		  if (task.comments) {
			return task.comments.push(comment);
		  } else {
			return task.comments = [comment];
		  }
		};

		TasksModel.prototype.updateComment = function(comment) {
		  var com, i, task, _i, _len, _ref, _results;
		  task = this.getById(comment.taskID);
		  i = 0;
		  _ref = task.comments;
		  _results = [];
		  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
			com = _ref[_i];
			if (com.tmpID === comment.tmpID) {
			  task.comments[i] = comment;
			  break;
			}
			_results.push(i++);
		  }
		  return _results;
		};

		TasksModel.prototype.deleteComment = function(taskID, commentID) {
		  var comment, i, task, _i, _len, _ref, _results;
		  task = this.getById(taskID);
		  i = 0;
		  _ref = task.comments;
		  _results = [];
		  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
			comment = _ref[_i];
			if (comment.id === commentID) {
			  task.comments.splice(i, 1);
			  break;
			}
			_results.push(i++);
		  }
		  return _results;
		};

		return TasksModel;

	  })(_Model);
	  return new TasksModel();
	}
  ]);

}).call(this);

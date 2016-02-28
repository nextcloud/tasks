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
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  angular.module('Tasks').controller('TasksController', [
	'$scope', '$window', '$routeParams', 'TasksModel', 'ListsModel', 'CollectionsModel', 'TasksBusinessLayer', '$location', 'SettingsBusinessLayer', 'SearchBusinessLayer', function($scope, $window, $routeParams, TasksModel, ListsModel, CollectionsModel, TasksBusinessLayer, $location, SettingsBusinessLayer, SearchBusinessLayer) {
	  var TasksController;
	  TasksController = (function() {
		function TasksController(_$scope, _$window, _$routeParams, _$tasksmodel, _$listsmodel, _$collectionsmodel, _tasksbusinesslayer, $location, _settingsbusinesslayer, _searchbusinesslayer) {
		  var _this = this;
		  this._$scope = _$scope;
		  this._$window = _$window;
		  this._$routeParams = _$routeParams;
		  this._$tasksmodel = _$tasksmodel;
		  this._$listsmodel = _$listsmodel;
		  this._$collectionsmodel = _$collectionsmodel;
		  this._tasksbusinesslayer = _tasksbusinesslayer;
		  this.$location = $location;
		  this._settingsbusinesslayer = _settingsbusinesslayer;
		  this._searchbusinesslayer = _searchbusinesslayer;
		  this._$scope.tasks = this._$tasksmodel.getAll();
		  this._$scope.draggedTasks = [];
		  this._$scope.lists = this._$listsmodel.getAll();
		  this._$scope.days = [0, 1, 2, 3, 4, 5, 6];
		  this._$scope.isAddingTask = false;
		  this._$scope.focusInputField = false;
		  this._$scope.TasksModel = this._$tasksmodel;
		  this._$scope.TasksBusinessLayer = this._tasksbusinesslayer;
		  this._$scope.getAddString = function() {
			var calendar;
			if (angular.isDefined(calendar = _$listsmodel.getStandardList())) {
			  if (angular.isDefined(_$scope.route.collectionID)) {
				switch (_$scope.route.collectionID) {
				  case 'starred':
					return t('tasks', 'Add an important item in "%s"...').replace('%s', calendar.displayname);
				  case 'today':
					return t('tasks', 'Add an item due today in "%s"...').replace('%s', calendar.displayname);
				  case 'all':
					return t('tasks', 'Add an item in "%s"...').replace('%s', calendar.displayname);
				  case 'current':
					return t('tasks', 'Add a current item in "%s"...').replace('%s', calendar.displayname);
				  case 'completed':
				  case 'week':
					return null;
				}
			  } else {
				if (angular.isDefined(_$listsmodel.getByUri(_$scope.route.calendarID))) {
				  return t('tasks', 'Add an item in "%s"...').replace('%s', _$listsmodel.getByUri(_$scope.route.calendarID).displayname);
				}
			  }
			}
		  };
		  this._$scope.getSubAddString = function(taskname) {
			return t('tasks', 'Add a subtask to "%s"...').replace('%s', taskname);
		  };
		  this._$scope.showSubtaskInput = function(uid) {
			return _$scope.status.addSubtaskTo = uid;
		  };
		  this._$scope.hideSubtasks = function(task) {
			var descendants, _ref;
			descendants = _$tasksmodel.getDescendantID(task.id);
			if (task.id === _$scope.route.taskID) {
			  return false;
			} else if (_ref = _$scope.route.taskID, __indexOf.call(descendants, _ref) >= 0) {
			  return false;
			} else {
			  return task.hidesubtasks;
			}
		  };
		  this._$scope.showInput = function() {
			var _ref;
			if ((_ref = _$scope.route.listID) === 'completed' || _ref === 'week') {
			  return false;
			} else {
			  return true;
			}
		  };
		  this._$scope.focusTaskInput = function() {
			return _$scope.status.focusTaskInput = true;
		  };
		  this._$scope.focusSubtaskInput = function() {
			return _$scope.status.focusSubtaskInput = true;
		  };
		  this._$scope.openDetails = function(id, $event) {
			var listID;
			if ($($event.currentTarget).is($($event.target).closest('.handler'))) {
			  listID = _$scope.route.listID;
			  return $location.path('/lists/' + listID + '/tasks/' + id);
			}
		  };
		  this._$scope.toggleCompleted = function(taskID) {
			if (_$tasksmodel.completed(taskID)) {
			  return _tasksbusinesslayer.uncompleteTask(taskID);
			} else {
			  return _tasksbusinesslayer.completeTask(taskID);
			}
		  };
		  this._$scope.toggleStarred = function(taskID) {
			if (_$tasksmodel.starred(taskID)) {
			  return _tasksbusinesslayer.unstarTask(taskID);
			} else {
				_$tasksmodel.star(taskID);
				return _tasksbusinesslayer.starTask(taskID);
			}
		  };
		  this._$scope.toggleHidden = function() {
			return _settingsbusinesslayer.toggle('various', 'showHidden');
		  };
		  this._$scope.filterTasks = function(task, filter) {
			return function(task) {
			  return _$tasksmodel.filterTasks(task, filter);
			};
		  };
		  this._$scope.getSubTasks = function(tasks, parent) {
			var ret, task, _i, _len;
			ret = [];
			for (_i = 0, _len = tasks.length; _i < _len; _i++) {
			  task = tasks[_i];
			  if (task.related === parent.uid) {
				ret.push(task);
			  }
			}
			return ret;
		  };
		  this._$scope.hasNoParent = function(task) {
			return function(task) {
			  return _$tasksmodel.hasNoParent(task);
			};
		  };
		  this._$scope.hasSubtasks = function(task) {
			return _$tasksmodel.hasSubtasks(task.uid);
		  };
		  this._$scope.toggleSubtasks = function(taskID) {
			if (_$tasksmodel.hideSubtasks(taskID)) {
			  return _tasksbusinesslayer.unhideSubtasks(taskID);
			} else {
			  return _tasksbusinesslayer.hideSubtasks(taskID);
			}
		  };
		  this._$scope.filterTasksByString = function(task) {
			return function(task) {
			  var filter;
			  filter = _searchbusinesslayer.getFilter();
			  return _$tasksmodel.filterTasksByString(task, filter);
			};
		  };
		  this._$scope.filteredTasks = function() {
			var filter;
			filter = _searchbusinesslayer.getFilter();
			return _$tasksmodel.filteredTasks(filter);
		  };
		  this._$scope.dayHasEntry = function() {
			return function(date) {
			  var filter, task, tasks, _i, _len;
			  filter = _searchbusinesslayer.getFilter();
			  tasks = _$tasksmodel.filteredTasks(filter);
			  for (_i = 0, _len = tasks.length; _i < _len; _i++) {
				task = tasks[_i];
				if (task.completed || !_$tasksmodel.hasNoParent(task)) {
				  continue;
				}
				if (_$tasksmodel.taskAtDay(task, date)) {
				  return true;
				}
			  }
			  return false;
			};
		  };
		  this._$scope.taskAtDay = function(task, day) {
			return function(task) {
			  return _$tasksmodel.taskAtDay(task, day);
			};
		  };
		  this._$scope.filterLists = function() {
			return function(list) {
			  return _$scope.getCount(list.id, _$scope.route.listID);
			};
		  };
		  this._$scope.getCount = function(listID, type) {
			var filter;
			filter = _searchbusinesslayer.getFilter();
			return _$listsmodel.getCount(listID, type, filter);
		  };
		  this._$scope.getCountString = function(listID, type) {
			var filter;
			filter = _searchbusinesslayer.getFilter();
			return n('tasks', '%n Completed Task', '%n Completed Tasks', _$listsmodel.getCount(listID, type, filter));
		  };
		  this._$scope.addTask = function(taskName, related, calendarid) {
			var task, _ref,
			  _this = this;
			if (related == null) {
			  related = '';
			}
			if (calendarid == null) {
			  calendarid = '';
			}
			_$scope.isAddingTask = true;
			task = {
			  tmpID: 'newTask' + Date.now(),
			  id: 'newTask' + Date.now(),
			  calendarid: null,
			  related: related,
			  name: taskName,
			  starred: false,
			  priority: '0',
			  due: false,
			  start: false,
			  reminder: null,
			  completed: false,
			  complete: '0',
			  note: false
			};
			if (((_ref = _$scope.route.listID) === 'starred' || _ref === 'today' || _ref === 'week' || _ref === 'all' || _ref === 'completed' || _ref === 'current')) {
			  if (related) {
				task.calendarid = calendarid;
			  } else {
				task.calendarid = _$listsmodel.getStandardList();
			  }
			  if (_$scope.route.listID === 'starred') {
				task.starred = true;
			  }
			  if (_$scope.route.listID === 'today') {
				task.due = moment().startOf('day').format("YYYYMMDDTHHmmss");
			  }
			  if (_$scope.route.listID === 'current') {
				task.start = moment().format("YYYYMMDDTHHmmss");
			  }
			} else {
			  task.calendarid = _$scope.route.listID;
			}
			_tasksbusinesslayer.addTask(task, function(data) {
			  _$tasksmodel.add(data);
			  return _$scope.isAddingTask = false;
			}, function() {
			  return _$scope.isAddingTask = false;
			});
			_$scope.status.focusTaskInput = false;
			_$scope.status.focusSubtaskInput = false;
			_$scope.status.addSubtaskTo = '';
			_$scope.status.taskName = '';
			return _$scope.status.subtaskName = '';
		  };
		  this._$scope.checkTaskInput = function($event) {
			if ($event.keyCode === 27) {
			  $($event.currentTarget).blur();
			  _$scope.status.taskName = '';
			  _$scope.status.subtaskName = '';
			  _$scope.status.addSubtaskTo = '';
			  _$scope.status.focusTaskInput = false;
			  return _$scope.status.focusSubtaskInput = false;
			}
		  };
		  this._$scope.getCompletedTasks = function(listID) {
			return _tasksbusinesslayer.getCompletedTasks(listID);
		  };
		  this._$scope.loadedAll = function(listID) {
			return _$listsmodel.loadedAll(listID);
		  };
		  this._$scope.sortDue = function(task) {
			if (task.due === null) {
			  return 'last';
			} else {
			  return task.due;
			}
		  };
		  this._$scope.getTaskColor = function(listID) {
			return _$listsmodel.getColor(listID);
		  };
		  this._$scope.getTaskList = function(listID) {
			return _$listsmodel.getName(listID);
		  };
		  this._$scope.dropCallback = function($event, item, index) {
			var collectionID, listID, parentID, taskID;
			taskID = item.id;
			$('.subtasks-container').removeClass('dropzone-visible');
			parentID = $('li.dndPlaceholder').closest('.task-item').attr('taskID');
			parentID = parentID || "";
			if (parentID === taskID) {
			  parentID = "";
			}
			collectionID = $('li.dndPlaceholder').closest('ol[dnd-list]').attr('collectionID');
			if (collectionID) {
			  _tasksbusinesslayer.changeCollection(taskID, collectionID);
			}
			listID = $('li.dndPlaceholder').closest('ol[dnd-list]').attr('listID');
			if (listID) {
			  _tasksbusinesslayer.changeCalendarId(taskID, listID);
			}
			_tasksbusinesslayer.changeParent(taskID, parentID, collectionID);
			return true;
		  };
		  this._$scope.dragover = function($event, item, index) {
			$('.subtasks-container').removeClass('dropzone-visible');
			$($event.target).closest('.task-item').children('.subtasks-container').addClass('dropzone-visible');
			return true;
		  };
		}

		return TasksController;

	  })();
	  return new TasksController($scope, $window, $routeParams, TasksModel, ListsModel, CollectionsModel, TasksBusinessLayer, $location, SettingsBusinessLayer, SearchBusinessLayer);
	}
  ]);

}).call(this);

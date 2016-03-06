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
	'$scope', '$window', '$routeParams', 'TasksModel', 'ListsModel', 'CollectionsModel', 'TasksBusinessLayer', '$location', 'SettingsBusinessLayer', 'SearchBusinessLayer', 'VTodo', function($scope, $window, $routeParams, TasksModel, ListsModel, CollectionsModel, TasksBusinessLayer, $location, SettingsBusinessLayer, SearchBusinessLayer, VTodo) {
	  var TasksController;
	  TasksController = (function() {
		function TasksController(_$scope, _$window, _$routeParams, _$tasksmodel, _$listsmodel, _$collectionsmodel, _tasksbusinesslayer, $location, _settingsbusinesslayer, _searchbusinesslayer, vtodo) {
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
			this._vtodo = vtodo;
			this._$scope.tasks = this._$tasksmodel.getAll();
			this._$scope.draggedTasks = [];
			this._$scope.calendars = this._$listsmodel.getAll();
			this._$scope.days = [0, 1, 2, 3, 4, 5, 6];
			this._$scope.isAddingTask = false;
			this._$scope.focusInputField = false;
			this._$scope.TasksModel = this._$tasksmodel;
			this._$scope.TasksBusinessLayer = this._tasksbusinesslayer;

			this._$scope.addTask = function(taskName, related, calendar) {
				var _ref, _this = this;
				if (calendar == null) {
				  calendar = '';
				}
				_$scope.isAddingTask = true;
				var task = {
					calendar: null,
					related: related,
					summary: taskName,
					starred: false,
					priority: '0',
					due: false,
					start: false,
					reminder: null,
					completed: false,
					complete: '0',
					note: ''
				};
				if (((_ref = _$scope.route.listID) === 'starred' || _ref === 'today' || _ref === 'week' || _ref === 'all' || _ref === 'completed' || _ref === 'current')) {
					if (related) {
						task.calendar = calendar;
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
					task.calendar = _$listsmodel.getByUri(_$scope.route.calendarID);
				}
				task = VTodo.create(task);
				_tasksbusinesslayer.add(task).then(function(task) {
					_$scope.isAddingTask = false;
					return $scope.$apply();
				});
				_$scope.status.focusTaskInput = false;
				_$scope.status.focusSubtaskInput = false;
				_$scope.status.addSubtaskTo = null;
				_$scope.status.taskName = '';
				return _$scope.status.subtaskName = '';
			};

			this._$scope.getAddString = function() {
				var calendar = _$listsmodel.getStandardList();
				if (angular.isDefined(calendar)) {
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
				var taskID = _$scope.route.taskID;
				var descendantIDs = _$tasksmodel.getDescendantIDs(task);
				if (task.uri === taskID) {
					return false;
				} else if (__indexOf.call(descendantIDs, taskID) >= 0) {
					return false;
				} else {
					return task.hideSubtasks;
				}
			};

			this._$scope.showInput = function() {
				var collectionID = _$scope.route.collectionID;
				var calendar = _$listsmodel.getByUri(_$scope.route.calendarID);
				if (collectionID === 'completed' || collectionID === 'week') {
					return false;
				}
				if (angular.isDefined(calendar)) {
					return calendar.writable;
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
				var calendarID;
				var collectionID;
				if ($($event.currentTarget).is($($event.target).closest('.handler'))) {
					if (calendarID = _$scope.route.calendarID) {
						$location.path('/calendars/' + calendarID + '/tasks/' + id);
					} else if (collectionID = _$scope.route.collectionID) {
						$location.path('/collections/' + collectionID + '/tasks/' + id);
					}
				}
			};

			this._$scope.toggleCompleted = function(task) {
				if (task.completed) {
					_tasksbusinesslayer.setPercentComplete(task, 0);
				} else {
					_tasksbusinesslayer.setPercentComplete(task, 100);
				}
			};

			this._$scope.toggleStarred = function(task) {
				if (task.priority > 5) {
					_tasksbusinesslayer.setPriority(task, 0);
				} else {
					_tasksbusinesslayer.setPriority(task, 9);
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

			this._$scope.toggleSubtasks = function(task) {
				_tasksbusinesslayer.setHideSubtasks(task, !task.hideSubtasks);
			};

			this._$scope.filterTasksByString = function(task) {
				return function(task) {
					var filter = _searchbusinesslayer.getFilter();
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
			return function(calendar) {
			  return _$scope.getCount(calendar.uri, _$scope.route.collectionID);
			};
		  };
			this._$scope.getCount = function(calendarID, type) {
				var filter = _searchbusinesslayer.getFilter();
				return _$listsmodel.getCount(calendarID, type, filter);
			};
			this._$scope.getCountString = function(calendarID, type) {
				var filter = _searchbusinesslayer.getFilter();
				return n('tasks', '%n Completed Task', '%n Completed Tasks', _$listsmodel.getCount(calendarID, type, filter));
			};
		  this._$scope.checkTaskInput = function($event) {
			if ($event.keyCode === 27) {
			  $($event.currentTarget).blur();
			  _$scope.status.taskName = '';
			  _$scope.status.subtaskName = '';
			  _$scope.status.addSubtaskTo = null;
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
	  return new TasksController($scope, $window, $routeParams, TasksModel, ListsModel, CollectionsModel, TasksBusinessLayer, $location, SettingsBusinessLayer, SearchBusinessLayer, VTodo);
	}
  ]);

}).call(this);

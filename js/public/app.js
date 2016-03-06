(function(angular, $, oc_requesttoken, undefined){

/**
 * ownCloud Task App - v0.9.0
 *
 * Copyright (c) 2016 - Raimund Schlüßler <raimund.schluessler@googlemail.com>
 *
 * This file is licensed under the Affero			 General Public License version 3 or later.
 * See the COPYING file
 *
 */


(function() {
  angular.module('Tasks', ['ngRoute', 'ngAnimate', 'ui.select', 'ngSanitize', 'dndLists']).config([
	'$provide', '$routeProvider', '$interpolateProvider', '$httpProvider', function($provide, $routeProvider, $interpolateProvider, $httpProvider) {
	  var config;
	  $provide.value('Config', config = {
		markReadTimeout: 500,
		taskUpdateInterval: 1000 * 600
	  });
	  $httpProvider.defaults.headers.common['requesttoken'] = oc_requesttoken;
	  $routeProvider
	  .when('/calendars/:calendarID', {})
	  .when('/calendars/:calendarID/edit/:listparameter', {})
	  .when('/calendars/:calendarID/tasks/:taskID', {})
	  .when('/calendars/:calendarID/tasks/:taskID/settings', {})
	  .when('/calendars/:calendarID/tasks/:taskID/edit/:parameter', {})
	  .when('/collections/:collectionID/tasks/:taskID', {})
	  .when('/collections/:collectionID/tasks/:taskID/settings', {})
	  .when('/collections/:collectionID/tasks/:taskID/edit/:parameter', {})
	  .when('/collections/:collectionID', {})
	  .when('/search/:searchString', {})
	  .when('/search/:searchString/tasks/:taskID', {})
	  .when('/search/:searchString/tasks/:taskID/edit/:parameter', {});
	}
  ]);

  angular.module('Tasks').run([
	'$document', '$rootScope', 'Config', '$timeout', 'ListsBusinessLayer', 'TasksBusinessLayer', 'SearchBusinessLayer', function($document, $rootScope, Config, $timeout, TasksBusinessLayer, ListsBusinessLayer, SearchBusinessLayer) {
	  var init, update;
	  init = false;
	  (update = function() {
		var timeOutUpdate;
		timeOutUpdate = function() {
		  return $timeout(update, Config.taskUpdateInterval);
		};
		init = true;
		return timeOutUpdate();
	  })();
	  OCA.Search.tasks = SearchBusinessLayer;
	  $('link[rel="shortcut icon"]').attr('href', OC.filePath('tasks', 'img', 'favicon.png'));
	  $document.click(function(event) {
		$rootScope.$broadcast('documentClicked', event);
	  });
	  moment.locale('details', {
		calendar: {
		  lastDay: '[' + t('tasks', 'Due yesterday') + '], HH:mm',
		  sameDay: '[' + t('tasks', 'Due today') + '], HH:mm',
		  nextDay: '[' + t('tasks', 'Due tomorrow') + '], HH:mm',
		  lastWeek: '[' + t('tasks', 'Due on') + '] MMM DD, YYYY, HH:mm',
		  nextWeek: '[' + t('tasks', 'Due on') + '] MMM DD, YYYY, HH:mm',
		  sameElse: '[' + t('tasks', 'Due on') + '] MMM DD, YYYY, HH:mm'
		}
	  });
	  moment.locale('start', {
		calendar: {
		  lastDay: '[' + t('tasks', 'Started yesterday') + '], HH:mm',
		  sameDay: '[' + t('tasks', 'Starts today') + '], HH:mm',
		  nextDay: '[' + t('tasks', 'Starts tomorrow') + '], HH:mm',
		  lastWeek: '[' + t('tasks', 'Started on') + '] MMM DD, YYYY, HH:mm',
		  nextWeek: '[' + t('tasks', 'Starts on') + '] MMM DD, YYYY, HH:mm',
		  sameElse: function() {
			if (this.diff(moment()) > 0) {
			  return '[' + t('tasks', 'Starts on') + '] MMM DD, YYYY, HH:mm';
			} else {
			  return '[' + t('tasks', 'Started on') + '] MMM DD, YYYY, HH:mm';
			}
		  }
		}
	  });
	  moment.locale('reminder', {
		calendar: {
		  lastDay: t('tasks', '[Remind me yesterday at ]HH:mm'),
		  sameDay: t('tasks', '[Remind me today at ]HH:mm'),
		  nextDay: t('tasks', '[Remind me tomorrow at ]HH:mm'),
		  lastWeek: t('tasks', '[Remind me on ]MMM DD, YYYY,[ at ]HH:mm'),
		  nextWeek: t('tasks', '[Remind me on ]MMM DD, YYYY,[ at ]HH:mm'),
		  sameElse: t('tasks', '[Remind me on ]MMM DD, YYYY,[ at ]HH:mm')
		}
	  });
	  moment.locale('tasks', {
		calendar: {
		  lastDay: '[' + t('tasks', 'Yesterday') + ']',
		  sameDay: '[' + t('tasks', 'Today') + ']',
		  nextDay: '[' + t('tasks', 'Tomorrow') + ']',
		  lastWeek: 'DD.MM.YYYY',
		  nextWeek: 'DD.MM.YYYY',
		  sameElse: 'DD.MM.YYYY'
		}
	  });
	  moment.locale('details_short', {
		calendar: {
		  lastDay: '[' + t('tasks', 'Yesterday') + ']',
		  sameDay: '[' + t('tasks', 'Today') + ']',
		  nextDay: '[' + t('tasks', 'Tomorrow') + ']',
		  lastWeek: 'MMM DD, YYYY',
		  nextWeek: 'MMM DD, YYYY',
		  sameElse: 'MMM DD, YYYY'
		}
	  });
	  moment.locale('list_week', {
		calendar: {
		  lastDay: '[' + t('tasks', 'Yesterday') + ']',
		  sameDay: '[' + t('tasks', 'Today') + '], MMM. DD',
		  nextDay: '[' + t('tasks', 'Tomorrow') + '], MMM. DD',
		  lastWeek: 'ddd, MMM. DD',
		  nextWeek: 'ddd, MMM. DD',
		  sameElse: 'ddd, MMM. DD'
		}
	  });
	  return moment.locale('en', {
		relativeTime: {
		  future: t('tasks', "in %s"),
		  past: t('tasks', "%s ago"),
		  s: t('tasks', "seconds"),
		  m: t('tasks', "a minute"),
		  mm: t('tasks', "%d minutes"),
		  h: t('tasks', "an hour"),
		  hh: t('tasks', "%d hours"),
		  d: t('tasks', "a day"),
		  dd: t('tasks', "%d days"),
		  M: t('tasks', "a month"),
		  MM: t('tasks', "%d months"),
		  y: t('tasks', "a year"),
		  yy: t('tasks', "%d years")
		}
	  });
	}
  ]);

}).call(this);

angular.module('Tasks').controller('AppController', [
	'$scope', 'ListsBusinessLayer', '$route', 'Status', '$timeout', '$location', '$routeParams', 'Loading', 'SettingsModel', 'Persistence', function($scope, ListsBusinessLayer, $route, status, $timeout, $location, $routeParams, Loading, SettingsModel, Persistence) {
		var AppController;
		AppController = (function() {
			function AppController(_$scope, _$listsbusinesslayer, _$route, _$status, _$timeout, _$location, _$routeparams, _Loading, _$settingsmodel, _persistence) {
				this._$scope = _$scope;
				this._$listsbusinesslayer = _$listsbusinesslayer;
				this._$route = _$route;
				this._$status = _$status;
				this._$timeout = _$timeout;
				this._$location = _$location;
				this._$routeparams = _$routeparams;
				this._Loading = _Loading;
				this._$settingsmodel = _$settingsmodel;
				this._persistence = _persistence;
				this._$scope.status = this._$status.getStatus();
				this._$scope.route = this._$routeparams;
				this._$scope.status.newListName = "";
				this._$scope.settingsmodel = this._$settingsmodel;

				this._$listsbusinesslayer.init().then(function(results) {
					Promise.all(results).then(function() {
						$scope.$apply();
					})
				});

				this._persistence.init();

				this._$scope.closeAll = function($event) {
					if ($($event.target).closest('.close-all').length || $($event.currentTarget).is($($event.target).closest('.handler'))) {
						if (!angular.isUndefined(_$scope.route.calendarID)) {
							_$location.path('/calendars/' + _$scope.route.calendarID);
						} else if (!angular.isUndefined(_$scope.route.collectionID)) {
							_$location.path('/collections/' + _$scope.route.collectionID);
						} else {
							_$location.path('/collections/all');
						}
						_$scope.status.addingList = false;
						_$scope.status.focusTaskInput = false;
						_$scope.status.newListName = "";
					}
					if (!$($event.target).closest('.newList').length) {
						_$scope.status.addingList = false;
						_$scope.status.newListName = "";
					}
					if (!$($event.target).closest('.add-subtask').length) {
						_$scope.status.addSubtaskTo = null;
						return _$scope.status.focusSubtaskInput = false;
					}
				};
				this._$scope.isLoading = function() {
					return _Loading.isLoading();
				};
			}
			return AppController;
		})();
		return new AppController($scope, ListsBusinessLayer, $route, status, $timeout, $location, $routeParams, Loading, SettingsModel, Persistence);
	}
]);

(function() {
  angular.module('Tasks').controller('DetailsController', [
	'$scope', '$window', 'TasksModel', 'TasksBusinessLayer', '$route', '$location', '$timeout', '$routeParams', 'SettingsModel', 'Loading', function($scope, $window, TasksModel, TasksBusinessLayer, $route, $location, $timeout, $routeParams, SettingsModel, Loading) {
	  var DetailsController;
	  DetailsController = (function() {
		function DetailsController(_$scope, _$window, _$tasksmodel, _tasksbusinesslayer, _$route, _$location, _$timeout, _$routeparams, _$settingsmodel, _Loading) {
		  this._$scope = _$scope;
		  this._$window = _$window;
		  this._$tasksmodel = _$tasksmodel;
		  this._tasksbusinesslayer = _tasksbusinesslayer;
		  this._$route = _$route;
		  this._$location = _$location;
		  this._$timeout = _$timeout;
		  this._$routeparams = _$routeparams;
		  this._$settingsmodel = _$settingsmodel;
		  this._Loading = _Loading;
		  this._$scope.task = _$tasksmodel.getById(_$scope.route.taskID);
		  this._$scope.found = true;
		  this._$scope.$on('$routeChangeSuccess', function() {
			var task,
			  _this = this;
			task = _$tasksmodel.getById(_$scope.route.taskID);
			if (!(angular.isUndefined(task) || task === null)) {
			  _$scope.task = task;
			  return _$scope.found = true;
			} else if (_$scope.route.taskID !== void 0) {
			  _$scope.found = false;
			  return _tasksbusinesslayer.getTask(_$scope.route.taskID, function(data) {
				return _$scope.loadTask(_$scope.route.taskID);
			  });
			}
		  });
		  this._$scope.settingsmodel = this._$settingsmodel;
		  this._$scope.settingsmodel.add({
			'id': 'various',
			'categories': []
		  });
		  this._$scope.isAddingComment = false;
		  this._$scope.timers = [];
		  this._$scope.durations = [
			{
			  name: t('tasks', 'week'),
			  names: t('tasks', 'weeks'),
			  id: 'week'
			}, {
			  name: t('tasks', 'day'),
			  names: t('tasks', 'days'),
			  id: 'day'
			}, {
			  name: t('tasks', 'hour'),
			  names: t('tasks', 'hours'),
			  id: 'hour'
			}, {
			  name: t('tasks', 'minute'),
			  names: t('tasks', 'minutes'),
			  id: 'minute'
			}, {
			  name: t('tasks', 'second'),
			  names: t('tasks', 'seconds'),
			  id: 'second'
			}
		  ];
		  this._$scope.loadTask = function(taskID) {
			var task;
			task = _$tasksmodel.getById(_$scope.route.taskID);
			if (!(angular.isUndefined(task) || task === null)) {
			  _$scope.task = task;
			  return _$scope.found = true;
			}
		  };
		  this._$scope.TaskState = function() {
			if (_$scope.found) {
			  return 'found';
			} else {
			  if (_Loading.isLoading()) {
				return 'loading';
			  } else {
				return null;
			  }
			}
		  };
		  this._$scope.params = [
			{
			  name: t('tasks', 'before beginning'),
			  invert: true,
			  related: 'START',
			  id: "10"
			}, {
			  name: t('tasks', 'after beginning'),
			  invert: false,
			  related: 'START',
			  id: "00"
			}, {
			  name: t('tasks', 'before end'),
			  invert: true,
			  related: 'END',
			  id: "11"
			}, {
			  name: t('tasks', 'after end'),
			  invert: false,
			  related: 'END',
			  id: "01"
			}
		  ];
		  this._$scope.filterParams = function(params) {
			var task;
			task = _$tasksmodel.getById(_$scope.route.taskID);
			if (!(angular.isUndefined(task) || task === null)) {
			  if (task.due && task.start) {
				return params;
			  } else if (task.start) {
				return params.slice(0, 2);
			  } else {
				return params.slice(2);
			  }
			}
		  };
		  this._$scope.deleteTask = function(taskID) {
			return _$timeout(function() {
			  return _tasksbusinesslayer.deleteTask(taskID);
			}, 500);
		  };
		  this._$scope.editName = function($event) {
			if ($($event.target).is('a')) {

			} else {
			  console.log('open edit page');
			  return _$location.path('/lists/' + _$scope.route.listID + '/tasks/' + _$scope.route.taskID + '/edit/name');
			}
		  };
		  this._$scope.editDueDate = function($event) {
			if ($($event.currentTarget).is($($event.target).closest('.handler'))) {
			  _$location.path('/lists/' + _$scope.route.listID + '/tasks/' + _$scope.route.taskID + '/edit/duedate');
			  return _tasksbusinesslayer.initDueDate(_$scope.route.taskID);
			} else {

			}
		  };
		  this._$scope.editStart = function($event) {
			if ($($event.currentTarget).is($($event.target).closest('.handler'))) {
			  _$location.path('/lists/' + _$scope.route.listID + '/tasks/' + _$scope.route.taskID + '/edit/startdate');
			  return _tasksbusinesslayer.initStartDate(_$scope.route.taskID);
			} else {

			}
		  };
		  this._$scope.editReminder = function($event) {
			if ($($event.currentTarget).is($($event.target).closest('.handler'))) {
			  _$location.path('/lists/' + _$scope.route.listID + '/tasks/' + _$scope.route.taskID + '/edit/reminder');
			  return _tasksbusinesslayer.initReminder(_$scope.route.taskID);
			} else {

			}
		  };
		  this._$scope.editNote = function($event) {
			if ($($event.currentTarget).is($($event.target).closest('.handler'))) {
			  if ($($event.target).is('a')) {

			  } else {
				return _$location.path('/lists/' + _$scope.route.listID + '/tasks/' + _$scope.route.taskID + '/edit/note');
			  }
			} else {

			}
		  };
		  this._$scope.editPriority = function($event) {
			if ($($event.currentTarget).is($($event.target).closest('.handler'))) {
			  return _$location.path('/lists/' + _$scope.route.listID + '/tasks/' + _$scope.route.taskID + '/edit/priority');
			} else {

			}
		  };
		  this._$scope.editPercent = function($event) {
			if ($($event.currentTarget).is($($event.target).closest('.handler'))) {
			  return _$location.path('/lists/' + _$scope.route.listID + '/tasks/' + _$scope.route.taskID + '/edit/percent');
			} else {

			}
		  };
		  this._$scope.endEdit = function($event) {
			if ($($event.target).closest('.end-edit').length || $($event.currentTarget).is($($event.target).closest('.handler'))) {
			  return _$scope.resetRoute();
			} else {

			}
		  };
		  this._$scope.endName = function($event) {
			if ($event.keyCode === 13) {
			  $event.preventDefault();
			  _$scope.resetRoute();
			}
			if ($event.keyCode === 27) {
			  return _$scope.resetRoute();
			}
		  };
			this._$scope.resetRoute = function() {
				var calendarID;
				var collectionID;
				if (calendarID = _$scope.route.calendarID) {
					$location.path('/calendars/' + calendarID + '/tasks/' + _$scope.route.taskID);
				} else if (collectionID = _$scope.route.collectionID) {
					$location.path('/collections/' + collectionID + '/tasks/' + _$scope.route.taskID);
				}
			};
		  this._$scope.deleteDueDate = function() {
			return _tasksbusinesslayer.deleteDueDate(_$scope.route.taskID);
		  };
		  this._$scope.deletePercent = function() {
			return _tasksbusinesslayer.setPercentComplete(_$scope.route.taskID, 0);
		  };
		  this._$scope.deleteStartDate = function() {
			return _tasksbusinesslayer.deleteStartDate(_$scope.route.taskID);
		  };
		  this._$scope.deleteReminder = function() {
			return _tasksbusinesslayer.deleteReminderDate(_$scope.route.taskID);
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

		  this._$scope.deletePriority = function() {
			return _tasksbusinesslayer.unstarTask(_$scope.route.taskID);
		  };
		  this._$scope.isDue = function(date) {
			return _$tasksmodel.due(date);
		  };
		  this._$scope.isOverDue = function(date) {
			return _$tasksmodel.overdue(date);
		  };
		 //  this._$scope.$watch('task', function(newVal, oldVal) {
			// if (newVal === oldVal || (void 0 === newVal || void 0 === oldVal) || newVal.id !== oldVal.id) {

			// } else {
			//   if (newVal.name !== oldVal.name) {
			// 	if (_$scope.timers['task' + newVal.id + 'name']) {
			// 	  $timeout.cancel(_$scope.timers['task' + newVal.id + 'name']);
			// 	}
			// 	_$scope.timers['task' + newVal.id + 'name'] = $timeout(function() {
			// 	  return _tasksbusinesslayer.setTaskName(newVal.id, newVal.name);
			// 	}, 3000);
			//   }
			//   if (newVal.note !== oldVal.note) {
			// 	if (_$scope.timers['task' + newVal.id + 'note']) {
			// 	  $timeout.cancel(_$scope.timers['task' + newVal.id + 'note']);
			// 	}
			// 	_$scope.timers['task' + newVal.id + 'note'] = $timeout(function() {
			// 	  return _tasksbusinesslayer.setTaskNote(newVal.id, newVal.note);
			// 	}, 5000);
			//   }
			//   if (newVal.complete !== oldVal.complete) {
			// 	if (_$scope.timers['task' + newVal.id + 'complete']) {
			// 	  $timeout.cancel(_$scope.timers['task' + newVal.id + 'complete']);
			// 	}
			// 	_$scope.timers['task' + newVal.id + 'complete'] = $timeout(function() {
			// 	  return _tasksbusinesslayer.setPercentComplete(newVal.id, newVal.complete);
			// 	}, 1000);
			//   }
			//   if (newVal.priority !== oldVal.priority) {
			// 	if (_$scope.timers['task' + newVal.id + 'priority']) {
			// 	  $timeout.cancel(_$scope.timers['task' + newVal.id + 'priority']);
			// 	}
			// 	return _$scope.timers['task' + newVal.id + 'priority'] = $timeout(function() {
			// 	  return _tasksbusinesslayer.setPriority(newVal.id, newVal.priority);
			// 	}, 1000);
			//   }
			// }
		 //  }, true);
		  this._$scope.setstartday = function(date) {
			return _tasksbusinesslayer.setStart(_$scope.route.taskID, moment(date, 'MM/DD/YYYY'), 'day');
		  };
		  this._$scope.setstarttime = function(date) {
			return _tasksbusinesslayer.setStart(_$scope.route.taskID, moment(date, 'HH:mm'), 'time');
		  };
		  this._$scope.setdueday = function(date) {
			return _tasksbusinesslayer.setDue(_$scope.route.taskID, moment(date, 'MM/DD/YYYY'), 'day');
		  };
		  this._$scope.setduetime = function(date) {
			return _tasksbusinesslayer.setDue(_$scope.route.taskID, moment(date, 'HH:mm'), 'time');
		  };
		  this._$scope.setreminderday = function(date) {
			return _tasksbusinesslayer.setReminderDate(_$scope.route.taskID, moment(date, 'MM/DD/YYYY'), 'day');
		  };
		  this._$scope.setremindertime = function(date) {
			return _tasksbusinesslayer.setReminderDate(_$scope.route.taskID, moment(date, 'HH:mm'), 'time');
		  };
		  this._$scope.reminderType = function(task) {
			if (!angular.isUndefined(task)) {
			  if (task.reminder === null) {
				if (moment(task.start, "YYYYMMDDTHHmmss").isValid() || moment(task.due, "YYYYMMDDTHHmmss").isValid()) {
				  return 'DURATION';
				} else {
				  return 'DATE-TIME';
				}
			  } else {
				return task.reminder.type;
			  }
			}
		  };
		  this._$scope.changeReminderType = function(task) {
			_tasksbusinesslayer.checkReminderDate(task.id);
			if (this.reminderType(task) === 'DURATION') {
			  if (task.reminder) {
				task.reminder.type = 'DATE-TIME';
			  } else {
				task.reminder = {
				  type: 'DATE-TIME'
				};
			  }
			} else {
			  if (task.reminder) {
				task.reminder.type = 'DURATION';
			  } else {
				task.reminder = {
				  type: 'DURATION'
				};
			  }
			}
			return _tasksbusinesslayer.setReminder(task.id);
		  };
		  this._$scope.setReminderDuration = function(taskID) {
			return _tasksbusinesslayer.setReminder(_$scope.route.taskID);
		  };
		  this._$scope.addComment = function() {
			var comment,
			  _this = this;
			if (_$scope.CommentContent) {
			  _$scope.isAddingComment = true;
			  comment = {
				tmpID: 'newComment' + Date.now(),
				comment: _$scope.CommentContent,
				taskID: _$scope.route.taskID,
				time: moment().format('YYYYMMDDTHHmmss'),
				name: $('#expandDisplayName').text()
			  };
			  _tasksbusinesslayer.addComment(comment, function(data) {
				_$tasksmodel.updateComment(data);
				return _$scope.isAddingComment = false;
			  }, function() {
				return _$scope.isAddingComment = false;
			  });
			  return _$scope.CommentContent = '';
			}
		  };
		  this._$scope.sendComment = function(event) {
			if (event.keyCode === 13) {
			  return _$scope.addComment();
			}
		  };
		  this._$scope.deleteComment = function(commentID) {
			return _tasksbusinesslayer.deleteComment(_$scope.route.taskID, commentID);
		  };
		  this._$scope.commentStrings = function() {
			return {
			  button: t('tasks', 'Comment'),
			  input: t('tasks', 'Add a comment')
			};
		  };
		  this._$scope.addCategory = function(category, model) {
			var categories;
			_tasksbusinesslayer.addCategory(_$scope.route.taskID, category);
			categories = _$scope.settingsmodel.getById('various').categories;
			if (!(categories.indexOf(category) > -1)) {
			  return categories.push(category);
			}
		  };
		  this._$scope.removeCategory = function(category, model) {
			_tasksbusinesslayer.removeCategory(_$scope.route.taskID, category);
			return _$scope.resetRoute();
		  };
		}

		return DetailsController;

	  })();
	  return new DetailsController($scope, $window, TasksModel, TasksBusinessLayer, $route, $location, $timeout, $routeParams, SettingsModel, Loading);
	}
  ]);

}).call(this);

angular.module('Tasks').controller('ListController', [
	'$scope', '$window', '$routeParams', 'ListsModel', 'TasksBusinessLayer', 'CollectionsModel', 'ListsBusinessLayer', '$location', 'SearchBusinessLayer', 'CalendarService', function($scope, $window, $routeParams, ListsModel, TasksBusinessLayer, CollectionsModel, ListsBusinessLayer, $location, SearchBusinessLayer, CalendarService) {
	  var ListController;
	  ListController = (function() {
		function ListController(_$scope, _$window, _$routeParams, _$listsmodel, _$tasksbusinesslayer, _$collectionsmodel, _$listsbusinesslayer, $location, _$searchbusinesslayer, _$calendarservice) {
		
			this._$scope = _$scope;
			this._$window = _$window;
			this._$routeParams = _$routeParams;
			this._$listsmodel = _$listsmodel;
			this._$tasksbusinesslayer = _$tasksbusinesslayer;
			this._$collectionsmodel = _$collectionsmodel;
			this._$listsbusinesslayer = _$listsbusinesslayer;
			this.$location = $location;
			this._$searchbusinesslayer = _$searchbusinesslayer;
			this._$calendarservice = _$calendarservice;
			this._$scope.collections = this._$collectionsmodel.getAll();
			this._$scope.calendars = this._$listsmodel.getAll();
			this._$scope.draggedTasks = [];
			this._$scope.TasksBusinessLayer = this._$tasksbusinesslayer;

			this._$scope["delete"] = function(calendar) {
				var really;
				really = confirm(t('tasks', 'This will delete the Calendar "%s" and all of its entries.').replace('%s', calendar.displayname));
				if (really) {
					return _$listsbusinesslayer["delete"](calendar).then(function() {
						$location.path('/calendars/' + _$listsmodel.getStandardList().uri);
						return $scope.$apply();
					});
				}
			};

			this._$scope.startCreate = function() {
				return _$scope.status.addingList = true;
			};

			this._$scope.cancelCreate = function(event) {
				if (event.keyCode === 27) {
					_$scope.status.addingList = false;
					return _$scope.status.newListName = "";
				}
			};

			this._$scope.create = function() {
				if (_$scope.status.newListName) {
					if (!_$listsmodel.isNameAlreadyTaken(_$scope.status.newListName)) {
						_$scope.status.addingList = false;
						_$scope.isAddingList = true;
						_$listsbusinesslayer.add(_$scope.status.newListName).then(function(calendar) {
							$location.path('/calendars/' + calendar.uri);
							return $scope.$apply();
						});
						return _$scope.status.newListName = '';
					} else {
						return alert(t('tasks', 'The name "%s" is already used.').replace('%s', _$scope.status.newListName));
				 	}
				} else {
					return alert(t('tasks', 'An empty name is not allowed.'));
				}
			};

			this._$scope.startRename = function(calendar) {
				_$scope.status.addingList = false;
				calendar.prepareUpdate();
				return $location.path('/calendars/' + _$scope.route.calendarID + '/edit/name');
			};

			this._$scope.cancelRename = function(event,calendar) {
				if (event.keyCode === 27) {
					event.preventDefault();
					calendar.resetToPreviousState();
					$location.path('/calendars/' + _$scope.route.calendarID);
				}
			};

			this._$scope.rename = function(calendar) {
				var name = calendar.displayname;
				if (name) {
					if (!_$listsmodel.isNameAlreadyTaken(calendar.displayname, calendar.uri)) {
						_$listsbusinesslayer.rename(calendar);
						$location.path('/calendars/' + _$scope.route.calendarID);
					} else {
						return alert(t('tasks', 'The name "%s" is already used.').replace('%s', name));
					}
				} else {
					return alert(t('tasks', 'An empty name is not allowed.'));
				}
			};

			this._$scope.getCollectionCount = function(collectionID) {
				var filter;
				filter = _$searchbusinesslayer.getFilter();
				return _$collectionsmodel.getCount(collectionID, filter);
			};

			this._$scope.hideCollection = function(collectionID) {
				var collection;
				collection = _$collectionsmodel.getById(collectionID);
				switch (collection.show) {
					case 0:
						return true;
					case 1:
						return false;
					case 2:
						return this.getCollectionCount(collectionID) < 1;
				}
			};

			this._$scope.getCollectionString = function(collectionID) {
				var filter;
				if (collectionID !== 'completed') {
					filter = _$searchbusinesslayer.getFilter();
					return _$collectionsmodel.getCount(collectionID, filter);
				} else {
					return '';
				}
			};

			this._$scope.getListCount = function(listID, type) {
				var filter;
				filter = _$searchbusinesslayer.getFilter();
				return _$listsmodel.getCount(listID, type, filter);
			};

			this._$scope.dragoverList = function($event, item, index) {
				return true;
			};

			this._$scope.dropList = function($event, item, index) {
				var listID, taskID;
				taskID = item.id;
				listID = $($event.target).closest('li.list').attr('calendarID');
				_$tasksbusinesslayer.changeCalendarId(taskID, listID);
				return true;
			};

			this._$scope.dragoverCollection = function($event, item, index) {
				var collectionID;
				collectionID = $($event.target).closest('li.collection').attr('collectionID');
				return collectionID === 'starred' || collectionID === 'completed' || collectionID === 'today';
			};

			this._$scope.dropCollection = function($event, item, index) {
				var collectionID, taskID;
				taskID = item.id;
				collectionID = $($event.target).closest('li.collection').attr('collectionID');
				console.log(taskID, collectionID);
				_$tasksbusinesslayer.changeCollection(taskID, collectionID);
				return true;
			};
		}

		return ListController;

	  })();
	  return new ListController($scope, $window, $routeParams, ListsModel, TasksBusinessLayer, CollectionsModel, ListsBusinessLayer, $location, SearchBusinessLayer, CalendarService);
	}
]);

(function() {
  angular.module('Tasks').controller('SettingsController', [
    '$scope', '$window', 'Status', '$location', 'CollectionsModel', 'SettingsBusinessLayer', 'SettingsModel', function($scope, $window, Status, $location, CollectionsModel, SettingsBusinessLayer, SettingsModel) {
      var SettingsController;
      SettingsController = (function() {
        function SettingsController(_$scope, _$window, _$status, _$location, _$collectionsmodel, _$settingsbusinesslayer, _$settingsmodel) {
          var _this = this;
          this._$scope = _$scope;
          this._$window = _$window;
          this._$status = _$status;
          this._$location = _$location;
          this._$collectionsmodel = _$collectionsmodel;
          this._$settingsbusinesslayer = _$settingsbusinesslayer;
          this._$settingsmodel = _$settingsmodel;
          this._$scope.status = this._$status.getStatus();
          this._$scope.collections = this._$collectionsmodel.getAll();
          this._$scope.settingsmodel = this._$settingsmodel;
          this._$scope.collectionOptions = [
            {
              id: 0,
              name: t('tasks', 'Hidden')
            }, {
              id: 1,
              name: t('tasks', 'Visible')
            }, {
              id: 2,
              name: t('tasks', 'Automatic')
            }
          ];
          this._$scope.startOfWeekOptions = [
            {
              id: 0,
              name: t('tasks', 'Sunday')
            }, {
              id: 1,
              name: t('tasks', 'Monday')
            }, {
              id: 2,
              name: t('tasks', 'Tuesday')
            }, {
              id: 3,
              name: t('tasks', 'Wednesday')
            }, {
              id: 4,
              name: t('tasks', 'Thursday')
            }, {
              id: 5,
              name: t('tasks', 'Friday')
            }, {
              id: 6,
              name: t('tasks', 'Saturday')
            }
          ];
          this._$scope.setVisibility = function(collectionID) {
            var collection;
            collection = _$collectionsmodel.getById(collectionID);
            return _$settingsbusinesslayer.setVisibility(collectionID, collection.show);
          };
          this._$scope.setStartOfWeek = function() {
            return _$settingsbusinesslayer.set('various', 'startOfWeek', _$settingsmodel.getById('various').startOfWeek);
          };
        }

        return SettingsController;

      })();
      return new SettingsController($scope, $window, Status, $location, CollectionsModel, SettingsBusinessLayer, SettingsModel);
    }
  ]);

}).call(this);

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

angular.module('Tasks').directive('appNavigationEntryUtils', function() {
	'use strict';
	return {
		restrict: 'C',
		link: function(scope, elm) {
			var button, menu;
			menu = elm.siblings('.app-navigation-entry-menu');
			button = $(elm).find('.app-navigation-entry-utils-menu-button button');
			button.click(function() {
				menu.toggleClass('open');
			});
			scope.$on('documentClicked', function(scope, event) {
				if (event.target !== button[0]) {
					menu.removeClass('open');
				}
			});
		}
	};
});

angular.module('Tasks').directive('autofocusOnInsert', function() {
	'use strict';
	return function(scope, elm) {
		return elm.focus();
	};
});

angular.module('Tasks').directive('avatar', function() {
	return {
		restrict: 'A',
		scope: false,
		link: function(scope, elm, attr) {
			return attr.$observe('userid', function() {
				if (attr.userid) {
					return elm.avatar(attr.userid, attr.size);
				}
			});
		}
	};
});

(function() {
  angular.module('Tasks').directive('datepicker', function() {
	return {
	  restrict: 'A',
	  scope: false,
	  link: function(scope, elm, attr) {
		return elm.datepicker({
		  onSelect: function(date, inst) {
			scope['set' + attr.datepicker + 'day'](date);
			return scope.$apply();
		  },
		  beforeShow: function(input, inst) {
			var dp, marginLeft;
			dp = $(inst).datepicker('widget');
			marginLeft = -Math.abs($(input).outerWidth() - dp.outerWidth()) / 2 + 'px';
			dp.css({
			  'margin-left': marginLeft
			});
			$("div.ui-datepicker:before").css({
			  'left': 100 + 'px'
			});
			return $('.hasDatepicker').datepicker("option", "firstDay", scope.settingsmodel.getById('various').startOfWeek);
		  },
		  beforeShowDay: function(date) {
			if (moment(date).startOf('day').diff(moment(scope.task[attr.datepicker], "YYYYMMDDTHHmmss").startOf('day'), 'days') === 0) {
			  return [1, "selected"];
			} else {
			  return [1, ""];
			}
		  },
		  minDate: null
		});
	  }
	};
  });

}).call(this);

(function() {
  angular.module('Tasks').directive('ocClickFocus', [
	'$timeout', function($timeout) {
	  return function(scope, elm, attr) {
		var options;
		options = scope.$eval(attr.ocClickFocus);
		if (angular.isDefined(options) && angular.isDefined(options.selector)) {
		  return elm.click(function() {
			if (angular.isDefined(options.timeout)) {
			  return $timeout(function() {
				return $(options.selector).focus();
			  }, options.timeout);
			} else {
			  return $(options.selector).focus();
			}
		  });
		}
	  };
	}
  ]);

}).call(this);

(function() {
  angular.module('Tasks').directive('timepicker', function() {
	return {
	  restrict: 'A',
	  link: function(scope, elm, attr) {
		return elm.timepicker({
		  onSelect: function(date, inst) {
			scope['set' + attr.timepicker + 'time'](date);
			return scope.$apply();
		  },
		  myPosition: 'center top',
		  atPosition: 'center bottom',
		  hourText: t('tasks', 'Hours'),
		  minuteText: t('tasks', 'Minutes')
		});
	  }
	};
  });

}).call(this);

angular.module('Tasks').directive('watchTop', function() {
	return {
		restrict: 'A',
		link: function(scope, element, attr) {
			({
				scope: {
					"divTop": "="
				}
			});
			return scope.$watch(function() {
				return scope.divTop = element.prev().outerHeight(true);
			});
		}
	};
});

angular.module('Tasks').filter('counterFormatter', function() {
	return function(count) {
		switch (false) {
			case count !== 0:
				return '';
			case !(count > 999):
				return '999+';
			default:
				return count;
		}
	};
});

angular.module('Tasks').filter('dateDetails', function() {
	return function(due) {
		if (moment(due, "YYYYMMDDTHHmmss").isValid()) {
			return moment(due, "YYYYMMDDTHHmmss").locale('details').calendar();
		} else {
			return t('tasks', 'Set due date');
		}
	};
});

angular.module('Tasks').filter('dateDetailsShort', function() {
	return function(reminder) {
		if (moment(reminder, "YYYYMMDDTHHmmss").isValid()) {
			return moment(reminder, "YYYYMMDDTHHmmss").locale('details_short').calendar();
		} else {
			return '';
		}
	};
});

angular.module('Tasks').filter('dateFromNow', function() {
	return function(due) {
		if (moment(due, "YYYYMMDDTHHmmss").isValid()) {
			return moment(due, "YYYYMMDDTHHmmss").fromNow();
		} else {
			return '';
		}
	};
});

angular.module('Tasks').filter('dateTaskList', function() {
	return function(due) {
		if (moment(due, "YYYYMMDDTHHmmss").isValid()) {
			return moment(due, "YYYYMMDDTHHmmss").locale('tasks').calendar();
		} else {
			return '';
		}
	};
});

angular.module('Tasks').filter('day', function() {
	return function(i) {
		return moment().add('days', i).locale('list_week').calendar();
	};
});

angular.module('Tasks').filter('dayTaskList', function() {
	return function(due) {
		if (moment(due, "YYYYMMDDTHHmmss").isValid()) {
			return moment(due, "YYYYMMDDTHHmmss").locale('tasks').calendar();
		} else {
			return '';
		}
	};
});

angular.module('Tasks').filter('percentDetails', function() {
	return function(percent) {
		return t('tasks', '%s %% completed').replace('%s', percent).replace('%%', '%');
	};
});

angular.module('Tasks').filter('priorityDetails', function() {
	return function(priority) {
		var string;
		string = t('tasks', 'priority %s: ').replace('%s', priority);
		if (+priority === 6 || +priority === 7 || +priority === 8 || +priority === 9) {
			return string + ' ' + t('tasks', 'high');
		} else if (+priority === 5) {
			return string + ' ' + t('tasks', 'medium');
		} else if (+priority === 1 || +priority === 2 || +priority === 3 || +priority === 4) {
			return string + ' ' + t('tasks', 'low');
		} else {
			return t('tasks', 'no priority assigned');
		}
	};
});

(function() {
  angular.module('Tasks').filter('reminderDetails', function() {
	return function(reminder, scope) {
	  var ds, time, token, _i, _len, _ref;
	  if (!(angular.isUndefined(reminder) || reminder === null)) {
		if (reminder.type === 'DATE-TIME' && moment(reminder.date, "YYYYMMDDTHHmmss").isValid()) {
		  return moment(reminder.date, "YYYYMMDDTHHmmss").locale('reminder').calendar();
		} else if (reminder.type === 'DURATION' && reminder.duration) {
		  ds = t('tasks', 'Remind me');
		  _ref = scope.durations;
		  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
			token = _ref[_i];
			if (+reminder.duration[token.id]) {
			  time = 1;
			  ds += ' ' + reminder.duration[token.id] + ' ';
			  if (+reminder.duration[token.id] === 1) {
				ds += token.name;
			  } else {
				ds += token.names;
			  }
			}
		  }
		  if (!time) {
			if (reminder.duration.params.related === 'END') {
			  ds += ' ' + t('tasks', 'at the end');
			} else {
			  ds += ' ' + t('tasks', 'at the beginning');
			}
		  } else {
			if (reminder.duration.params.invert) {
			  if (reminder.duration.params.related === 'END') {
				ds += ' ' + t('tasks', 'before end');
			  } else {
				ds += ' ' + t('tasks', 'before beginning');
			  }
			} else {
			  if (reminder.duration.params.related === 'END') {
				ds += ' ' + t('tasks', 'after end');
			  } else {
				ds += ' ' + t('tasks', 'after beginning');
			  }
			}
		  }
		  return ds;
		} else {
		  return t('tasks', 'Remind me');
		}
	  } else {
		return t('tasks', 'Remind me');
	  }
	};
  });

}).call(this);

angular.module('Tasks').filter('startDetails', function() {
	return function(due) {
		if (moment(due, "YYYYMMDDTHHmmss").isValid()) {
			return moment(due, "YYYYMMDDTHHmmss").locale('start').calendar();
		} else {
			return t('tasks', 'Set start date');
		}
	};
});

angular.module('Tasks').filter('timeTaskList', function() {
	return function(due) {
		if (moment(due, "YYYYMMDDTHHmmss").isValid()) {
			return moment(due, "YYYYMMDDTHHmmss").format('HH:mm');
		} else {
			return '';
		}
	};
});

angular.module('Tasks').factory('ListsBusinessLayer', [
	'ListsModel', 'Persistence', 'TasksBusinessLayer', 'CalendarService', function(ListsModel, Persistence, TasksBusinessLayer, CalendarService) {
		var ListsBusinessLayer;
		ListsBusinessLayer = (function() {
			function ListsBusinessLayer(_$listsmodel, _persistence, _$tasksbusinesslayer, _$calendarservice) {
				this._$listsmodel = _$listsmodel;
				this._persistence = _persistence;
				this._$tasksbusinesslayer = _$tasksbusinesslayer;
				this._$calendarservice = _$calendarservice;
			}

			ListsBusinessLayer.prototype.init = function() {
				return this._$calendarservice.getAll().then(function(calendars) {
					var calendar, _i, _len, _results;
					_results = [];
					for (_i = 0, _len = calendars.length; _i < _len; _i++) {
						calendar = calendars[_i];
						ListsModel.add(calendar);
						_results.push(TasksBusinessLayer.init(calendar));
					}
					return _results;
				});
			};

			ListsBusinessLayer.prototype.add = function(calendar) {
				return this._$calendarservice.create(calendar, '#FF7A66', ['vtodo']).then(function(calendar) {
					ListsModel.add(calendar);
					return calendar;
				});
			};

			ListsBusinessLayer.prototype["delete"] = function(calendar) {
				return this._$calendarservice["delete"](calendar).then(function() {
					return ListsModel["delete"](calendar);
				});
			};

			ListsBusinessLayer.prototype.rename = function(calendar) {
				this._$calendarservice.update(calendar).then(function(calendar) {
					calendar.dropPreviousState();
				});
			};

			return ListsBusinessLayer;

		})();
		return new ListsBusinessLayer(ListsModel, Persistence, TasksBusinessLayer, CalendarService);
	}
]);

(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  angular.module('Tasks').factory('SearchBusinessLayer', [
	'ListsModel', 'Persistence', 'TasksModel', '$rootScope', '$routeParams', '$location', function(ListsModel, Persistence, TasksModel, $rootScope, $routeParams, $location) {
	  var SearchBusinessLayer;
	  SearchBusinessLayer = (function() {
		function SearchBusinessLayer(_$listsmodel, _persistence, _$tasksmodel, _$rootScope, _$routeparams, _$location) {
		  this._$listsmodel = _$listsmodel;
		  this._persistence = _persistence;
		  this._$tasksmodel = _$tasksmodel;
		  this._$rootScope = _$rootScope;
		  this._$routeparams = _$routeparams;
		  this._$location = _$location;
		  this.getFilter = __bind(this.getFilter, this);
		  this.setFilter = __bind(this.setFilter, this);
		  this.attach = __bind(this.attach, this);
		  this.initialize();
		  this._$searchString = '';
		}

		SearchBusinessLayer.prototype.attach = function(search) {
		  var _this = this;
		  search.setFilter('tasks', function(query) {
			return _this._$rootScope.$apply(function() {
			  return _this.setFilter(query);
			});
		  });
		  search.setRenderer('task', this.renderTaskResult.bind(this));
		  return search.setHandler('task', this.handleTaskClick.bind(this));
		};

		SearchBusinessLayer.prototype.setFilter = function(query) {
		  return this._$searchString = query;
		};

		SearchBusinessLayer.prototype.getFilter = function() {
		  return this._$searchString;
		};

		SearchBusinessLayer.prototype.initialize = function() {
		  var _this = this;
		  this.handleTaskClick = function($row, result, event) {
			return _this._$location.path('/lists/' + result.calendarid + '/tasks/' + result.id);
		  };
		  this.renderTaskResult = function($row, result) {
			var $template;
			if (!_this._$tasksmodel.filterTasks(result, _this._$routeparams.listID) || !_this._$tasksmodel.isLoaded(result)) {
			  $template = $('div.task-item.template');
			  $template = $template.clone();
			  $row = $('<tr class="result"></tr>').append($template.removeClass('template'));
			  $row.data('result', result);
			  $row.find('span.title').text(result.name);
			  if (result.starred) {
				$row.find('span.task-star').addClass('task-starred');
			  }
			  if (result.completed) {
				$row.find('div.task-item').addClass('done');
				$row.find('span.task-checkbox').addClass('task-checked');
			  }
			  if (result.complete) {
				$row.find('div.percentdone').css({
				  'width': result.complete + '%',
				  'background-color': '' + _this._$listsmodel.getColor(result.calendarid)
				});
			  }
			  if (result.note) {
				$row.find('div.title-wrapper').addClass('attachment');
			  }
			  return $row;
			} else {
			  return null;
			}
		  };
		  return OC.Plugins.register('OCA.Search', this);
		};

		return SearchBusinessLayer;

	  })();
	  return new SearchBusinessLayer(ListsModel, Persistence, TasksModel, $rootScope, $routeParams, $location);
	}
  ]);

}).call(this);

(function() {
  angular.module('Tasks').factory('SettingsBusinessLayer', [
	'Persistence', 'SettingsModel', function(Persistence, SettingsModel) {
	  var SettingsBusinessLayer;
	  SettingsBusinessLayer = (function() {
		function SettingsBusinessLayer(_persistence, _$settingsmodel) {
		  this._persistence = _persistence;
		  this._$settingsmodel = _$settingsmodel;
		}

		SettingsBusinessLayer.prototype.updateModel = function() {
		  var success,
			_this = this;
		  success = function() {};
		  return this._persistence.getCollections(success, true);
		};

		SettingsBusinessLayer.prototype.setVisibility = function(collectionID, visibility) {
		  return this._persistence.setVisibility(collectionID, visibility);
		};

		SettingsBusinessLayer.prototype.toggle = function(type, setting) {
		  var value;
		  this._$settingsmodel.toggle(type, setting);
		  value = this._$settingsmodel.getById(type)[setting];
		  return this._persistence.setting(type, setting, value);
		};

		SettingsBusinessLayer.prototype.set = function(type, setting, value) {
		  return this._persistence.setting(type, setting, value);
		};

		return SettingsBusinessLayer;

	  })();
	  return new SettingsBusinessLayer(Persistence, SettingsModel);
	}
  ]);

}).call(this);

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

			TasksBusinessLayer.prototype.setHideSubtasks = function(task, hide) {
				task.hideSubtasks = hide;
				this._$vtodoservice.update(task).then(function(task) {
				});
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

angular.module('Tasks').service('CalendarService', ['DavClient', 'Calendar', function(DavClient, Calendar){
	'use strict';

	var _this = this;

	this._CALENDAR_HOME = null;

	this._currentUserPrincipal = null;

	this._takenUrls = [];

	this._PROPERTIES = [
		'{' + DavClient.NS_DAV + '}displayname',
		'{' + DavClient.NS_IETF + '}calendar-description',
		'{' + DavClient.NS_IETF + '}calendar-timezone',
		'{' + DavClient.NS_APPLE + '}calendar-order',
		'{' + DavClient.NS_APPLE + '}calendar-color',
		'{' + DavClient.NS_IETF + '}supported-calendar-component-set',
		'{' + DavClient.NS_OWNCLOUD + '}calendar-enabled',
		'{' + DavClient.NS_DAV + '}acl',
		'{' + DavClient.NS_DAV + '}owner',
		'{' + DavClient.NS_OWNCLOUD + '}invite'
	];

	function discoverHome(callback) {
		return DavClient.propFind(DavClient.buildUrl(OC.linkToRemoteBase('dav')), ['{' + DavClient.NS_DAV + '}current-user-principal'], 0, {'requesttoken': OC.requestToken}).then(function(response) {
			if (!DavClient.wasRequestSuccessful(response.status)) {
				throw "CalDAV client could not be initialized - Querying current-user-principal failed";
			}

			if (response.body.propStat.length < 1) {
				return;
			}
			var props = response.body.propStat[0].properties;
			_this._currentUserPrincipal = props['{' + DavClient.NS_DAV + '}current-user-principal'][0].textContent;

			return DavClient.propFind(DavClient.buildUrl(_this._currentUserPrincipal), ['{' + DavClient.NS_IETF + '}calendar-home-set'], 0, {'requesttoken': OC.requestToken}).then(function (response) {
				if (!DavClient.wasRequestSuccessful(response.status)) {
					throw "CalDAV client could not be initialized - Querying calendar-home-set failed";
				}

				if (response.body.propStat.length < 1) {
					return;
				}
				var props = response.body.propStat[0].properties;
				_this._CALENDAR_HOME = props['{' + DavClient.NS_IETF + '}calendar-home-set'][0].textContent;

				return callback();
			});
		});
	}

	function getResponseCodeFromHTTPResponse(t) {
		return parseInt(t.split(' ')[1]);
	}

	this.getAll = function() {
		if (this._CALENDAR_HOME === null) {
			return discoverHome(function() {
				return _this.getAll();
			});
		}

		var prom = DavClient.propFind(DavClient.buildUrl(this._CALENDAR_HOME), this._PROPERTIES, 1, {'requesttoken': OC.requestToken}).then(function(response) {
			var calendars = [];

			if (!DavClient.wasRequestSuccessful(response.status)) {
				throw "CalDAV client could not be initialized - Querying calendars failed";
			}

			for (var i = 0; i < response.body.length; i++) {
				var body = response.body[i];
				if (body.propStat.length < 1) {
					continue;
				}

				_this._takenUrls.push(body.href);

				var responseCode = getResponseCodeFromHTTPResponse(body.propStat[0].status);
				if (!DavClient.wasRequestSuccessful(responseCode)) {
					continue;
				}

				var doesSupportVTodo = false;
				var components = body.propStat[0].properties['{urn:ietf:params:xml:ns:caldav}supported-calendar-component-set'];
				if (components) {
					for (var j=0; j < components.length; j++) {
						var name = components[j].attributes.getNamedItem('name').textContent.toLowerCase();
						if (name === 'vtodo') {
							doesSupportVTodo = true;
						}
					}
				}

				if (!doesSupportVTodo) {
					continue;
				}

				_this._getACLFromResponse(body);

				var uri = body.href.substr(_this._CALENDAR_HOME.length).replace(/[^\w\-]+/g, '');

				var calendar = new Calendar(body.href, body.propStat[0].properties, uri);
				calendars.push(calendar);
			}

			return calendars;
		});
		return prom;
	};

	this.get = function(url) {
		if (this._CALENDAR_HOME === null) {
			return discoverHome(function() {
				return _this.get(url);
			});
		}

		return DavClient.propFind(DavClient.buildUrl(url), this._PROPERTIES, 0, {'requesttoken': OC.requestToken}).then(function(response) {
			var body = response.body;
			if (body.propStat.length < 1) {
				//TODO - something went wrong
				return;
			}

			var responseCode = getResponseCodeFromHTTPResponse(body.propStat[0].status);
			if (!DavClient.wasRequestSuccessful(responseCode)) {
				//TODO - something went wrong
				return;
			}

			_this._getACLFromResponse(body);

			var uri = body.href.substr(_this._CALENDAR_HOME.length).replace(/[^\w\-]+/g, '');

			return new Calendar(body.href, body.propStat[0].properties, uri);
		});
	};

	this.create = function(name, color, components) {
		if (this._CALENDAR_HOME === null) {
			return discoverHome(function() {
				return _this.create(name, color);
			});
		}

		if (typeof components === 'undefined') {
			components = ['vtodo'];
		}

		var xmlDoc = document.implementation.createDocument('', '', null);
		var cMkcalendar = xmlDoc.createElement('c:mkcalendar');
		cMkcalendar.setAttribute('xmlns:c', 'urn:ietf:params:xml:ns:caldav');
		cMkcalendar.setAttribute('xmlns:d', 'DAV:');
		cMkcalendar.setAttribute('xmlns:a', 'http://apple.com/ns/ical/');
		cMkcalendar.setAttribute('xmlns:o', 'http://owncloud.org/ns');
		xmlDoc.appendChild(cMkcalendar);

		var dSet = xmlDoc.createElement('d:set');
		cMkcalendar.appendChild(dSet);

		var dProp = xmlDoc.createElement('d:prop');
		dSet.appendChild(dProp);

		dProp.appendChild(this._createXMLForProperty(xmlDoc, 'displayname', name));
		dProp.appendChild(this._createXMLForProperty(xmlDoc, 'enabled', true));
		dProp.appendChild(this._createXMLForProperty(xmlDoc, 'color', color));
		dProp.appendChild(this._createXMLForProperty(xmlDoc, 'components', components));

		var body = cMkcalendar.outerHTML;

		var uri = this._suggestUri(name);
		var url = this._CALENDAR_HOME + uri + '/';
		var headers = {
			'Content-Type' : 'application/xml; charset=utf-8',
			'requesttoken' : OC.requestToken
		};

		return DavClient.request('MKCALENDAR', url, headers, body).then(function(response) {
			if (response.status === 201) {
				_this._takenUrls.push(url);
				return _this.get(url).then(function(calendar) {
					calendar.enabled = true;
					return _this.update(calendar);
				});
			}
		});
	};

	this.update = function(calendar) {
		var xmlDoc = document.implementation.createDocument('', '', null);
		var dPropUpdate = xmlDoc.createElement('d:propertyupdate');
		dPropUpdate.setAttribute('xmlns:c', 'urn:ietf:params:xml:ns:caldav');
		dPropUpdate.setAttribute('xmlns:d', 'DAV:');
		dPropUpdate.setAttribute('xmlns:a', 'http://apple.com/ns/ical/');
		dPropUpdate.setAttribute('xmlns:o', 'http://owncloud.org/ns');
		xmlDoc.appendChild(dPropUpdate);

		var dSet = xmlDoc.createElement('d:set');
		dPropUpdate.appendChild(dSet);

		var dProp = xmlDoc.createElement('d:prop');
		dSet.appendChild(dProp);

		var updatedProperties = calendar.updatedProperties;
		calendar.resetUpdatedProperties();
		for (var i=0; i < updatedProperties.length; i++) {
			dProp.appendChild(this._createXMLForProperty(
				xmlDoc,
				updatedProperties[i],
				calendar[updatedProperties[i]]
			));
		}

		var url = calendar.url;
		var body = dPropUpdate.outerHTML;
		var headers = {
			'Content-Type' : 'application/xml; charset=utf-8',
			'requesttoken' : OC.requestToken
		};

		return DavClient.request('PROPPATCH', url, headers, body).then(function(response) {
			return calendar;
		});
	};

	this.delete = function(calendar) {
		return DavClient.request('DELETE', calendar.url, {'requesttoken': OC.requestToken}, '').then(function(response) {
			if (response.status === 204) {
				return true;
			} else {
				// TODO - handle error case
				return false;
			}
		});
	};

	this.share = function(calendar, shareType, shareWith, writable, existingShare) {
		var xmlDoc = document.implementation.createDocument('', '', null);
		var oShare = xmlDoc.createElement('o:share');
		oShare.setAttribute('xmlns:d', 'DAV:');
		oShare.setAttribute('xmlns:o', 'http://owncloud.org/ns');
		xmlDoc.appendChild(oShare);

		var oSet = xmlDoc.createElement('o:set');
		oShare.appendChild(oSet);

		var dHref = xmlDoc.createElement('d:href');
		if (shareType === OC.Share.SHARE_TYPE_USER) {
			dHref.textContent = 'principal:principals/users/';
		} else if (shareType === OC.Share.SHARE_TYPE_GROUP) {
			dHref.textContent = 'principal:principals/groups/';
		}
		dHref.textContent += shareWith;
		oSet.appendChild(dHref);

		var oSummary = xmlDoc.createElement('o:summary');
		oSummary.textContent = t('calendar', '{calendar} shared by {owner}', {
			calendar: calendar.displayname,
			owner: calendar.owner
		});
		oSet.appendChild(oSummary);

		if (writable) {
			var oRW = xmlDoc.createElement('o:read-write');
			oSet.appendChild(oRW);
		}

		var headers = {
			'Content-Type' : 'application/xml; charset=utf-8',
			requesttoken : oc_requesttoken
		};
		var body = oShare.outerHTML;
		return DavClient.request('POST', calendar.url, headers, body).then(function(response) {
			if (response.status === 200) {
				if (!existingShare) {
					if (shareType === OC.Share.SHARE_TYPE_USER) {
						calendar.sharedWith.users.push({
							id: shareWith,
							displayname: shareWith,
							writable: writable
						});
					} else if (shareType === OC.Share.SHARE_TYPE_GROUP) {
						calendar.sharedWith.groups.push({
							id: shareWith,
							displayname: shareWith,
							writable: writable
						});
					}
				}
			}
		});
	};

	this.unshare = function(calendar, shareType, shareWith) {
		var xmlDoc = document.implementation.createDocument('', '', null);
		var oShare = xmlDoc.createElement('o:share');
		oShare.setAttribute('xmlns:d', 'DAV:');
		oShare.setAttribute('xmlns:o', 'http://owncloud.org/ns');
		xmlDoc.appendChild(oShare);

		var oRemove = xmlDoc.createElement('o:remove');
		oShare.appendChild(oRemove);

		var dHref = xmlDoc.createElement('d:href');
		if (shareType === OC.Share.SHARE_TYPE_USER) {
			dHref.textContent = 'principal:principals/users/';
		} else if (shareType === OC.Share.SHARE_TYPE_GROUP) {
			dHref.textContent = 'principal:principals/groups/';
		}
		dHref.textContent += shareWith;
		oRemove.appendChild(dHref);

		var headers = {
			'Content-Type' : 'application/xml; charset=utf-8',
			requesttoken: oc_requesttoken
		};
		var body = oShare.outerHTML;
		return DavClient.request('POST', calendar.url, headers, body).then(function(response) {
			if (response.status === 200) {
				if (shareType === OC.Share.SHARE_TYPE_USER) {
					calendar.sharedWith.users = calendar.sharedWith.users.filter(function(user) {
						return user.id !== shareWith;
					});
				} else if (shareType === OC.Share.SHARE_TYPE_GROUP) {
					calendar.sharedWith.groups = calendar.sharedWith.groups.filter(function(groups) {
						return groups.id !== shareWith;
					});
				}
				//todo - remove entry from calendar object
				return true;
			} else {
				return false;
			}
		});
	};

	this._createXMLForProperty = function(xmlDoc, propName, value) {
		switch(propName) {
			case 'enabled':
				var oEnabled = xmlDoc.createElement('o:calendar-enabled');
				oEnabled.textContent = value ? '1' : '0';
				return oEnabled;

			case 'displayname':
				var dDisplayname = xmlDoc.createElement('d:displayname');
				dDisplayname.textContent = value;
				return dDisplayname;

			case 'order':
				var aOrder = xmlDoc.createElement('a:calendar-color');
				aOrder.textContent = value;
				return aOrder;

			case 'color':
				var aColor = xmlDoc.createElement('a:calendar-color');
				aColor.textContent = value;
				return aColor;

			case 'components':
				var cComponents = xmlDoc.createElement('c:supported-calendar-component-set');
				for (var i=0; i < value.length; i++) {
					var cComp = xmlDoc.createElement('c:comp');
					cComp.setAttribute('name', value[i].toUpperCase());
					cComponents.appendChild(cComp);
				}
				return cComponents;
		}
	};

	this._getACLFromResponse = function(body) {
		var canWrite = false;
		var acl = body.propStat[0].properties['{' + DavClient.NS_DAV + '}acl'];
		if (acl) {
			for (var k=0; k < acl.length; k++) {
				var href = acl[k].getElementsByTagNameNS('DAV:', 'href');
				if (href.length === 0) {
					continue;
				}
				href = href[0].textContent;
				if (href !== _this._currentUserPrincipal) {
					continue;
				}
				var writeNode = acl[k].getElementsByTagNameNS('DAV:', 'write');
				if (writeNode.length > 0) {
					canWrite = true;
				}
			}
		}
		body.propStat[0].properties.canWrite = canWrite;
	};

	this._isUriAlreadyTaken = function(uri) {
		return (this._takenUrls.indexOf(this._CALENDAR_HOME + uri + '/') !== -1);
	};

	this._suggestUri = function(displayname) {
		var uri = displayname.toString().toLowerCase()
			.replace(/\s+/g, '-')           // Replace spaces with -
			.replace(/[^\w\-]+/g, '')       // Remove all non-word chars
			.replace(/\-\-+/g, '-')         // Replace multiple - with single -
			.replace(/^-+/, '')             // Trim - from start of text
			.replace(/-+$/, '');            // Trim - from end of text

		if (!this._isUriAlreadyTaken(uri)) {
			return uri;
		}

		if (uri.indexOf('-') === -1) {
			uri = uri + '-1';
			if (!this._isUriAlreadyTaken(uri)) {
				return uri;
			}
		}

		while (this._isUriAlreadyTaken(uri)) {
			var positionLastDash = uri.lastIndexOf('-');
			var firstPart = uri.substr(0, positionLastDash);
			var lastPart = uri.substr(positionLastDash + 1);

			if (lastPart.match(/^\d+$/)) {
				lastPart = parseInt(lastPart);
				lastPart++;

				uri = firstPart + '-' + lastPart;
			} else if (lastPart === '') {
				uri = uri + '1';
			} else {
				uri = uri = '-1';
			}
		}

		return uri;
	};

}]);

(function() {
  angular.module('Tasks').service('DavClient', [
	function() {
	  var client;
	  client = new dav.Client({
		baseUrl: OC.linkToRemote('dav/calendars'),
		xmlNamespaces: {
		  'DAV:': 'd',
		  'urn:ietf:params:xml:ns:caldav': 'c',
		  'http://apple.com/ns/ical/': 'aapl',
		  'http://owncloud.org/ns': 'oc',
		  'http://calendarserver.org/ns/': 'cs'
		}
	  });
	  angular.extend(client, {
		NS_DAV: 'DAV:',
		NS_IETF: 'urn:ietf:params:xml:ns:caldav',
		NS_APPLE: 'http://apple.com/ns/ical/',
		NS_OWNCLOUD: 'http://owncloud.org/ns',
		NS_CALENDARSERVER: 'http://calendarserver.org/ns/',
		buildUrl: function(path) {
		  return window.location.protocol + '//' + window.location.host + path;
		},
		wasRequestSuccessful: function(status) {
		  return status >= 200 && status <= 299;
		}
	  });
	  return client;
	}
  ]);

}).call(this);

angular.module('Tasks').service('ICalFactory', [
	function() {
		'use strict';

		// creates a new ICAL root element with a product id property
		return {
			new: function() {
				var root = new ICAL.Component(['vcalendar', [], []]);

				var version = angular.element('#app').attr('data-appVersion');
				root.updatePropertyWithValue('prodid', '-//ownCloud tasks v' + version);

				return root;
			}
		};
	}
]);

(function() {
  angular.module('Tasks').factory('Loading', [
	function() {
	  var Loading;
	  Loading = (function() {
		function Loading() {
		  this.count = 0;
		}

		Loading.prototype.increase = function() {
		  return this.count += 1;
		};

		Loading.prototype.decrease = function() {
		  return this.count -= 1;
		};

		Loading.prototype.getCount = function() {
		  return this.count;
		};

		Loading.prototype.isLoading = function() {
		  return this.count > 0;
		};

		return Loading;

	  })();
	  return new Loading();
	}
  ]);

}).call(this);

(function() {
  angular.module('Tasks').factory('_Model', [
	function() {
	  var Model;
	  Model = (function() {
		function Model() {
		  this._data = [];
		  this._dataMap = {};
		  this._filterCache = {};
		}

		Model.prototype.handle = function(data) {
		  var item, _i, _len, _results;
		  _results = [];
		  for (_i = 0, _len = data.length; _i < _len; _i++) {
			item = data[_i];
			_results.push(this.add(item));
		  }
		  return _results;
		};

		Model.prototype.add = function(data, clearCache) {
		  if (clearCache == null) {
			clearCache = true;
		  }
		  if (clearCache) {
			this._invalidateCache();
		  }
		  if (angular.isDefined(this._dataMap[data.id])) {
			return this.update(data, clearCache);
		  } else {
			this._data.push(data);
			return this._dataMap[data.id] = data;
		  }
		};

		Model.prototype.update = function(data, clearCache) {
		  var entry, key, value, _results;
		  if (clearCache == null) {
			clearCache = true;
		  }
		  if (clearCache) {
			this._invalidateCache();
		  }
		  entry = this.getById(data.id);
		  _results = [];
		  for (key in data) {
			value = data[key];
			if (key === 'id') {
			  continue;
			} else {
			  _results.push(entry[key] = value);
			}
		  }
		  return _results;
		};

		Model.prototype.getById = function(id) {
		  return this._dataMap[id];
		};

		Model.prototype.getAll = function() {
		  return this._data;
		};

		Model.prototype.removeById = function(id, clearCache) {
		  var counter, data, entry, _i, _len, _ref;
		  if (clearCache == null) {
			clearCache = true;
		  }
		  _ref = this._data;
		  for (counter = _i = 0, _len = _ref.length; _i < _len; counter = ++_i) {
			entry = _ref[counter];
			if (entry.id === id) {
			  this._data.splice(counter, 1);
			  data = this._dataMap[id];
			  delete this._dataMap[id];
			  if (clearCache) {
				this._invalidateCache();
			  }
			  return data;
			}
		  }
		};

		Model.prototype.clear = function() {
		  this._data.length = 0;
		  this._dataMap = {};
		  return this._invalidateCache();
		};

		Model.prototype._invalidateCache = function() {
		  return this._filterCache = {};
		};

		Model.prototype.get = function(query) {
		  var hash;
		  hash = query.hashCode();
		  if (!angular.isDefined(this._filterCache[hash])) {
			this._filterCache[hash] = query.exec(this._data);
		  }
		  return this._filterCache[hash];
		};

		Model.prototype.size = function() {
		  return this._data.length;
		};

		return Model;

	  })();
	  return Model;
	}
  ]);

}).call(this);

angular.module('Tasks').factory('Calendar', ['$rootScope', '$filter', function($rootScope, $filter) {
	'use strict';

	function Calendar(url, props, uri) {
		var _this = this;

		angular.extend(this, {
			_propertiesBackup: {},
			_properties: {
				url: url,
				uri: uri,
				enabled: props['{http://owncloud.org/ns}calendar-enabled'] === '1',
				displayname: props['{DAV:}displayname'] || t('tasks','Unnamed'),
				color: props['{http://apple.com/ns/ical/}calendar-color'] || '#1d2d44',
				order: parseInt(props['{http://apple.com/ns/ical/}calendar-order']) || 0,
				components: {
					vevent: false,
					vjournal: false,
					vtodo: false
				},
				writable: props.canWrite,
				shareable: props.canWrite,
				sharedWith: {
					users: [],
					groups: []
				},
				owner: ''
			},
			_updatedProperties: []
		});

		// angular.extend(this, {
		// 	tmpId: null,
		// 	fcEventSource: {
		// 		events: function (start, end, timezone, callback) {
		// 			// console.log('querying events ...');
		// 			// TimezoneService.get(timezone).then(function(tz) {
		// 			// 	_this.list.loading = true;
		// 			// 	$rootScope.$broadcast('reloadCalendarList');

		// 			// 	VEventService.getAll(_this, start, end).then(function(events) {
		// 			// 		var vevents = [];
		// 			// 		for (var i = 0; i < events.length; i++) {
		// 			// 			vevents = vevents.concat(events[i].getFcEvent(start, end, tz));
		// 			// 		}

		// 			// 		callback(vevents);

		// 			// 		_this.list.loading = false;
		// 			// 		$rootScope.$broadcast('reloadCalendarList');
		// 			// 	});
		// 			// });
		// 		},
		// 		editable: this._properties.writable,
		// 		calendar: this
		// 	},
		// 	list: {
		// 		edit: false,
		// 		loading: this.enabled,
		// 		locked: false,
		// 		editingShares: false
		// 	}
		// });

		var components = props['{urn:ietf:params:xml:ns:caldav}supported-calendar-component-set'];
		for (var i=0; i < components.length; i++) {
			var name = components[i].attributes.getNamedItem('name').textContent.toLowerCase();
			if (this._properties.components.hasOwnProperty(name)) {
				this._properties.components[name] = true;
			}
		}

		var shares = props['{http://owncloud.org/ns}invite'];
		if (typeof shares !== 'undefined') {
			for (var j=0; j < shares.length; j++) {
				var href = shares[j].getElementsByTagNameNS('DAV:', 'href');
				if (href.length === 0) {
					continue;
				}
				href = href[0].textContent;

				var access = shares[j].getElementsByTagNameNS('http://owncloud.org/ns', 'access');
				if (access.length === 0) {
					continue;
				}
				access = access[0];

				var readWrite = access.getElementsByTagNameNS('http://owncloud.org/ns', 'read-write');
				readWrite = readWrite.length !== 0;

				if (href.startsWith('principal:principals/users/')) {
					this._properties.sharedWith.users.push({
						id: href.substr(27),
						displayname: href.substr(27),
						writable: readWrite
					});
				} else if (href.startsWith('principal:principals/groups/')) {
					this._properties.sharedWith.groups.push({
						id: href.substr(28),
						displayname: href.substr(28),
						writable: readWrite
					});
				}
			}
		}

		var owner = props['{DAV:}owner'];
		if (typeof owner !== 'undefined' && owner.length !== 0) {
			owner = owner[0].textContent.slice(0, -1);
			if (owner.startsWith('/remote.php/dav/principals/users/')) {
				this._properties.owner = owner.substr(33);
			}
		}

		// this.tmpId = RandomStringService.generate();
	}

	Calendar.prototype = {
		get url() {
			return this._properties.url;
		},
		get enabled() {
			return this._properties.enabled;
		},
		get uri() {
			return this._properties.uri;
		},
		get components() {
			return this._properties.components;
		},
		set enabled(enabled) {
			this._properties.enabled = enabled;
			this._setUpdated('enabled');
		},
		get displayname() {
			return this._properties.displayname;
		},
		set displayname(displayname) {
			this._properties.displayname = displayname;
			this._setUpdated('displayname');
		},
		get color() {
			return this._properties.color;
		},
		set color(color) {
			this._properties.color = color;
			this._setUpdated('color');
		},
		get sharedWith() {
			return this._properties.sharedWith;
		},
		set sharedWith(sharedWith) {
			this._properties.sharedWith = sharedWith;
		},
		get textColor() {
			var color = this.color;
			var fallbackColor = '#fff';
			var c;
			switch (color.length) {
				case 4:
					c = color.match(/^#([0-9a-f]{3})$/i)[1];
					if (c) {
						return this._generateTextColor(
							parseInt(c.charAt(0),16)*0x11,
							parseInt(c.charAt(1),16)*0x11,
							parseInt(c.charAt(2),16)*0x11
						);
					}
					return fallbackColor;

				case 7:
				case 9:
					var regex = new RegExp('^#([0-9a-f]{' + (color.length - 1) + '})$', 'i');
					c = color.match(regex)[1];
					if (c) {
						return this._generateTextColor(
							parseInt(c.substr(0,2),16),
							parseInt(c.substr(2,2),16),
							parseInt(c.substr(4,2),16)
						);
					}
					return fallbackColor;

				default:
					return fallbackColor;
			}
		},
		get order() {
			return this._properties.order;
		},
		set order(order) {
			this._properties.order = order;
			this._setUpdated('order');
		},
		get writable() {
			return this._properties.writable;
		},
		get shareable() {
			return this._properties.shareable;
		},
		get owner() {
			return this._properties.owner;
		},
		_setUpdated: function(propName) {
			if (this._updatedProperties.indexOf(propName) === -1) {
				this._updatedProperties.push(propName);
			}
		},
		get updatedProperties() {
			return this._updatedProperties;
		},
		resetUpdatedProperties: function() {
			this._updatedProperties = [];
		},
		prepareUpdate: function() {
			this._propertiesBackup = angular.copy(this._properties);
		},
		resetToPreviousState: function() {
			this._properties = angular.copy(this._propertiesBackup);
			this._propertiesBackup = {};
		},
		dropPreviousState: function() {
			this._propertiesBackup = {};
		},
		toggleSharesEditor: function() {
			this.list.editingShares = !this.list.editingShares;
		},
		_generateTextColor: function(r,g,b) {
			var brightness = (((r * 299) + (g * 587) + (b * 114)) / 1000);
			return (brightness > 130) ? '#000000' : '#FAFAFA';
		}
	};

	return Calendar;
}]);

(function() {
  var __hasProp = {}.hasOwnProperty,
	__extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  angular.module('Tasks').factory('CollectionsModel', [
	'TasksModel', '_Model', function(TasksModel, _Model) {
	  var CollectionsModel;
	  CollectionsModel = (function(_super) {
		__extends(CollectionsModel, _super);

		function CollectionsModel(_$tasksmodel) {
		  this._$tasksmodel = _$tasksmodel;
		  this._nameCache = {};
		  CollectionsModel.__super__.constructor.call(this);
		}

		CollectionsModel.prototype.add = function(data, clearCache) {
		  if (clearCache == null) {
			clearCache = true;
		  }
		  this._nameCache[data.displayname] = data;
		  if (angular.isDefined(data.id)) {
			return CollectionsModel.__super__.add.call(this, data, clearCache);
		  }
		};

		CollectionsModel.prototype.getCount = function(collectionID, filter) {
		  var count, task, tasks, _i, _len;
		  if (filter == null) {
			filter = '';
		  }
		  count = 0;
		  tasks = this._$tasksmodel.filteredTasks(filter);
		  for (_i = 0, _len = tasks.length; _i < _len; _i++) {
			task = tasks[_i];
			count += this._$tasksmodel.filterTasks(task, collectionID) && !task.related;
		  }
		  return count;
		};

		return CollectionsModel;

	  })(_Model);
	  return new CollectionsModel(TasksModel);
	}
  ]);

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
	__extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  angular.module('Tasks').factory('ListsModel', [
	'TasksModel', '_Model', function(TasksModel, _Model) {
	  var ListsModel;
	  ListsModel = (function(_super) {
		__extends(ListsModel, _super);

		function ListsModel(_$tasksmodel) {
		  this._$tasksmodel = _$tasksmodel;
		  this._tmpUriCache = {};
		  this._data = [];
		  this._dataMap = {};
		  this._filterCache = {};
		}

		ListsModel.prototype.add = function(calendar, clearCache) {
		  var updateByUri;
		  if (clearCache == null) {
			clearCache = true;
		  }
		  updateByUri = angular.isDefined(calendar.uri) && angular.isDefined(this.getByUri(calendar.uri));
		  if (updateByUri) {
			return this.update(calendar, clearCache);
		  } else {
			if (angular.isDefined(calendar.uri)) {
			  if (clearCache) {
				this._invalidateCache();
			  }
			  if (angular.isDefined(this._dataMap[calendar.uri])) {

			  } else {
				this._data.push(calendar);
				return this._dataMap[calendar.uri] = calendar;
			  }
			}
		  }
		};

		ListsModel.prototype.getByUri = function(uri) {
		  return this._dataMap[uri];
		};

		ListsModel.prototype.update = function(list, clearCache) {
		  var tmplist;
		  if (clearCache == null) {
			clearCache = true;
		  }
		  tmplist = this._tmpIdCache[list.tmpID];
		  if (angular.isDefined(list.id) && angular.isDefined(tmplist) && angular.isUndefined(tmplist.id)) {
			tmplist.id = list.id;
			this._dataMap[list.id] = tmplist;
		  }
		  list["void"] = false;
		  return ListsModel.__super__.update.call(this, list, clearCache);
		};

		ListsModel.prototype["delete"] = function(calendar, clearCache) {
		  var counter, data, entry, _i, _len, _ref;
		  if (clearCache == null) {
			clearCache = true;
		  }
		  _ref = this._data;
		  for (counter = _i = 0, _len = _ref.length; _i < _len; counter = ++_i) {
			entry = _ref[counter];
			if (entry === calendar) {
			  this._data.splice(counter, 1);
			  data = this._dataMap[calendar.uri];
			  delete this._dataMap[calendar.uri];
			  if (clearCache) {
				this._invalidateCache();
			  }
			  return data;
			}
		  }
		};

		ListsModel.prototype.getStandardList = function() {
		  var calendars;
		  if (this.size()) {
			calendars = this.getAll();
			return calendars[0];
		  }
		};

		ListsModel.prototype.isNameAlreadyTaken = function(displayname, uri) {
			var calendar, calendars, ret, _i, _len;
			calendars = this.getAll();
			ret = false;
			for (_i = 0, _len = calendars.length; _i < _len; _i++) {
				calendar = calendars[_i];
				if (calendar.displayname === displayname && calendar.uri !== uri) {
					ret = true;
				}
			}
			return ret;
		};

		ListsModel.prototype.getCount = function(calendarID, collectionID, filter) {
		  var count, task, tasks, _i, _len;
		  if (filter == null) {
			filter = '';
		  }
		  count = 0;
		  tasks = this._$tasksmodel.filteredTasks(filter);
		  for (_i = 0, _len = tasks.length; _i < _len; _i++) {
			task = tasks[_i];
			count += this._$tasksmodel.filterTasks(task, collectionID) && task.calendaruri === calendarID && !task.related;
		  }
		  if (collectionID === 'completed' && filter === '') {
			// count += this.notLoaded(calendarID);
		  }
		  return count;
		};

		ListsModel.prototype.notLoaded = function(listID) {
		  if (angular.isUndefined(this.getById(listID))) {
			return 0;
		  } else {
			return this.getById(listID).notLoaded;
		  }
		};

		ListsModel.prototype.loadedAll = function(listID) {
		  return !this.notLoaded(listID);
		};

		ListsModel.prototype.getColor = function(listID) {
		  if (angular.isUndefined(this.getById(listID))) {
			return '#CCCCCC';
		  } else {
			return this.getById(listID).calendarcolor;
		  }
		};

		ListsModel.prototype.getName = function(listID) {
		  if (angular.isUndefined(this.getById(listID))) {
			return '';
		  } else {
			return this.getById(listID).displayname;
		  }
		};

		return ListsModel;

	  })(_Model);
	  return new ListsModel(TasksModel);
	}
  ]);

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
	__extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  angular.module('Tasks').factory('SettingsModel', [
	'_Model', function(_Model) {
	  var SettingsModel;
	  SettingsModel = (function(_super) {
		__extends(SettingsModel, _super);

		function SettingsModel() {
		  this._nameCache = {};
		  SettingsModel.__super__.constructor.call(this);
		}

		SettingsModel.prototype.add = function(data, clearCache) {
		  if (clearCache == null) {
			clearCache = true;
		  }
		  this._nameCache[data.displayname] = data;
		  if (angular.isDefined(data.id)) {
			return SettingsModel.__super__.add.call(this, data, clearCache);
		  } else {
			return this._data.push(data);
		  }
		};

		SettingsModel.prototype.toggle = function(type, setting) {
		  var set;
		  set = this.getById(type);
		  return this.getById(type)[setting] = !set[setting];
		};

		return SettingsModel;

	  })(_Model);
	  return new SettingsModel();
	}
  ]);

}).call(this);

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

			TasksModel.prototype.getChildren = function(task) {
				var children, t, tasks, _i, _len;
				tasks = this.getAll();
				children = [];
				for (_i = 0, _len = tasks.length; _i < _len; _i++) {
					t = tasks[_i];
					if (t.related === task.uid) {
						children.push(t);
					}
				}
				return children;
			};

			TasksModel.prototype.getDescendantIDs = function(task) {
				var child, children, descendantIDs, _i, _len;
				children = this.getChildren(task);
				descendantIDs = [];
				for (_i = 0, _len = children.length; _i < _len; _i++) {
					child = children[_i];
					descendantIDs = descendantIDs.concat(child.uri);
					descendantIDs = descendantIDs.concat(this.getDescendantIDs(child));
				}
				return descendantIDs;
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

angular.module('Tasks').factory('VTodo', ['$filter', 'ICalFactory', 'RandomStringService', function($filter, icalfactory, RandomStringService) {
	'use strict';

	// /**
	//  * check if vevent is the one described in event
	//  * @param {String} recurrenceId
	//  * @param {Object} vevent
	//  * @returns {boolean}
	//  */
	// function isCorrectEvent(recurrenceId, vevent) {
	// 	if (recurrenceId === null) {
	// 		if (!vevent.hasProperty('recurrence-id')) {
	// 			return true;
	// 		}
	// 	} else {
	// 		if (recurrenceId === vevent.getFirstPropertyValue('recurrence-id').toICALString()) {
	// 			return true;
	// 		}
	// 	}

	// 	return false;
	// }

	// /**
	//  * get DTEND from vevent
	//  * @param {object} vevent
	//  * @returns {ICAL.Time}
	//  */
	// function calculateDTEnd(vevent) {
	// 	if (vevent.hasProperty('dtend')) {
	// 		return vevent.getFirstPropertyValue('dtend');
	// 	} else if (vevent.hasProperty('duration')) {
	// 		var dtstart = vevent.getFirstPropertyValue('dtstart').clone();
	// 		dtstart.addDuration(vevent.getFirstPropertyValue('duration'));
	// 		return dtstart;
	// 	} else {
	// 		return vevent.getFirstPropertyValue('dtstart').clone();
	// 	}
	// }


	// /**
	//  * register timezones from ical response
	//  * @param components
	//  */
	// function registerTimezones(components) {
	// 	var vtimezones = components.getAllSubcomponents('vtimezone');
	// 	angular.forEach(vtimezones, function (vtimezone) {
	// 		var timezone = new ICAL.Timezone(vtimezone);
	// 		ICAL.TimezoneService.register(timezone.tzid, timezone);
	// 	});
	// }

	// /**
	//  * check if we need to convert the timezone of either dtstart or dtend
	//  * @param dt
	//  * @returns {boolean}
	//  */
	// function isTimezoneConversionNecessary(dt) {
	// 	return (dt.icaltype !== 'date' &&
	// 	dt.zone !== ICAL.Timezone.utcTimezone &&
	// 	dt.zone !== ICAL.Timezone.localTimezone);
	// }

	// /**
	//  * check if dtstart and dtend are both of type date
	//  * @param dtstart
	//  * @param dtend
	//  * @returns {boolean}
	//  */
	// function isEventAllDay(dtstart, dtend) {
	// 	return (dtstart.icaltype === 'date' && dtend.icaltype === 'date');
	// }

	// *
	//  * parse an recurring event
	//  * @param vevent
	//  * @param start
	//  * @param end
	//  * @param timezone
	//  * @return []
	 
	// function parseTimeForRecurringEvent(vevent, start, end, timezone) {
	// 	var dtstart = vevent.getFirstPropertyValue('dtstart');
	// 	var dtend = calculateDTEnd(vevent);
	// 	var duration = dtend.subtractDate(dtstart);
	// 	var fcDataContainer = [];

	// 	var iterator = new ICAL.RecurExpansion({
	// 		component: vevent,
	// 		dtstart: dtstart
	// 	});

	// 	var next;
	// 	while ((next = iterator.next())) {
	// 		if (next.compare(start) < 0) {
	// 			continue;
	// 		}
	// 		if (next.compare(end) > 0) {
	// 			break;
	// 		}

	// 		var dtstartOfRecurrence = next.clone();
	// 		var dtendOfRecurrence = next.clone();
	// 		dtendOfRecurrence.addDuration(duration);

	// 		if (isTimezoneConversionNecessary(dtstartOfRecurrence) && timezone) {
	// 			dtstartOfRecurrence = dtstartOfRecurrence.convertToZone(timezone);
	// 		}
	// 		if (isTimezoneConversionNecessary(dtendOfRecurrence) && timezone) {
	// 			dtendOfRecurrence = dtendOfRecurrence.convertToZone(timezone);
	// 		}

	// 		fcDataContainer.push({
	// 			allDay: isEventAllDay(dtstartOfRecurrence, dtendOfRecurrence),
	// 			start: dtstartOfRecurrence.toJSDate(),
	// 			end: dtendOfRecurrence.toJSDate(),
	// 			repeating: true
	// 		});
	// 	}

	// 	return fcDataContainer;
	// }

	// /**
	//  * parse a single event
	//  * @param vevent
	//  * @param timezone
	//  * @returns {object}
	//  */
	// function parseTimeForSingleEvent(vevent, timezone) {
	// 	var dtstart = vevent.getFirstPropertyValue('dtstart');
	// 	var dtend = calculateDTEnd(vevent);

	// 	if (isTimezoneConversionNecessary(dtstart) && timezone) {
	// 		dtstart = dtstart.convertToZone(timezone);
	// 	}
	// 	if (isTimezoneConversionNecessary(dtend) && timezone) {
	// 		dtend = dtend.convertToZone(timezone);
	// 	}

	// 	return {
	// 		allDay: isEventAllDay(dtstart, dtend),
	// 		start: dtstart.toJSDate(),
	// 		end: dtend.toJSDate(),
	// 		repeating: false
	// 	};
	// }

	function VTodo(calendar, props, uri) {
		var _this = this;

		angular.extend(this, {
			calendar: calendar,
			data: props['{urn:ietf:params:xml:ns:caldav}calendar-data'],
			uri: uri,
			etag: props['{DAV:}getetag'] || null
		});

		this.jCal = ICAL.parse(this.data);
		this.components = new ICAL.Component(this.jCal);

		if (this.components.jCal.length === 0) {
			throw "invalid calendar";
		}

		// angular.extend(this, {
		// 	getFcEvent: function(start, end, timezone) {
		// 		var iCalStart = new ICAL.Time();
		// 		iCalStart.fromUnixTime(start.format('X'));
		// 		var iCalEnd = new ICAL.Time();
		// 		iCalEnd.fromUnixTime(end.format('X'));

		// 		if (_this.components.jCal.length === 0) {
		// 			return [];
		// 		}

		// 		registerTimezones(_this.components);

		// 		var vevents = _this.components.getAllSubcomponents('vevent');
		// 		var renderedEvents = [];

		// 		angular.forEach(vevents, function (vevent) {
		// 			var event = new ICAL.Event(vevent);
		// 			var fcData;

		// 			try {
		// 				if (!vevent.hasProperty('dtstart')) {
		// 					return;
		// 				}
		// 				if (event.isRecurring()) {
		// 					fcData = parseTimeForRecurringEvent(vevent, iCalStart, iCalEnd, timezone.jCal);
		// 				} else {
		// 					fcData = [];
		// 					fcData.push(parseTimeForSingleEvent(vevent, timezone.jCal));
		// 				}
		// 			} catch(e) {
		// 				console.log(e);
		// 			}

		// 			if (typeof fcData === 'undefined') {
		// 				return;
		// 			}

		// 			for (var i = 0, length = fcData.length; i < length; i++) {
		// 				// add information about calendar
		// 				fcData[i].calendar = _this.calendar;
		// 				fcData[i].editable = calendar.writable;
		// 				fcData[i].backgroundColor = calendar.color;
		// 				fcData[i].borderColor = calendar.color;
		// 				fcData[i].textColor = calendar.textColor;
		// 				fcData[i].className = 'fcCalendar-id-' + calendar.tmpId;

		// 				// add information about actual event
		// 				fcData[i].uri = _this.uri;
		// 				fcData[i].etag = _this.etag;
		// 				fcData[i].title = vevent.getFirstPropertyValue('summary');

		// 				if (event.isRecurrenceException()) {
		// 					fcData[i].recurrenceId = vevent
		// 						.getFirstPropertyValue('recurrence-id')
		// 						.toICALString();
		// 					fcData[i].id = _this.uri + event.recurrenceId;
		// 				} else {
		// 					fcData[i].recurrenceId = null;
		// 					fcData[i].id = _this.uri;
		// 				}

		// 				fcData[i].event = _this;

		// 				renderedEvents.push(fcData[i]);
		// 			}
		// 		});

		// 		return renderedEvents;
		// 	},
		// 	getSimpleData: function(recurrenceId) {
		// 		var vevents = _this.components.getAllSubcomponents('vevent');

		// 		for (var i = 0; i < vevents.length; i++) {
		// 			if (!isCorrectEvent(recurrenceId, vevents[i])) {
		// 				continue;
		// 			}

		// 			return objectConverter.parse(vevents[i]);
		// 		}
		// 	},
		// 	drop: function(recurrenceId, delta) {
		// 		var vevents = _this.components.getAllSubcomponents('vevent');
		// 		var foundEvent = false;
		// 		var deltaAsSeconds = delta.asSeconds();
		// 		var duration = new ICAL.Duration().fromSeconds(deltaAsSeconds);
		// 		var propertyToUpdate = null;

		// 		for (var i = 0; i < vevents.length; i++) {
		// 			if (!isCorrectEvent(recurrenceId, vevents[i])) {
		// 				continue;
		// 			}

		// 			if (vevents[i].hasProperty('dtstart')) {
		// 				propertyToUpdate = vevents[i].getFirstPropertyValue('dtstart');
		// 				propertyToUpdate.addDuration(duration);
		// 				vevents[i].updatePropertyWithValue('dtstart', propertyToUpdate);
		// 			}

		// 			if (vevents[i].hasProperty('dtend')) {
		// 				propertyToUpdate = vevents[i].getFirstPropertyValue('dtend');
		// 				propertyToUpdate.addDuration(duration);
		// 				vevents[i].updatePropertyWithValue('dtend', propertyToUpdate);
		// 			}

		// 			foundEvent = true;
		// 		}

		// 		if (!foundEvent) {
		// 			return false;
		// 		}
		// 		_this.data = _this.components.toString();
		// 		return true;
		// 	},
		// 	resize: function(recurrenceId, delta) {
		// 		var vevents = _this.components.getAllSubcomponents('vevent');
		// 		var foundEvent = false;
		// 		var deltaAsSeconds = delta.asSeconds();
		// 		var duration = new ICAL.Duration().fromSeconds(deltaAsSeconds);
		// 		var propertyToUpdate = null;

		// 		for (var i = 0; i < vevents.length; i++) {
		// 			if (!isCorrectEvent(recurrenceId, vevents[i])) {
		// 				continue;
		// 			}

		// 			if (vevents[i].hasProperty('duration')) {
		// 				propertyToUpdate = vevents[i].getFirstPropertyValue('duration');
		// 				duration.fromSeconds((duration.toSeconds() + propertyToUpdate.toSeconds()));
		// 				vevents[i].updatePropertyWithValue('duration', duration);
		// 			} else if (vevents[i].hasProperty('dtend')) {
		// 				propertyToUpdate = vevents[i].getFirstPropertyValue('dtend');
		// 				propertyToUpdate.addDuration(duration);
		// 				vevents[i].updatePropertyWithValue('dtend', propertyToUpdate);
		// 			} else if (vevents[i].hasProperty('dtstart')) {
		// 				propertyToUpdate = vevents[i].getFirstPropertyValue('dtstart').clone();
		// 				propertyToUpdate.addDuration(duration);
		// 				vevents[i].addPropertyWithValue('dtend', propertyToUpdate);
		// 			} else {
		// 				continue;
		// 			}

		// 			foundEvent = true;
		// 		}

		// 		if (!foundEvent) {
		// 			return false;
		// 		}

		// 		_this.data = _this.components.toString();
		// 		return true;
		// 	},
		// 	patch: function(recurrenceId, newSimpleData) {
		// 		var vevents = _this.components.getAllSubcomponents('vevent');
		// 		var vevent = null;

		// 		for (var i = 0; i < vevents.length; i++) {
		// 			if (!isCorrectEvent(recurrenceId, vevents[i])) {
		// 				continue;
		// 			}

		// 			vevent = vevents[i];
		// 		}

		// 		if (!vevent) {
		// 			return false;
		// 		}

		// 		objectConverter.patch(vevent, this.getSimpleData(recurrenceId), newSimpleData);
		// 		vevent.updatePropertyWithValue('last-modified', ICAL.Time.now());
		// 		_this.data = _this.components.toString();
		// 	}
		// });
	}

	VTodo.prototype = {
		get calendaruri() {
			return this.calendar.uri;
		},
		get summary() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			return vtodos[0].getFirstPropertyValue('summary');
		},
		set summary(summary) {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			vtodos[0].updatePropertyWithValue('summary', summary);
			this.data = this.components.toString();
		},
		get priority() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			var priority = vtodos[0].getFirstPropertyValue('priority');
			return (10 - priority) % 10;
		},
		set priority(priority) {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			vtodos[0].updatePropertyWithValue('priority', (10 - priority) % 10);
			this.data = this.components.toString();
		},
		get complete() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			return vtodos[0].getFirstPropertyValue('percent-complete') || 0;
		},
		set complete(complete) {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			vtodos[0].updatePropertyWithValue('percent-complete', complete);
			this.data = this.components.toString();
		},
		get completed() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			var comp = vtodos[0].getFirstPropertyValue('completed');
			if (comp) {
				return true;
			} else {
				return false;
			}
		},
		set completed(completed) {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			if (completed) {
				vtodos[0].updatePropertyWithValue('completed', completed);
			} else {
				vtodos[0].removeProperty('completed');
			}
			this.data = this.components.toString();
		},
		get completed_date() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			var comp = vtodos[0].getFirstPropertyValue('completed');
			if (comp) {
				return comp.toJSDate();
			} else {
				return null;
			}
		},
		get status() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			return vtodos[0].getFirstPropertyValue('status');
		},
		set status(status) {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			vtodos[0].updatePropertyWithValue('status', status);
			this.data = this.components.toString();
		},
		get note() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			return vtodos[0].getFirstPropertyValue('note') || '';
		},
		get uid() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			return vtodos[0].getFirstPropertyValue('uid') || '';
		},
		get related() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			return vtodos[0].getFirstPropertyValue('related-to') || null;
		},
		get hideSubtasks() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			return +vtodos[0].getFirstPropertyValue('x-oc-hidesubtasks') || 0;
		},
		set hideSubtasks(hide) {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			vtodos[0].updatePropertyWithValue('x-oc-hidesubtasks', +hide);
			this.data = this.components.toString();
		},
		get reminder() {
			return null;
		},
		get categories() {
			return null;
		},
		get start() {
			return null;
		},
		get due() {
			return null;
		},
		get comments() {
			return null;
		},
		// get enabled() {
		// 	return this._properties.enabled;
		// },
		// get components() {
		// 	return this._properties.components;
		// },
		// set enabled(enabled) {
		// 	this._properties.enabled = enabled;
		// 	this._setUpdated('enabled');
		// }
	}

	VTodo.create = function(task) {
		var comp = icalfactory.new();

		var vtodo = new ICAL.Component('vtodo');
		comp.addSubcomponent(vtodo);
		vtodo.updatePropertyWithValue('created', ICAL.Time.now());
		vtodo.updatePropertyWithValue('dtstamp', ICAL.Time.now());
		vtodo.updatePropertyWithValue('last-modified', ICAL.Time.now());
		vtodo.updatePropertyWithValue('uid', RandomStringService.generate());
		vtodo.updatePropertyWithValue('summary', task.summary);
		vtodo.updatePropertyWithValue('priority', task.priority);
		vtodo.updatePropertyWithValue('percent-complete', task.complete);
		vtodo.updatePropertyWithValue('x-oc-hidesubtasks', 0);
		if (task.related) {
			vtodo.updatePropertyWithValue('related-to', task.related);
		}
		if (task.note) {
			vtodo.updatePropertyWithValue('note', task.note);
		}

		// objectConverter.patch(vevent, {}, {
		// 	allDay: !start.hasTime() && !end.hasTime(),
		// 	dtstart: {
		// 		type: start.hasTime() ? 'datetime' : 'date',
		// 		value: start,
		// 		parameters: {
		// 			zone: timezone
		// 		}
		// 	},
		// 	dtend: {
		// 		type: end.hasTime() ? 'datetime' : 'date',
		// 		value: end,
		// 		parameters: {
		// 			zone: timezone
		// 		}
		// 	}
		// });

		return new VTodo(task.calendar, {
			'{urn:ietf:params:xml:ns:caldav}calendar-data': comp.toString(),
			'{DAV:}getetag': null
		}, null);
	};

	return VTodo;
}]);

(function() {
  angular.module('Tasks').factory('Persistence', [
	'Request', 'Loading', '$rootScope', '$q', 'CalendarService', function(Request, Loading, $rootScope, $q, CalendarService) {
	  var Persistence;
	  Persistence = (function() {
		function Persistence(_request, _Loading, _$rootScope, _CalendarService) {
		  this._request = _request;
		  this._Loading = _Loading;
		  this._$rootScope = _$rootScope;
		  this._CalendarService = _CalendarService;
		}

		Persistence.prototype.init = function() {
		  var successCallback,
			_this = this;
		  this.deferred = $q.defer();
		  successCallback = function() {
			return _this.deferred.resolve();
		  };
		  this.getCollections();
		  this.getSettings();
		  return this.deferred.promise;
		};

		Persistence.prototype.getCollections = function(onSuccess, showLoading) {
		  var failureCallbackWrapper, params, successCallbackWrapper,
			_this = this;
		  if (showLoading == null) {
			showLoading = true;
		  }
		  onSuccess || (onSuccess = function() {});
		  if (showLoading) {
			this._Loading.increase();
			successCallbackWrapper = function(data) {
			  onSuccess();
			  return _this._Loading.decrease();
			};
			failureCallbackWrapper = function(data) {
			  return _this._Loading.decrease();
			};
		  } else {
			successCallbackWrapper = function(data) {
			  return onSuccess();
			};
			failureCallbackWrapper = function(data) {};
		  }
		  params = {
			onSuccess: successCallbackWrapper,
			onFailure: failureCallbackWrapper
		  };
		  return this._request.get('/apps/tasks/collections', params);
		};

		Persistence.prototype.getSettings = function(onSuccess, showLoading) {
		  var failureCallbackWrapper, params, successCallbackWrapper,
			_this = this;
		  if (showLoading == null) {
			showLoading = true;
		  }
		  onSuccess || (onSuccess = function() {});
		  if (showLoading) {
			this._Loading.increase();
			successCallbackWrapper = function(data) {
			  onSuccess();
			  return _this._Loading.decrease();
			};
			failureCallbackWrapper = function(data) {
			  return _this._Loading.decrease();
			};
		  } else {
			successCallbackWrapper = function(data) {
			  return onSuccess();
			};
			failureCallbackWrapper = function(data) {};
		  }
		  params = {
			onSuccess: successCallbackWrapper,
			onFailure: failureCallbackWrapper
		  };
		  return this._request.get('/apps/tasks/settings', params);
		};

		Persistence.prototype.setVisibility = function(collectionID, visibility) {
		  var params;
		  params = {
			routeParams: {
			  collectionID: collectionID,
			  visibility: visibility
			}
		  };
		  return this._request.post('/apps/tasks/collection/\
			{collectionID}/visibility/{visibility}', params);
		};

		Persistence.prototype.setting = function(type, setting, value) {
		  var params;
		  params = {
			routeParams: {
			  type: type,
			  setting: setting,
			  value: +value
			}
		  };
		  return this._request.post('/apps/tasks/settings/\
			{type}/{setting}/{value}', params);
		};

		Persistence.prototype.getTasks = function(type, listID, onSuccess, showLoading) {
		  var failureCallbackWrapper, params, successCallbackWrapper,
			_this = this;
		  if (type == null) {
			type = 'init';
		  }
		  if (listID == null) {
			listID = 'all';
		  }
		  if (showLoading == null) {
			showLoading = true;
		  }
		  onSuccess || (onSuccess = function() {});
		  if (showLoading) {
			this._Loading.increase();
			successCallbackWrapper = function(data) {
			  onSuccess();
			  return _this._Loading.decrease();
			};
			failureCallbackWrapper = function(data) {
			  return _this._Loading.decrease();
			};
		  } else {
			successCallbackWrapper = function(data) {
			  return onSuccess();
			};
			failureCallbackWrapper = function(data) {};
		  }
		  params = {
			onSuccess: successCallbackWrapper,
			onFailure: failureCallbackWrapper,
			routeParams: {
			  listID: listID,
			  type: type
			}
		  };
		  return this._request.get('/apps/tasks/tasks/{type}/{listID}', params);
		};

		Persistence.prototype.getTask = function(taskID, onSuccess, showLoading) {
		  var failureCallbackWrapper, params, successCallbackWrapper,
			_this = this;
		  if (showLoading == null) {
			showLoading = true;
		  }
		  onSuccess || (onSuccess = function() {});
		  if (showLoading) {
			this._Loading.increase();
			successCallbackWrapper = function() {
			  onSuccess();
			  return _this._Loading.decrease();
			};
			failureCallbackWrapper = function() {
			  return _this._Loading.decrease();
			};
		  } else {
			successCallbackWrapper = function() {
			  return onSuccess();
			};
			failureCallbackWrapper = function() {};
		  }
		  params = {
			onSuccess: successCallbackWrapper,
			onFailure: failureCallbackWrapper,
			routeParams: {
			  taskID: taskID
			}
		  };
		  return this._request.get('/apps/tasks/task/{taskID}', params);
		};

		Persistence.prototype.setPercentComplete = function(taskID, complete) {
		  var params;
		  params = {
			routeParams: {
			  taskID: taskID
			},
			data: {
			  complete: complete
			}
		  };
		  return this._request.post('/apps/tasks/tasks/{taskID}/percentcomplete', params);
		};

		Persistence.prototype.setPriority = function(taskID, priority) {
		  var params;
		  params = {
			routeParams: {
			  taskID: taskID
			},
			data: {
			  priority: priority
			}
		  };
		  return this._request.post('/apps/tasks/tasks/{taskID}/priority', params);
		};

		Persistence.prototype.setHideSubtasks = function(taskID, hide) {
		  var params;
		  params = {
			routeParams: {
			  taskID: taskID
			},
			data: {
			  hide: hide
			}
		  };
		  return this._request.post('/apps/tasks/tasks/{taskID}/hidesubtasks', params);
		};

		Persistence.prototype.addTask = function(task, onSuccess, onFailure) {
		  var params;
		  if (onSuccess == null) {
			onSuccess = null;
		  }
		  if (onFailure == null) {
			onFailure = null;
		  }
		  onSuccess || (onSuccess = function() {});
		  onFailure || (onFailure = function() {});
		  params = {
			data: {
			  name: task.name,
			  related: task.related,
			  calendarID: task.calendarid,
			  starred: task.starred,
			  due: task.due,
			  start: task.start,
			  tmpID: task.tmpID
			},
			onSuccess: onSuccess,
			onFailure: onFailure
		  };
		  return this._request.post('/apps/tasks/tasks/add', params);
		};

		Persistence.prototype.deleteTask = function(taskID) {
		  var params;
		  params = {
			routeParams: {
			  taskID: taskID
			}
		  };
		  return this._request.post('/apps/tasks/tasks/{taskID}/delete', params);
		};

		Persistence.prototype.setDueDate = function(taskID, due) {
		  var params;
		  params = {
			routeParams: {
			  taskID: taskID
			},
			data: {
			  due: due
			}
		  };
		  return this._request.post('/apps/tasks/tasks/{taskID}/due', params);
		};

		Persistence.prototype.setStartDate = function(taskID, start) {
		  var params;
		  params = {
			routeParams: {
			  taskID: taskID
			},
			data: {
			  start: start
			}
		  };
		  return this._request.post('/apps/tasks/tasks/{taskID}/start', params);
		};

		Persistence.prototype.setReminder = function(taskID, reminder) {
		  var params;
		  if (reminder === false) {
			params = {
			  routeParams: {
				taskID: taskID
			  },
			  data: {
				type: false
			  }
			};
		  } else if (reminder.type === 'DATE-TIME') {
			params = {
			  routeParams: {
				taskID: taskID
			  },
			  data: {
				type: reminder.type,
				action: reminder.action,
				date: moment(reminder.date, 'YYYYMMDDTHHmmss').unix()
			  }
			};
		  } else if (reminder.type === 'DURATION') {
			params = {
			  routeParams: {
				taskID: taskID
			  },
			  data: {
				type: reminder.type,
				action: reminder.action,
				week: reminder.duration.week,
				day: reminder.duration.day,
				hour: reminder.duration.hour,
				minute: reminder.duration.minute,
				second: reminder.duration.second,
				invert: reminder.duration.params.invert,
				related: reminder.duration.params.related
			  }
			};
		  } else {
			return;
		  }
		  return this._request.post('/apps/tasks/tasks/{taskID}/reminder', params);
		};

		Persistence.prototype.changeCalendarId = function(taskID, calendarID) {
		  var params;
		  params = {
			routeParams: {
			  taskID: taskID
			},
			data: {
			  calendarID: calendarID
			}
		  };
		  return this._request.post('/apps/tasks/tasks/{taskID}/calendar', params);
		};

		Persistence.prototype.changeParent = function(taskID, related) {
		  var params;
		  params = {
			routeParams: {
			  taskID: taskID
			},
			data: {
			  related: related
			}
		  };
		  return this._request.post('/apps/tasks/tasks/{taskID}/parent', params);
		};

		Persistence.prototype.setTaskName = function(taskID, name) {
		  var params;
		  params = {
			routeParams: {
			  taskID: taskID
			},
			data: {
			  name: name
			}
		  };
		  return this._request.post('/apps/tasks/tasks/{taskID}/name', params);
		};

		Persistence.prototype.setTaskNote = function(taskID, note) {
		  var params;
		  params = {
			routeParams: {
			  taskID: taskID
			},
			data: {
			  note: note
			}
		  };
		  return this._request.post('/apps/tasks/tasks/{taskID}/note', params);
		};

		Persistence.prototype.setShowHidden = function(showHidden) {
		  var params;
		  params = {
			routeParams: {
			  showHidden: +showHidden
			}
		  };
		  return this._request.post('/apps/tasks/settings/showhidden/{showHidden}', params);
		};

		Persistence.prototype.addComment = function(comment, onSuccess, onFailure) {
		  var params;
		  if (onSuccess == null) {
			onSuccess = null;
		  }
		  if (onFailure == null) {
			onFailure = null;
		  }
		  params = {
			routeParams: {
			  taskID: comment.taskID
			},
			data: {
			  comment: comment.comment,
			  tmpID: comment.tmpID
			},
			onSuccess: onSuccess,
			onFailure: onFailure
		  };
		  return this._request.post('/apps/tasks/tasks/{taskID}/comment', params);
		};

		Persistence.prototype.deleteComment = function(taskID, commentID) {
		  var params;
		  params = {
			routeParams: {
			  taskID: taskID,
			  commentID: commentID
			}
		  };
		  return this._request.post('/apps/tasks/tasks/{taskID}/comment/\
			{commentID}/delete', params);
		};

		Persistence.prototype.addCategory = function(taskID, category) {
		  var params;
		  params = {
			routeParams: {
			  taskID: taskID
			},
			data: {
			  category: category
			}
		  };
		  return this._request.post('/apps/tasks/tasks/{taskID}/category/add', params);
		};

		Persistence.prototype.removeCategory = function(taskID, category) {
		  var params;
		  params = {
			routeParams: {
			  taskID: taskID
			},
			data: {
			  category: category
			}
		  };
		  return this._request.post('/apps/tasks/tasks/{taskID}/category/remove', params);
		};

		return Persistence;

	  })();
	  return new Persistence(Request, Loading, $rootScope, CalendarService);
	}
  ]);

}).call(this);

(function() {
  angular.module('Tasks').factory('Publisher', [
	'CollectionsModel', 'SettingsModel', function(CollectionsModel, SettingsModel) {
	  var Publisher;
	  Publisher = (function() {
		function Publisher(_$collectionsmodel, _$settingsmodel) {
		  this._$collectionsmodel = _$collectionsmodel;
		  this._$settingsmodel = _$settingsmodel;
		  this._subscriptions = {};
		  this.subscribeObjectTo(this._$collectionsmodel, 'collections');
		  this.subscribeObjectTo(this._$settingsmodel, 'settings');
		}

		Publisher.prototype.subscribeObjectTo = function(object, name) {
		  var base;
		  (base = this._subscriptions)[name] || (base[name] = []);
		  return this._subscriptions[name].push(object);
		};

		Publisher.prototype.publishDataTo = function(data, name) {
		  var ref, results, subscriber, _i, _len;
		  ref = this._subscriptions[name] || [];
		  results = [];
		  for (_i = 0, _len = ref.length; _i < _len; _i++) {
			subscriber = ref[_i];
			results.push(subscriber.handle(data));
		  }
		  return results;
		};

		return Publisher;

	  })();
	  return new Publisher(CollectionsModel, SettingsModel);
	}
  ]);

}).call(this);

angular.module('Tasks').factory('RandomStringService', function () {
	'use strict';

	return {
		generate: function() {
			return Math.random().toString(36).substr(2);
		}
	};
});

(function() {
  angular.module('Tasks').factory('Request', [
	'$http', 'Publisher', function($http, Publisher) {
	  var Request;
	  Request = (function() {
		function Request($http, publisher) {
		  this.$http = $http;
		  this.publisher = publisher;
		  this.count = 0;
		  this.initialized = false;
		  this.shelvedRequests = [];
		  this.initialized = true;
		  this._executeShelvedRequests();
		}

		Request.prototype.request = function(route, data) {
		  var defaultConfig, defaultData, url;
		  if (data === null) {
			data = {};
		  }
		  defaultData = {
			routeParams: {},
			data: {},
			onSuccess: function() {
			  return {};
			},
			onFailure: function() {
			  return {};
			},
			config: {}
		  };
		  angular.extend(defaultData, data);
		  if (!this.initialized) {
			this._shelveRequest(route, defaultData);
			return;
		  }
		  url = OC.generateUrl(route, defaultData.routeParams);
		  defaultConfig = {
			url: url,
			data: defaultData.data
		  };
		  angular.extend(defaultConfig, defaultData.config);
		  if (defaultConfig.method === 'GET') {
			defaultConfig.params = defaultConfig.data;
		  }
		  return this.$http(defaultConfig).success((function(_this) {
			return function(data, status, headers, config) {
			  var name, ref, value;
			  ref = data.data;
			  for (name in ref) {
				value = ref[name];
				_this.publisher.publishDataTo(value, name);
			  }
			  return defaultData.onSuccess(data, status, headers, config);
			};
		  })(this)).error(function(data, status, headers, config) {
			return defaultData.onFailure(data, status, headers, config);
		  });
		};

		Request.prototype.post = function(route, data) {
		  if (data === null) {
			data = {};
		  }
		  data.config || (data.config = {});
		  data.config.method = 'POST';
		  return this.request(route, data);
		};

		Request.prototype.get = function(route, data) {
		  if (data === null) {
			data = {};
		  }
		  data.config || (data.config = {});
		  data.config.method = 'GET';
		  return this.request(route, data);
		};

		Request.prototype.put = function(route, data) {
		  if (data === null) {
			data = {};
		  }
		  data.config || (data.config = {});
		  data.config.method = 'PUT';
		  return this.request(route, data);
		};

		Request.prototype["delete"] = function(route, data) {
		  if (data === null) {
			data = {};
		  }
		  data.config || (data.config = {});
		  data.config.method = 'DELETE';
		  return this.request(route, data);
		};

		Request.prototype._shelveRequest = function(route, data) {
		  var request;
		  request = {
			route: route,
			data: data
		  };
		  return this.shelvedRequests.push(request);
		};

		Request.prototype._executeShelvedRequests = function() {
		  var r, ref, results, _i, _len;
		  ref = this.shelvedRequests;
		  results = [];
		  for (_i = 0, _len = ref.length; _i < _len; _i++) {
			r = ref[_i];
			results.push(this.request(r.route, r.data));
		  }
		  return results;
		};

		return Request;

	  })();
	  return new Request($http, Publisher);
	}
  ]);

}).call(this);

angular.module('Tasks').factory('Status', [
	function() {
		var Status;
		Status = (function() {
			function Status() {
				this._$status = {
					addingList: false,
				focusTaskInput: false
				};
			}

		Status.prototype.getStatus = function() {
			return this._$status;
		};

		return Status;

		})();
		return new Status();
	}
]);

angular.module('Tasks').service('VTodoService', ['DavClient', 'VTodo', 'RandomStringService', function(DavClient, VTodo, RandomStringService) {
	'use strict';

	var _this = this;

	this.getAll = function(calendar) {
		var xmlDoc = document.implementation.createDocument('', '', null);
		var cCalQuery = xmlDoc.createElement('c:calendar-query');
		cCalQuery.setAttribute('xmlns:c', 'urn:ietf:params:xml:ns:caldav');
		cCalQuery.setAttribute('xmlns:d', 'DAV:');
		cCalQuery.setAttribute('xmlns:a', 'http://apple.com/ns/ical/');
		cCalQuery.setAttribute('xmlns:o', 'http://owncloud.org/ns');
		xmlDoc.appendChild(cCalQuery);

		var dProp = xmlDoc.createElement('d:prop');
		cCalQuery.appendChild(dProp);

		var dGetEtag = xmlDoc.createElement('d:getetag');
		dProp.appendChild(dGetEtag);

		var cCalendarData = xmlDoc.createElement('c:calendar-data');
		dProp.appendChild(cCalendarData);

		var cFilter = xmlDoc.createElement('c:filter');
		cCalQuery.appendChild(cFilter);

		var cCompFilterVCal = xmlDoc.createElement('c:comp-filter');
		cCompFilterVCal.setAttribute('name', 'VCALENDAR');
		cFilter.appendChild(cCompFilterVCal);

		var cCompFilterVTodo = xmlDoc.createElement('c:comp-filter');
		cCompFilterVTodo.setAttribute('name', 'VTODO');
		cCompFilterVCal.appendChild(cCompFilterVTodo);

		// var cTimeRange = xmlDoc.createElement('c:time-range');
		// cTimeRange.setAttribute('start', this._getTimeRangeStamp(start));
		// cTimeRange.setAttribute('end', this._getTimeRangeStamp(end));
		// cCompFilterVTodo.appendChild(cTimeRange);

		var url = calendar.url;
		var headers = {
			'Content-Type': 'application/xml; charset=utf-8',
			'Depth': 1,
			'requesttoken': OC.requestToken
		};
		var body = cCalQuery.outerHTML;

		return DavClient.request('REPORT', url, headers, body).then(function(response) {
			if (!DavClient.wasRequestSuccessful(response.status)) {
				//TODO - something went wrong
				return;
			}

			var vTodos = [];

			for (var i in response.body) {
				var object = response.body[i];
				var properties = object.propStat[0].properties;

				var uri = object.href.substr(object.href.lastIndexOf('/') + 1);

				var vTodo = new VTodo(calendar, properties, uri);
				vTodos.push(vTodo);
			}

			return vTodos;
		});
	};

	this.get = function(calendar, uri) {
		var url = calendar.url + uri;
		return DavClient.request('GET', url, {'requesttoken' : OC.requestToken}, '').then(function(response) {
			return new VTodo(calendar, {
				'{urn:ietf:params:xml:ns:caldav}calendar-data': response.body,
				'{DAV:}getetag': response.xhr.getResponseHeader('ETag')
			}, uri);
		});
	};

	this.create = function(calendar, data, returnTodo) {
		if (typeof returnTodo === 'undefined') {
			returnTodo = true;
		}

		var headers = {
			'Content-Type': 'text/calendar; charset=utf-8',
			'requesttoken': OC.requestToken
		};
		var uri = this._generateRandomUri();
		var url = calendar.url + uri;

		return DavClient.request('PUT', url, headers, data).then(function(response) {
			if (!DavClient.wasRequestSuccessful(response.status)) {
				console.log(response);
				return false;
				// TODO - something went wrong, do smth about it
			}

			return returnTodo ?
				_this.get(calendar, uri) :
				true;
		});
	};

	this.update = function(task) {
		var url = task.calendar.url + task.uri;
		var headers = {
			'Content-Type': 'text/calendar; charset=utf-8',
			'If-Match': task.etag,
			'requesttoken': OC.requestToken
		};

		return DavClient.request('PUT', url, headers, task.data).then(function(response) {
			task.etag = response.xhr.getResponseHeader('ETag');
			return DavClient.wasRequestSuccessful(response.status);
		});
	};

	this.delete = function(task) {
		var url = task.calendar.url + task.uri;
		var headers = {
			'If-Match': task.etag,
			'requesttoken': OC.requestToken
		};

		return DavClient.request('DELETE', url, headers, '').then(function(response) {
			return DavClient.wasRequestSuccessful(response.status);
		});
	};

	this._generateRandomUri = function() {
		var uri = 'ownCloud-';
		uri += RandomStringService.generate();
		uri += RandomStringService.generate();
		uri += '.ics';

		return uri;
	};

	// this._getTimeRangeStamp = function(momentObject) {
	// 	return momentObject.format('YYYYMMDD') + 'T' + momentObject.format('HHmmss') + 'Z';
	// };

}]);

})(window.angular, window.jQuery, oc_requesttoken);
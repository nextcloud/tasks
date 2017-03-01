
/**
 * Nextcloud - Tasks - v0.9.5
 *
 * Copyright (c) 2017 - Raimund Schlüßler <raimund.schluessler@googlemail.com>
 *
 * This file is licensed under the Affero			 General Public License version 3 or later.
 * See the COPYING file
 *
 */


angular.module('Tasks', ['ngRoute', 'ngAnimate', 'ui.select', 'ngSanitize', 'dndLists']).config([
	'$provide', '$routeProvider', '$interpolateProvider', '$httpProvider',
	function($provide, $routeProvider, $interpolateProvider, $httpProvider) {
		'use strict';
		var config;
		$provide.value('Config', config = {
			markReadTimeout: 500,
			taskUpdateInterval: 1000 * 600
		});
		$httpProvider.defaults.headers.common.requesttoken = oc_requesttoken;
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
		.when('/search/:searchString/tasks/:taskID/edit/:parameter', {})
		.otherwise({
			redirectTo: '/collections/all'
		});
	}
]);

angular.module('Tasks').run([
	'$document', '$rootScope', 'Config', '$timeout', 'ListsBusinessLayer', 'TasksBusinessLayer', 'SearchBusinessLayer',
	function($document, $rootScope, Config, $timeout, TasksBusinessLayer, ListsBusinessLayer, SearchBusinessLayer) {
		'use strict';
		var update;
		var init = false;
		(update = function() {
			var timeOutUpdate;
			timeOutUpdate = function() {
				return $timeout(update, Config.taskUpdateInterval);
			};
			init = true;
			return timeOutUpdate();
		}).call();
		OCA.Search.tasks = SearchBusinessLayer;
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
 		moment.locale('details_allday', {
 			calendar: {
 				lastDay: '[' + t('tasks', 'Due yesterday') + ']',
 				sameDay: '[' + t('tasks', 'Due today') + ']',
 				nextDay: '[' + t('tasks', 'Due tomorrow') + ']',
 				lastWeek: '[' + t('tasks', 'Due on') + '] MMM DD, YYYY',
 				nextWeek: '[' + t('tasks', 'Due on') + '] MMM DD, YYYY',
 				sameElse: '[' + t('tasks', 'Due on') + '] MMM DD, YYYY'
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
 		moment.locale('start_allday', {
 			calendar: {
 				lastDay: '[' + t('tasks', 'Started yesterday') + ']',
 				sameDay: '[' + t('tasks', 'Starts today') + ']',
 				nextDay: '[' + t('tasks', 'Starts tomorrow') + ']',
 				lastWeek: '[' + t('tasks', 'Started on') + '] MMM DD, YYYY',
 				nextWeek: '[' + t('tasks', 'Starts on') + '] MMM DD, YYYY',
 				sameElse: function() {
 					if (this.diff(moment()) > 0) {
 						return '[' + t('tasks', 'Starts on') + '] MMM DD, YYYY';
 					} else {
 						return '[' + t('tasks', 'Started on') + '] MMM DD, YYYY';
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

angular.module('Tasks').controller('AppController', [
	'$scope', '$rootScope', 'ListsBusinessLayer', '$route', 'Status', '$timeout', '$location', '$routeParams', 'Loading', 'SettingsModel', 'Persistence', function($scope, $rootScope, ListsBusinessLayer, $route, status, $timeout, $location, $routeParams, Loading, SettingsModel, Persistence) {
		'use strict';
		var AppController = (function() {
			function AppController(_$scope, $rootScope, _$listsbusinesslayer, _$route, _$status, _$timeout, _$location, _$routeparams, _Loading, _$settingsmodel, _persistence) {
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
					});
				});

				this._persistence.init();

				this._$scope.closeAll = function($event) {
					if ($($event.target).closest('.close-all').length || $($event.currentTarget).is($($event.target).closest('.handler'))) {
						if (!angular.isUndefined(_$scope.route.calendarID)) {
							if (_$scope.route.listparameter === 'name') {
								$rootScope.$broadcast('cancelEditCalendar', _$scope.route.calendarID);
							}
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
						_$scope.status.focusSubtaskInput = false;
					}
				};
				this._$scope.isLoading = function() {
					return _Loading.isLoading();
				};
			}
			return AppController;
		})();
		return new AppController($scope, $rootScope, ListsBusinessLayer, $route, status, $timeout, $location, $routeParams, Loading, SettingsModel, Persistence);
	}
]);

angular.module('Tasks').controller('DetailsController', [
	'$scope', '$window', 'TasksModel', 'TasksBusinessLayer', '$route', '$location', '$timeout', '$routeParams', 'SettingsModel', 'Loading', 'ListsModel',
	function($scope, $window, TasksModel, TasksBusinessLayer, $route, $location, $timeout, $routeParams, SettingsModel, Loading, ListsModel) {
		'use strict';
		var DetailsController = (function() {
			function DetailsController(_$scope, _$window, _$tasksmodel,
			_tasksbusinesslayer, _$route, _$location, _$timeout, _$routeparams, _$settingsmodel, _Loading, _$listsmodel) {
				this._$scope = _$scope;
				this._$window = _$window;
				this._$tasksmodel = _$tasksmodel;
				this._$listsmodel = _$listsmodel;
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
					var task = _$tasksmodel.getByUri(_$scope.route.taskID);

					if (!(angular.isUndefined(task) || task === null)) {
						_$scope.task = task;
						// Bind categories to task.cats as angular.ui/ui-select seems to have problems with Getter/Setter
						_$scope.task.cats = task.categories;
						_$scope.found = true;
					}  else if (_$scope.route.taskID !== void 0) {
						_$scope.found = false;
					}
				});

				this._$scope.settingsmodel = this._$settingsmodel;
				this._$scope.settingsmodel.add({
					'id': 'various',
					'categories': []
				});
				this._$scope.isAddingComment = false;
				this._$scope.timers = [];
				this._$scope.durations = [{
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
					var task = _$tasksmodel.getByUri(_$scope.route.taskID);
					if (!(angular.isUndefined(task) || task === null)) {
						_$scope.task = task;
						_$scope.found = true;
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
				this._$scope.deleteTask = function(task) {
					return _$timeout(function() {
						return _tasksbusinesslayer.deleteTask(task).then(function () {
							return $scope.$apply();
						});
					}, 500);
				};
				this._$scope.triggerUpdate = function(task) {
					_tasksbusinesslayer.triggerUpdate(task);
				};
				this._$scope.editName = function($event, task) {
					if (task.calendar.writable) {
						if (!$($event.target).is('a')) {
							_$scope.setEditRoute('name');
						}
					}
				};
				this._$scope.editDueDate = function($event, task) {
					if (task.calendar.writable) {
						if ($($event.currentTarget).is($($event.target).closest('.handler'))) {
							_$scope.setEditRoute('duedate');
							_tasksbusinesslayer.initDueDate(task);
						}
					}
				};
				this._$scope.editStart = function($event, task) {
					if (task.calendar.writable) {
						if ($($event.currentTarget).is($($event.target).closest('.handler'))) {
							_$scope.setEditRoute('startdate');
							_tasksbusinesslayer.initStartDate(task);
						}
					}
				};
				this._$scope.editReminder = function($event, task) {
					if (task.calendar.writable) {
						if ($($event.currentTarget).is($($event.target).closest('.handler'))) {
							_$scope.setEditRoute('reminer');
							return _tasksbusinesslayer.initReminder(_$scope.route.taskID);
						}
					}
				};
				this._$scope.editNote = function($event, task) {
					if (task.calendar.writable) {
						if ($($event.currentTarget).is($($event.target).closest('.handler'))) {
							if (!$($event.target).is('a')) {
								_$scope.setEditRoute('note');
							}
						}
					}
				};
				this._$scope.editPriority = function($event, task) {
					if (task.calendar.writable) {
						if ($($event.currentTarget).is($($event.target).closest('.handler'))) {
							_$scope.setEditRoute('priority');
						}
					}
				};
				this._$scope.editPercent = function($event, task) {
					if (task.calendar.writable) {
						if ($($event.currentTarget).is($($event.target).closest('.handler'))) {
							_$scope.setEditRoute('percent');
						}
					}
				};
				this._$scope.endEdit = function($event) {
					if ($($event.target).closest('.end-edit').length || $($event.currentTarget).is($($event.target).closest('.handler'))) {
						_$scope.resetRoute();
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

			  	this._$scope.setEditRoute = function(type) {
					var calendarID = _$scope.route.calendarID;
					var collectionID = _$scope.route.collectionID;
					if (calendarID) {
						$location.path('/calendars/' + calendarID + '/tasks/' + _$scope.route.taskID + '/edit/' + type);
					} else if (collectionID) {
						$location.path('/collections/' + collectionID + '/tasks/' + _$scope.route.taskID + '/edit/' + type);
					}
			  	};

				this._$scope.resetRoute = function() {
					var calendarID = _$scope.route.calendarID;
					var collectionID = _$scope.route.collectionID;
					if (calendarID) {
						$location.path('/calendars/' + calendarID + '/tasks/' + _$scope.route.taskID);
					} else if (collectionID) {
						$location.path('/collections/' + collectionID + '/tasks/' + _$scope.route.taskID);
					}
				};
				this._$scope.deletePercent = function(task) {
					return _tasksbusinesslayer.setPercentComplete(task, 0);
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

				this._$scope.setPercentComplete = function(task, complete) {
					_tasksbusinesslayer.setPercentComplete(task, complete);
				};

				this._$scope.toggleStarred = function(task) {
					if (task.priority > 5) {
						_tasksbusinesslayer.setPriority(task, 0);
					} else {
						_tasksbusinesslayer.setPriority(task, 9);
					}
				};

				this._$scope.deletePriority = function(task) {
					return _tasksbusinesslayer.setPriority(task, 0);
				};
				this._$scope.isDue = function(date) {
					return _$tasksmodel.due(date);
				};
				this._$scope.isOverDue = function(date) {
					return _$tasksmodel.overdue(date);
				};

				this._$scope.setstartday = function(date) {
					return _tasksbusinesslayer.setStart(_$scope.task, moment(date, 'MM/DD/YYYY'), 'day');
				};
				this._$scope.setstarttime = function(date) {
					return _tasksbusinesslayer.setStart(_$scope.task, moment(date, 'HH:mm'), 'time');
				};
				this._$scope.deleteStartDate = function(task) {
					_tasksbusinesslayer.deleteStartDate(task);
				};

				this._$scope.setdueday = function(date) {
					return _tasksbusinesslayer.setDue(_$scope.task, moment(date, 'MM/DD/YYYY'), 'day');
				};
				this._$scope.setduetime = function(date) {
					return _tasksbusinesslayer.setDue(_$scope.task, moment(date, 'HH:mm'), 'time');
				};
				this._$scope.deleteDueDate = function(task) {
					_tasksbusinesslayer.deleteDueDate(task);
				};

 				this._$scope.isAllDayPossible = function(task) {
 					return !angular.isUndefined(task) && task.calendar.writable && (task.due || task.start);
 				};
 				this._$scope.toggleAllDay = function(task) {
 					_tasksbusinesslayer.setAllDay(task, !task.allDay);
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
						_$scope.isAddingComment = false;
					  }, function() {
						_$scope.isAddingComment = false;
					  });
					  _$scope.CommentContent = '';
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
					_$scope.task.categories = _$scope.task.cats;
					var default_categories = _$scope.settingsmodel.getById('various').categories;
					if (default_categories.indexOf(category) < 0) {
						default_categories.push(category);
					}
					_tasksbusinesslayer.doUpdate(_$scope.task);
				};
				this._$scope.removeCategory = function(category, model) {
					_$scope.task.categories = _$scope.task.cats;
					_tasksbusinesslayer.doUpdate(_$scope.task);
				};
			}

		return DetailsController;

	  })();
	  return new DetailsController($scope, $window, TasksModel, TasksBusinessLayer, $route, $location, $timeout, $routeParams, SettingsModel, Loading, ListsModel);
	}
]);

angular.module('Tasks').controller('ListController', [
	'$scope', '$rootScope', '$window', '$routeParams', 'ListsModel', 'TasksBusinessLayer', 'CollectionsModel', 'ListsBusinessLayer', '$location',
	'SearchBusinessLayer', 'CalendarService', 'TasksModel', '$timeout',
	function($scope, $rootScope, $window, $routeParams, ListsModel, TasksBusinessLayer, CollectionsModel, ListsBusinessLayer, $location,
		SearchBusinessLayer, CalendarService, TasksModel, $timeout) {
		'use strict';
	  var ListController;
	  ListController = (function() {
		function ListController(_$scope, $rootScope, _$window, _$routeParams, _$listsmodel, _$tasksbusinesslayer, _$collectionsmodel, _$listsbusinesslayer, $location,
		_$searchbusinesslayer, _$calendarservice, _$tasksmodel, _$timeout) {

			this._$scope = _$scope;
			this._$window = _$window;
			this._$routeParams = _$routeParams;
			this._$listsmodel = _$listsmodel;
			this._$tasksmodel = _$tasksmodel;
			this._$tasksbusinesslayer = _$tasksbusinesslayer;
			this._$collectionsmodel = _$collectionsmodel;
			this._$listsbusinesslayer = _$listsbusinesslayer;
			this.$location = $location;
			this._$timeout = _$timeout;
			this._$searchbusinesslayer = _$searchbusinesslayer;
			this._$calendarservice = _$calendarservice;
			this._$scope.collections = this._$collectionsmodel.getAll();
			this._$scope.calendars = this._$listsmodel.getAll();
			this._$scope.draggedTasks = [];
			this._$scope.TasksBusinessLayer = this._$tasksbusinesslayer;
			this._$scope.nameError = false;
			this._$scope.color = '#31CC7C';

			this._$scope.deleteMessage = function (calendar) {
				return t('tasks', 'This will delete the Calendar "%s" and all of its entries.').replace('%s', calendar.displayname);
			};

			this._$scope["delete"] = function(calendar) {
				return _$listsbusinesslayer["delete"](calendar).then(function() {
					$location.path('/calendars/' + _$listsmodel.getStandardList().uri);
					return $scope.$apply();
				});
			};

			this._$scope.startCreate = function() {
				_$scope.status.addingList = true;
				_$scope.nameError = false;
				$('.hasTooltip').tooltip('hide');
				_$timeout(function() {
					$('#newList').focus();
				}, 50);
			};

			this._$scope.create = function() {
				var check = _$scope.isNameAllowed(_$scope.status.newListName);
				if (check.allowed) {
					_$scope.status.addingList = false;
					_$scope.isAddingList = true;
					_$listsbusinesslayer.add(_$scope.status.newListName, _$scope.color).then(function(calendar) {
						$location.path('/calendars/' + calendar.uri);
						return $scope.$apply();
					});
					_$scope.status.newListName = '';
				}
			};

			this._$scope.cancelCreate = function() {
					$('.hasTooltip').tooltip('hide');
					_$scope.nameError = false;
					_$scope.status.addingList = false;
					_$scope.status.newListName = "";
			};

			this._$scope.startEdit = function(calendar) {
				_$scope.status.addingList = false;
				_$scope.nameError = false;
				$('.hasTooltip').tooltip('hide');
				calendar.prepareUpdate();
				$location.path('/calendars/' + _$scope.route.calendarID + '/edit/name');
				_$timeout(function() {
					$('#list_' + calendar.uri + ' input.edit').focus();
				}, 50);
			};

			this._$scope.showCalDAVUrl = function(calendar) {
				_$scope.status.addingList = false;
				_$scope.nameError = false;
				$location.path('/calendars/' + _$scope.route.calendarID + '/edit/caldav');
				_$timeout(function() {
					$('#list_' + calendar.uri + ' input.caldav').focus();
				}, 50);
			};

			this._$scope.hideCalDAVUrl = function() {
				$location.path('/calendars/' + _$scope.route.calendarID);
			};

			this._$scope.download = function (calendar) {
				var url = calendar.url;
				// cut off last slash to have a fancy name for the ics
				if (url.slice(url.length - 1) === '/') {
					url = url.slice(0, url.length - 1);
				}
				url += '?export';
				$window.open(url);
			};

			this._$scope.checkNew = function(event,name) {
				_$scope.checkName(event,name);
			};

			this._$scope.checkEdit = function(event,calendar) {
				_$scope.checkName(event,calendar.displayname,calendar.uri);
				if (event.keyCode === 27) {
					_$scope.cancelEdit(calendar);
				}
			};

			this._$scope.checkName = function(event,name,uri) {
				var check = _$scope.isNameAllowed(name,uri);
				var $input = $(event.currentTarget);
				if (!check.allowed) {
					$input.attr('title', check.msg)
						.tooltip({placement: 'bottom', trigger: 'manual'})
						.tooltip('fixTitle').tooltip('show');
					_$scope.nameError = true;
				} else {
					$input.tooltip('hide');
					_$scope.nameError = false;
				}
				if (event.keyCode === 27) {
					event.preventDefault();
					$input.tooltip('hide');
					_$scope.status.addingList = false;
					_$scope.status.newListName = "";
					_$scope.nameError = false;
				}
			};

			$rootScope.$on('cancelEditCalendar', function(s, calendarUri) {
				var calendar = _$listsmodel.getByUri(calendarUri);
				_$scope.cancelEdit(calendar);
			});

			this._$scope.cancelEdit = function(calendar) {
				calendar.resetToPreviousState();
				$('.hasTooltip').tooltip('hide');
				_$scope.nameError = false;
				$location.path('/calendars/' + _$scope.route.calendarID);
			};

			this._$scope.saveEdit = function(calendar) {
				var check = _$scope.isNameAllowed(calendar.displayname, calendar.uri);
				if (check.allowed) {
					_$listsbusinesslayer.rename(calendar);
					$location.path('/calendars/' + _$scope.route.calendarID);
				}
			};

			this._$scope.isNameAllowed = function(name, uri) {
				var check = {
					allowed:	false,
					msg:		''
				};
				if (_$listsmodel.isNameAlreadyTaken(name, uri)) {
					check.msg = t('tasks', 'The name "%s" is already used.').replace('%s', name);
				} else if (!name) {
					check.msg = t('tasks', 'An empty name is not allowed.');
				} else {
					check.allowed = true;
				}
				return check;
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

			this._$scope.dragoverList = function($event, index) {
				var calendarID = $($event.target).closest('li.list').attr('calendarID');
				var calendar = _$listsmodel.getByUri(calendarID);
				return calendar.writable;
			};

			this._$scope.dropList = function($event, index, item) {
				if ($event.dataTransfer.dropEffect === 'move') {
					// we can't simply use item as task, since the directive seems to not copy all properties --> task.calendar.uri == undefined
					var task = _$tasksmodel.getByUri(item.uri);
					var calendarID = $($event.target).closest('li.list').attr('calendarID');
					var calendar = _$listsmodel.getByUri(calendarID);
					_$tasksbusinesslayer.changeCalendar(task, calendar).then(function() {
						_$scope.$apply();
					});
				}
				return true;
			};

			this._$scope.dragoverCollection = function($event, index) {
				if ($event.dataTransfer.effectAllowed === 'copy' || ($event.dataTransfer.effectAllowed === 'copyMove' && $event.ctrlKey)) {
					return false;
				}
				var collectionID;
				collectionID = $($event.target).closest('li.collection').attr('collectionID');
				return collectionID === 'starred' || collectionID === 'completed' || collectionID === 'today';
			};

			this._$scope.dropCollection = function($event, index, item) {
				if ($event.dataTransfer.dropEffect === 'move') {
					var collectionID = $($event.target).closest('li.collection').attr('collectionID');
					_$tasksbusinesslayer.changeCollection(item.uri, collectionID);
				}
				return true;
			};
		}

		return ListController;

	  })();
	  return new ListController($scope, $rootScope, $window, $routeParams, ListsModel, TasksBusinessLayer, CollectionsModel, ListsBusinessLayer, $location,
	  	SearchBusinessLayer, CalendarService, TasksModel, $timeout);
	}
]);

angular.module('Tasks').controller('SettingsController', [
    '$scope', '$window', 'Status', '$location', 'CollectionsModel', 'SettingsBusinessLayer', 'SettingsModel', function($scope, $window, Status, $location, CollectionsModel, SettingsBusinessLayer, SettingsModel) {
      'use strict';
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

(function() {
	'use strict';
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  angular.module('Tasks').controller('TasksController', [
	'$scope', '$window', '$routeParams', 'TasksModel', 'ListsModel', 'CollectionsModel', 'TasksBusinessLayer', '$location',
	'SettingsBusinessLayer', 'SearchBusinessLayer', 'VTodo', 'SettingsModel',
	function($scope, $window, $routeParams, TasksModel, ListsModel, CollectionsModel, TasksBusinessLayer, $location,
		SettingsBusinessLayer, SearchBusinessLayer, VTodo, SettingsModel) {
	  var TasksController;
	  TasksController = (function() {
		function TasksController(_$scope, _$window, _$routeParams, _$tasksmodel, _$listsmodel, _$collectionsmodel, _tasksbusinesslayer, $location,
			_settingsbusinesslayer, _searchbusinesslayer, vtodo, _$settingsmodel) {
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
			this._$settingsmodel = _$settingsmodel;

			this._$scope.addTask = function(taskName, related, calendar, parent) {
				var _ref, _this = this;
				if (calendar === null) {
				  calendar = '';
				}
				_$scope.isAddingTask = true;
				var task = {
					calendar: null,
					related: related,
					summary: taskName,
					priority: '0',
					due: false,
					start: false,
					reminder: null,
					completed: false,
					complete: '0',
					note: ''
				};
				if (((_ref = _$scope.route.collectionID) === 'starred' || _ref === 'today' || _ref === 'week' || _ref === 'all' || _ref === 'completed' || _ref === 'current')) {
					if (related) {
						task.calendar = calendar;
					} else {
						task.calendar = _$listsmodel.getStandardList();
					}
					if (_$scope.route.collectionID === 'starred') {
						task.priority = '1';
					}
					if (_$scope.route.collectionID === 'today') {
						task.due = moment().startOf('day').format("YYYY-MM-DDTHH:mm:ss");
					}
					if (_$scope.route.collectionID === 'current') {
						task.start = moment().format("YYYY-MM-DDTHH:mm:ss");
					}
				} else {
					task.calendar = _$listsmodel.getByUri(_$scope.route.calendarID);
				}
				task = VTodo.create(task);
				_tasksbusinesslayer.add(task).then(function(task) {
					_$scope.isAddingTask = false;
					_$scope.openDetails(task.uri, null);
					return $scope.$apply();
				});
				if (parent) {
					_tasksbusinesslayer.setHideSubtasks(parent, 0);
				}
				_$scope.status.focusTaskInput = false;
				_$scope.status.focusSubtaskInput = false;
				_$scope.status.addSubtaskTo = null;
				_$scope.status.taskName = '';
				_$scope.status.subtaskName = '';
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
				_$scope.status.addSubtaskTo = uid;
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
			_$scope.status.focusTaskInput = true;
		  };
		  this._$scope.focusSubtaskInput = function() {
			_$scope.status.focusSubtaskInput = true;
		  };

			this._$scope.openDetails = function(id, $event) {
				var calendarID = _$scope.route.calendarID;
				var collectionID = _$scope.route.collectionID;
				if ($event === null || $($event.currentTarget).is($($event.target).closest('.handler'))) {
					var parent = _$tasksmodel.getByUri(id);
					if (!parent.loadedCompleted) {
						_tasksbusinesslayer.getAll(parent.calendar, true, parent).then(function() {
							parent.loadedCompleted = true;
							$scope.$apply();
						});
					}
					if (calendarID) {
						$location.path('/calendars/' + calendarID + '/tasks/' + id);
					} else if (collectionID) {
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
					if (task.related === parent.uid && task !== parent && !(parent.hideCompletedSubtasks && task.completed)) {
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

			this._$scope.hasCompletedSubtasks = function(task) {
				return _$tasksmodel.hasCompletedSubtasks(task.uid);
			};

			this._$scope.toggleSubtasks = function(task) {
				_tasksbusinesslayer.setHideSubtasks(task, !task.hideSubtasks);
			};

			this._$scope.toggleCompletedSubtasks = function(task) {
				_tasksbusinesslayer.setHideCompletedSubtasks(task, !task.hideCompletedSubtasks);
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
					_$scope.status.focusSubtaskInput = false;
				}
			};

			this._$scope.getCompletedTasks = function(calendarID) {
				var calendar = _$listsmodel.getById(calendarID);
				_tasksbusinesslayer.getAll(calendar, true).then(function() {
					_$listsmodel.setLoadedCompleted(calendarID);
					$scope.$apply();
				});
			};

			this._$scope.loadedCompleted = function(calendarID) {
				return _$listsmodel.loadedCompleted(calendarID);
			};

			this._$scope.sortDue = function(task) {
				if (task.due === null) {
					return 'last';
				} else {
					return task.due;
				}
			};

			this._$scope.sortStart = function(task) {
				if (task.start === null) {
					return 'last';
				} else {
					return task.start;
				}
			};

			this._$scope.getSortOrder = function() {
				switch (_$scope.settingsmodel.getById('various').sortOrder) {
					case 'due':
						return _$scope.sortDue;
					case 'start':
						return _$scope.sortStart;
					case 'priority':
						return '-priority';
					case 'alphabetically':
						return 'summary';
					case 'manual':
						return 'manual';
					default:
						return ['completed', _$scope.sortDue, '-priority', _$scope.sortStart, 'summary'];
				}
			};

			this._$scope.setSortOrder = function($event, order) {
				_$scope.settingsmodel.getById('various').sortDirection = (_$scope.settingsmodel.getById('various').sortOrder === order) ? +!_$scope.settingsmodel.getById('various').sortDirection : 0;
				_$scope.settingsmodel.getById('various').sortOrder = order;
				_settingsbusinesslayer.set('various', 'sortOrder', order);
				_settingsbusinesslayer.set('various', 'sortDirection', _$scope.settingsmodel.getById('various').sortDirection);
			};

		  	this._$scope.dropAsSubtask = function($event, item, index) {
				if ($event.dataTransfer.dropEffect === 'move') {
					var parentID = $($event.target).closest('.task-item').attr('taskID');
					var task = _$tasksmodel.getByUri(item.uri);
					var parent = _$tasksmodel.getByUri(parentID);
					_tasksbusinesslayer.changeParent(task, parent);
				}
				$('.subtasks-container').removeClass('dropzone-visible');
				return true;

		  	};

			this._$scope.dropAsRootTask = function($event, item, index) {
				if ($event.dataTransfer.dropEffect === 'move') {
					var task = _$tasksmodel.getByUri(item.uri);
					var collectionID = $($event.target).closest('ol[dnd-list]').attr('collectionID');
					var calendarID = $($event.target).closest('ol[dnd-list]').attr('calendarID');
					var newCalendar = _$listsmodel.getByUri(calendarID);
					var queries = _tasksbusinesslayer.makeRootTask(task, newCalendar, collectionID);
					Promise.all(queries).then(function() {
						$scope.$apply();
					});
				}
				$('.subtasks-container').removeClass('dropzone-visible');
				return true;
			};

			this._$scope.dragover = function($event, item, index) {
				$('.subtasks-container').removeClass('dropzone-visible');
				var calendarID = $($event.target).closest('ol[dnd-list]').attr('calendarID');
				var calendar = _$listsmodel.getByUri(calendarID);
				if (calendar.writable) {
					$($event.target).closest('.task-item').children('.subtasks-container').addClass('dropzone-visible');
					return true;
				} else {
					return false;
				}
			};

			this._$scope.allow = function(task) {
				if (task.calendar.writable) {
					return "copyMove";
				} else {
					return "copy";
				}
			};

			this._$scope.dragStart = function($event) {
				if ($event.dataTransfer.effectAllowed === 'copy' || ($event.dataTransfer.effectAllowed === 'copyMove' && $event.ctrlKey)) {
					$($event.target).addClass('copy');
				}
			};

			this._$scope.dragEnd = function($event) {
				$($event.target).removeClass('copy');
			};
		}

		return TasksController;

	  })();
	  return new TasksController($scope, $window, $routeParams, TasksModel, ListsModel, CollectionsModel, TasksBusinessLayer, $location, SettingsBusinessLayer,
	  	SearchBusinessLayer, VTodo, SettingsModel);
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
	'use strict';
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

/* https://github.com/kayellpeee/hsl_rgb_converter
 * expected hue range: [0, 360)
 * expected saturation range: [0, 1]
 * expected lightness range: [0, 1]
 */
var hslToRgb = function(hue, saturation, lightness) {
	'use strict';
	// based on algorithm from http://en.wikipedia.org/wiki/HSL_and_HSV#Converting_to_RGB
	if(Array.isArray(hue)) {
		saturation = hue[1];
		lightness = hue[2];
		hue = hue[0];
	}
	if (hue === undefined) {
		return [0, 0, 0];
	}
	saturation /= 100;
	lightness /= 100;

	var chroma = (1 - Math.abs((2 * lightness) - 1)) * saturation;
	var huePrime = hue / 60;
	var secondComponent = chroma * (1 - Math.abs((huePrime % 2) - 1));

	huePrime = Math.floor(huePrime);
	var red;
	var green;
	var blue;

	if (huePrime === 0) {
		red = chroma;
		green = secondComponent;
		blue = 0;
	} else if (huePrime === 1) {
		red = secondComponent;
		green = chroma;
		blue = 0;
	} else if (huePrime === 2) {
		red = 0;
		green = chroma;
		blue = secondComponent;
	} else if (huePrime === 3) {
		red = 0;
		green = secondComponent;
		blue = chroma;
	} else if (huePrime === 4) {
		red = secondComponent;
		green = 0;
		blue = chroma;
	} else if (huePrime === 5) {
		red = chroma;
		green = 0;
		blue = secondComponent;
	}

	var lightnessAdjustment = lightness - (chroma / 2);
	red += lightnessAdjustment;
	green += lightnessAdjustment;
	blue += lightnessAdjustment;

	return [Math.round(red * 255), Math.round(green * 255), Math.round(blue * 255)];

};

/*
 * Convert rgb array to hex string
 */
var rgbToHex = function(r, g, b) {
	'use strict';
	if(Array.isArray(r)) {
		g = r[1];
		b = r[2];
		r = r[0];
	}
	return '#' + parseInt(r, 10).toString(16) + parseInt(g, 10).toString(16) + parseInt(b, 10).toString(16);
};

var listofcolours = [
	'#31CC7C',
	'#317CCC',
	'#FF7A66',
	'#F1DB50',
	'#7C31CC',
	'#CC317C',
	'#3A3B3D',
	'#CACBCD'
];

/*
 * Generate a random colour with the core generator
 */
var randColour = function() {
	'use strict';
	if (typeof String.prototype.toHsl === 'function') {
		return rgbToHex(hslToRgb(Math.random().toString().toHsl()));
	} else {
		return listofcolours[Math.floor(Math.random() * listofcolours.length)];
	}
};

/**
 * Directive: Colorpicker
 * Description: Colorpicker for the Tasks app.
 */


angular.module('Tasks').directive('colorpicker', function() {
	'use strict';
	if (typeof String.prototype.toHsl === 'function') {
		var hsl = "";
		var hslcolour = "";
		//		  0    40   80   120  160  200   240  280  320
		listofcolours = ["15", "9", "4", "b", "6", "11", "74", "f", "57"];
		listofcolours.forEach(function(hash, index) {
			hsl = hash.toHsl();
			hslcolour = hslToRgb(hsl);
			listofcolours[index] = rgbToHex(hslcolour);
		});
	}
	return {
		scope: {
			selected: '=',
			customizedColors: '=colors'
		},
		restrict: 'AE',
		templateUrl: OC.filePath('tasks', 'templates', 'colorpicker.html'),
		link: function(scope, element, attr) {
			scope.colors = scope.customizedColors || listofcolours;
			scope.selected = scope.selected || scope.colors[0];
			scope.random = "#000000";

			scope.randomizeColour = function() {
				scope.random = randColour();
				scope.pick(scope.random);
			};

			scope.pick = function(color) {
				scope.selected = color;
			};

		}
	};

});

angular.module('Tasks').directive('confirmation', function() {
	'use strict';
	return {
		priority: -1,
		restrict: 'A',
		templateUrl: OC.generateUrl('/apps/tasks/templates/confirmation', {}),
		scope: {
			confirmationFunction: "&confirmation",
			confirmationMessage: "&confirmationMessage",

		},
		controller: 'ConfirmationController'
	};
});

angular.module('Tasks').controller('ConfirmationController', [
	'$scope', '$rootScope', '$element', '$attrs', '$compile', '$document', '$window', '$timeout', function($scope, $rootScope, $element, $attrs, $compile, $document, $window, $timeout) {
		'use strict';
		var ConfirmationController = (function() {
			function ConfirmationController(_$scope, $rootScope, $element, $attrs, $compile, $document, $window, $timeout) {
				this._$scope = _$scope;
				this._$scope.countdown = 3;

				$element.bind( 'click', function( e ){
					_$scope.countdown = 3;
					$element.removeClass('active');
					var message = _$scope.confirmationMessage() ? _$scope.confirmationMessage() : "Are you sure?";
					if ($element.hasClass('confirmed')) {
						return;
					}
					e.stopPropagation();
					_$scope.activate();
					$element.children('.confirmation-confirm')
					.tooltip({title: message, container: 'body', placement: 'right'});
					$element.addClass("confirmed");
				});

				$element.children('.confirmation-confirm').bind( 'click', function (e) {
					if ($element.hasClass('confirmed active')) {
						_$scope.confirmationFunction();
						return;
					} else{
						e.stopPropagation();
					}
				});

				this._$scope.documentClick = function () {
					$element.removeClass("confirmed");
				};

				this._$scope.activate = function () {
					if (_$scope.countdown) {
						$element.find('.countdown').html(_$scope.countdown+' s');
						$timeout(function() {
							_$scope.activate();
							}, 1000);
						_$scope.countdown--;
					} else {
						$element.addClass('active');
					}
				};

				$document.bind('click', _$scope.documentClick);
				$document.bind('touchend', _$scope.documentClick);

				$scope.$on('$destroy', function() {
					$document.unbind('click', _$scope.documentClick);
					$document.unbind('touchend', _$scope.documentClick);
				});
			}
			return ConfirmationController;
		})();
		return new ConfirmationController($scope, $rootScope, $element, $attrs, $compile, $document, $window, $timeout);
	}
]);

angular.module('Tasks').directive('datepicker', function() {
	'use strict';
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

angular.module('Tasks').directive('ocClickFocus', [
	'$timeout', function($timeout) {
		'use strict';
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

angular.module('Tasks').directive('timepicker', function() {
	'use strict';
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

angular.module('Tasks').directive('watchTop', function() {
	'use strict';
	return {
		restrict: 'A',
		link: function(scope, element, attr) {
			({
				scope: {
					"divTop": "="
				}
			});
			return scope.$watch(function() {
				scope.divTop = element.prev().outerHeight(true);
			});
		}
	};
});

angular.module('Tasks').filter('counterFormatter', function() {
	'use strict';
	return function(count) {
		switch (false) {
			case count !== 0:
				return '';
			case count < 999:
				return '999+';
			default:
				return count;
		}
	};
});

angular.module('Tasks').filter('dateDetails', function() {
	'use strict';
	return function(due) {
		if (moment(due, "YYYYMMDDTHHmmss").isValid()) {
			return moment(due, "YYYYMMDDTHHmmss").locale(due.isDate ? 'details_allday' : 'details').calendar();
		} else {
			return t('tasks', 'Set due date');
		}
	};
});

angular.module('Tasks').filter('dateDetailsShort', function() {
	'use strict';
	return function(reminder) {
		if (moment(reminder, "YYYYMMDDTHHmmss").isValid()) {
			return moment(reminder, "YYYYMMDDTHHmmss").locale('details_short').calendar();
		} else {
			return '';
		}
	};
});

angular.module('Tasks').filter('dateFromNow', function() {
	'use strict';
	return function(due) {
		if (moment(due, "YYYYMMDDTHHmmss").isValid()) {
			return moment(due, "YYYYMMDDTHHmmss").fromNow();
		} else {
			return '';
		}
	};
});

angular.module('Tasks').filter('dateTaskList', function() {
	'use strict';
	return function(due) {
		if (moment(due, "YYYYMMDDTHHmmss").isValid()) {
			return moment(due, "YYYYMMDDTHHmmss").locale('tasks').calendar();
		} else {
			return '';
		}
	};
});

angular.module('Tasks').filter('day', function() {
	'use strict';
	return function(i) {
		return moment().add('days', i).locale('list_week').calendar();
	};
});

angular.module('Tasks').filter('dayTaskList', function() {
	'use strict';
	return function(due) {
		if (moment(due, "YYYYMMDDTHHmmss").isValid()) {
			return moment(due, "YYYYMMDDTHHmmss").locale('tasks').calendar();
		} else {
			return '';
		}
	};
});

angular.module('Tasks').filter('percentDetails', function() {
	'use strict';
	return function(percent) {
		return t('tasks', '%s %% completed').replace('%s', percent).replace('%%', '%');
	};
});

angular.module('Tasks').filter('priorityDetails', function() {
	'use strict';
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

angular.module('Tasks').filter('reminderDetails', function() {
  	'use strict';
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

angular.module('Tasks').filter('startDetails', function() {
	'use strict';
	return function(due) {
		if (moment(due, "YYYYMMDDTHHmmss").isValid()) {
			return moment(due, "YYYYMMDDTHHmmss").locale(due.isDate ? 'start_allday' : 'start').calendar();
		} else {
			return t('tasks', 'Set start date');
		}
	};
});

angular.module('Tasks').filter('timeTaskList', function() {
	'use strict';
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
		'use strict';
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
						_results.push(TasksBusinessLayer.getAll(calendar));
					}
					return _results;
				});
			};

			ListsBusinessLayer.prototype.add = function(calendar, color) {
				return this._$calendarservice.create(calendar, color, ['vtodo']).then(function(calendar) {
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
	'use strict';
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
			this._$searchString = query;
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

angular.module('Tasks').factory('SettingsBusinessLayer', [
	'Persistence', 'SettingsModel', function(Persistence, SettingsModel) {
		'use strict';
		var SettingsBusinessLayer = (function() {
			function SettingsBusinessLayer(_persistence, _$settingsmodel) {
				this._persistence = _persistence;
				this._$settingsmodel = _$settingsmodel;
			}

			SettingsBusinessLayer.prototype.updateModel = function() {
				var success, _this = this;
				success = function() {};
				return this._persistence.getCollections(success, true);
			};

			SettingsBusinessLayer.prototype.setVisibility = function(collectionID, visibility) {
				return this._persistence.setVisibility(collectionID, visibility);
			};

			SettingsBusinessLayer.prototype.toggle = function(type, setting) {
				this._$settingsmodel.toggle(type, setting);
				var value = this._$settingsmodel.getById(type)[setting];
				return this._persistence.setting(type, setting, +value);
			};

			SettingsBusinessLayer.prototype.set = function(type, setting, value) {
				return this._persistence.setting(type, setting, value);
			};

			return SettingsBusinessLayer;

		})();
		return new SettingsBusinessLayer(Persistence, SettingsModel);
	}
]);

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
				if(due.isBefore(start) || due.isSame(start)) {
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
				if(allDay) {
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

		return TasksBusinessLayer;

	  })();
	  return new TasksBusinessLayer(TasksModel, Persistence, VTodoService, VTodo, $timeout);
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

angular.module('Tasks').service('DavClient', [
	function() {
		'use strict';
		var client;
		client = new dav.Client({
			baseUrl: OC.linkToRemote('dav/calendars'),
			xmlNamespaces: {
				'DAV:': 'd',
				'urn:ietf:params:xml:ns:caldav': 'c',
				'http://apple.com/ns/ical/': 'aapl',
				'http://owncloud.org/ns': 'oc',
				'http://nextcloud.com/ns': 'nc',
				'http://calendarserver.org/ns/': 'cs'
			}
		});
		angular.extend(client, {
			NS_DAV: 'DAV:',
			NS_IETF: 'urn:ietf:params:xml:ns:caldav',
			NS_APPLE: 'http://apple.com/ns/ical/',
			NS_OWNCLOUD: 'http://owncloud.org/ns',
			NS_NEXTCLOUD: 'http://nextcloud.com/ns',
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

angular.module('Tasks').service('ICalFactory', [
	function() {
		'use strict';

		// creates a new ICAL root element with a product id property
		return {
			new: function() {
				var root = new ICAL.Component(['vcalendar', [], []]);

				var version = angular.element('#app').attr('data-appVersion');
				root.updatePropertyWithValue('prodid', '-//Nextcloud Tasks v' + version);

				return root;
			}
		};
	}
]);

angular.module('Tasks').factory('Loading', [
	function() {
		'use strict';
		var Loading = (function() {
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

(function() {
	'use strict';
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
		  if (clearCache === null) {
			clearCache = true;
		  }
		  if (clearCache) {
			this._invalidateCache();
		  }
		  if (angular.isDefined(this._dataMap[data.id])) {
			return this.update(data, clearCache);
		  } else {
			this._data.push(data);
			this._dataMap[data.id] = data;
		  }
		};

		Model.prototype.update = function(data, clearCache) {
		  var entry, key, value, _results;
		  if (clearCache === null) {
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
		  if (clearCache === null) {
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
		  this._filterCache = {};
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

angular.module('Tasks').factory('Calendar', ['$rootScope', '$filter', '$window', function($rootScope, $filter, $window) {
	'use strict';

	function Calendar(url, props, uri) {
		var _this = this;

		props.color = props['{http://apple.com/ns/ical/}calendar-color'];
		if (typeof props.color !== 'undefined') {
			if (props.color.length === 9) {
				props.color = props.color.substr(0,7);
			}
		} else {
			props.color = '#1d2d44';
		}

		angular.extend(this, {
			_propertiesBackup: {},
			_properties: {
				url: url,
				uri: uri,
				enabled: props['{http://owncloud.org/ns}calendar-enabled'] === '1',
				displayname: props['{DAV:}displayname'] || t('tasks','Unnamed'),
				color: props.color,
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
				owner: '',
				loadedCompleted: false
			},
			_updatedProperties: []
		});
		this._propertiesBackup = angular.copy(this._properties);

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
		get caldav() {
			return $window.location.origin + this.url;
		},
		get exportUrl() {
			var url = this.url;
			// cut off last slash to have a fancy name for the ics
			if (url.slice(url.length - 1) === '/') {
				url = url.slice(0, url.length - 1);
			}
			url += '?export';
			return url;
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
		get loadedCompleted() {
			return this._properties.loadedCompleted;
		},
		set loadedCompleted(loadedCompleted) {
			this._properties.loadedCompleted = loadedCompleted;
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
	'use strict';
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
		  if (clearCache === null) {
			clearCache = true;
		  }
		  this._nameCache[data.displayname] = data;
		  if (angular.isDefined(data.id)) {
			return CollectionsModel.__super__.add.call(this, data, clearCache);
		  }
		};

		CollectionsModel.prototype.getCount = function(collectionID, filter) {
		  var count, task, tasks, _i, _len;
		  if (filter === null) {
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
	'use strict';
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
		  if (clearCache === null) {
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
			  if (!angular.isDefined(this._dataMap[calendar.uri])) {
				this._data.push(calendar);
				this._dataMap[calendar.uri] = calendar;
			  }
			}
		  }
		};

		ListsModel.prototype.getByUri = function(uri) {
		  return this._dataMap[uri];
		};

		ListsModel.prototype.update = function(list, clearCache) {
		  var tmplist;
		  if (clearCache === null) {
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
		  if (clearCache === null) {
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
		  if (filter === null) {
			filter = '';
		  }
		  count = 0;
		  tasks = this._$tasksmodel.filteredTasks(filter);
		  for (_i = 0, _len = tasks.length; _i < _len; _i++) {
			task = tasks[_i];
			count += this._$tasksmodel.filterTasks(task, collectionID) && task.calendar.uri === calendarID && !task.related;
		  }
		 //  if (collectionID === 'completed' && filter === '') {
			// count += this.notLoaded(calendarID);
		 //  }
		  return count;
		};

		ListsModel.prototype.loadedCompleted = function(calendarID) {
			if (angular.isUndefined(this.getById(calendarID))) {
				return false;
			} else {
				return this.getById(calendarID).loadedCompleted;
			}
		};

		ListsModel.prototype.setLoadedCompleted = function(calendarID) {
			this.getById(calendarID).loadedCompleted = true;
		};

		ListsModel.prototype.getColor = function(calendarID) {
		  if (angular.isUndefined(this.getById(calendarID))) {
			return '#CCCCCC';
		  } else {
			return this.getById(calendarID).calendarcolor;
		  }
		};

		ListsModel.prototype.getName = function(calendarID) {
		  if (angular.isUndefined(this.getById(calendarID))) {
			return '';
		  } else {
			return this.getById(calendarID).displayname;
		  }
		};

		return ListsModel;

	  })(_Model);
	  return new ListsModel(TasksModel);
	}
  ]);

}).call(this);

(function() {
	'use strict';
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
		  if (clearCache === null) {
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
		  this.getById(type)[setting] = !set[setting];
		};

		return SettingsModel;

	  })(_Model);
	  return new SettingsModel();
	}
  ]);

}).call(this);

(function() {
	'use strict';
  var __hasProp = {}.hasOwnProperty,
	__extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	__indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  angular.module('Tasks').factory('TasksModel', [
	'_Model', function(_Model) {
		var TasksModel = (function(_super) {
			__extends(TasksModel, _super);

			function TasksModel() {
				this._tmpIdCache = {};
				TasksModel.__super__.constructor.call(this);
			}

			TasksModel.prototype.ad = function(task, clearCache) {
				if (clearCache === null) {
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
						if (!angular.isDefined(this._dataMap[task.uri])) {
							this._data.push(task);
							this._dataMap[task.uri] = task;
						}
					}
				}
			};

			TasksModel.prototype.getByUri = function(uri) {
				return this._dataMap[uri];
			};

		TasksModel.prototype.update = function(task, clearCache) {

			var entry, key, value, _results;
			if (clearCache === null) {
				clearCache = true;
			}
			if (clearCache) {
				this._invalidateCache();
			}
			entry = this.getByUri(task.uri);
			entry.components = task.components;
			entry.components.toString();
			return entry;
		};

		TasksModel.prototype.removeById = function(taskID) {
		  return TasksModel.__super__.removeById.call(this, taskID);
		};

		TasksModel.prototype["delete"] = function(task, clearCache) {
		  var counter, data, entry, _i, _len, _ref;
		  if (clearCache === null) {
			clearCache = true;
		  }
		  _ref = this._data;
		  for (counter = _i = 0, _len = _ref.length; _i < _len; counter = ++_i) {
			entry = _ref[counter];
			if (entry === task) {
			  this._data.splice(counter, 1);
			  data = this._dataMap[task.uri];
			  delete this._dataMap[task.uri];
			  if (clearCache) {
				this._invalidateCache();
			  }
			  return data;
			}
		  }
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

		TasksModel.prototype.hasCompletedSubtasks = function(uid) {
		  var task, tasks, _i, _len;
		  tasks = this.getAll();
		  for (_i = 0, _len = tasks.length; _i < _len; _i++) {
			task = tasks[_i];
			if (task.related === uid && task.completed) {
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
			  if (task.related === t.uid && task !== t) {
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

			TasksModel.prototype.getByUid = function(uid) {
				var task, tasks, _i, _len;
				tasks = this.getAll();
				for (_i = 0, _len = tasks.length; _i < _len; _i++) {
					task = tasks[_i];
					if (task.uid === uid) {
						return task;
					}
				}
				return null;
			};

			TasksModel.prototype.getChildren = function(task) {
				var children, t, tasks, _i, _len;
				tasks = this.getAll();
				children = [];
				for (_i = 0, _len = tasks.length; _i < _len; _i++) {
					t = tasks[_i];
					if (t.related === task.uid && t !== task) {
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
						return '' + task.calendar.uri === '' + filter;
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

		TasksModel.prototype.setReminder = function(taskID, reminder) {
		  return this.update({
			id: taskID,
			reminder: reminder
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

		TasksModel.prototype.addComment = function(comment) {
		  var task;
		  task = this.getById(comment.taskID);
		  if (task.comments) {
			task.comments.push(comment);
		  } else {
			task.comments = [comment];
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

angular.module('Tasks').factory('VTodo', ['$filter', 'ICalFactory', 'RandomStringService',
	function($filter, icalfactory, RandomStringService) {
	'use strict';

	function VTodo(calendar, props, uri) {
		var _this = this;

		angular.extend(this, {
			calendar: calendar,
			data: props['{urn:ietf:params:xml:ns:caldav}calendar-data'],
			uri: uri,
			etag: props['{DAV:}getetag'] || null,
			timers: [],
			loaded: false
		});

		this.jCal = ICAL.parse(this.data);
		this.components = new ICAL.Component(this.jCal);

		if (this.components.jCal.length === 0) {
			throw "invalid calendar";
		}
	}

	VTodo.prototype = {
		get summary() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			return vtodos[0].getFirstPropertyValue('summary');
		},
		set summary(summary) {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			vtodos[0].updatePropertyWithValue('summary', summary);
			this.updateLastModified();
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
			this.updateLastModified();
			this.data = this.components.toString();
		},
		get complete() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			return vtodos[0].getFirstPropertyValue('percent-complete') || 0;
		},
		set complete(complete) {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			vtodos[0].updatePropertyWithValue('percent-complete', complete);
			this.updateLastModified();
			this.data = this.components.toString();
			if (complete < 100) {
				this.completed = null;
				if (complete === 0) {
					this.status = 'NEEDS-ACTION';
				} else {
					this.status = 'IN-PROCESS';
				}
			} else {
				this.completed = ICAL.Time.now();
				this.status = 'COMPLETED';
			}
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
			this.updateLastModified();
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
			this.updateLastModified();
			this.data = this.components.toString();
		},
		get note() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			return vtodos[0].getFirstPropertyValue('description') || '';
		},
		set note(note) {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			vtodos[0].updatePropertyWithValue('description', note);
			this.updateLastModified();
			this.data = this.components.toString();
		},
		get uid() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			return vtodos[0].getFirstPropertyValue('uid') || '';
		},
		get related() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			return vtodos[0].getFirstPropertyValue('related-to') || null;
		},
		set related(related) {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			if (related) {
				vtodos[0].updatePropertyWithValue('related-to', related);
			} else {
				vtodos[0].removeProperty('related-to');
			}
			this.updateLastModified();
			this.data = this.components.toString();
		},
		get hideSubtasks() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			return +vtodos[0].getFirstPropertyValue('x-oc-hidesubtasks') || 0;
		},
		set hideSubtasks(hide) {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			vtodos[0].updatePropertyWithValue('x-oc-hidesubtasks', +hide);
			this.updateLastModified();
			this.data = this.components.toString();
		},
		get hideCompletedSubtasks() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			return +vtodos[0].getFirstPropertyValue('x-oc-hidecompletedsubtasks') || 0;
		},
		set hideCompletedSubtasks(hide) {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			vtodos[0].updatePropertyWithValue('x-oc-hidecompletedsubtasks', +hide);
			this.updateLastModified();
			this.data = this.components.toString();
		},
		get reminder() {
			return null;
		},
		get categories() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			var categories = vtodos[0].getFirstProperty('categories');
			if (categories) {
				return categories.getValues();
			} else {
				return [];
			}
		},
		set categories(cats) {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			var categories = vtodos[0].getFirstProperty('categories');
			if (cats.length > 0) {
				if (categories) {
					categories.setValues(cats);
				} else {
					var prop = new ICAL.Property('categories');
					prop.setValues(cats);
					categories = vtodos[0].addProperty(prop);
				}
			} else {
				vtodos[0].removeProperty('categories');
			}
			this.updateLastModified();
			this.data = this.components.toString();
		},
		get start() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			return vtodos[0].getFirstPropertyValue('dtstart');
		},
		set start(start) {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			if (start) {
				vtodos[0].updatePropertyWithValue('dtstart', start);
			} else {
				vtodos[0].removeProperty('dtstart');
			}
			this.updateLastModified();
			this.data = this.components.toString();
		},
		get due() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			return vtodos[0].getFirstPropertyValue('due');
		},
		set due(due) {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			if (due) {
				vtodos[0].updatePropertyWithValue('due', due);
			} else {
				vtodos[0].removeProperty('due');
			}
			this.updateLastModified();
			this.data = this.components.toString();
		},
 		get allDay() {
 			var vtodos = this.components.getAllSubcomponents('vtodo');
 			var start = vtodos[0].getFirstPropertyValue('dtstart');
 			var due = vtodos[0].getFirstPropertyValue('due');
 			var d = due ? due : start;
 			return d!=null && d.isDate;
 		},
 		set allDay(allDay) {
 			var vtodos = this.components.getAllSubcomponents('vtodo');
 			var start = vtodos[0].getFirstPropertyValue('dtstart');
 			if(start) {
 				start.isDate = allDay;
 				vtodos[0].updatePropertyWithValue('dtstart', start);
 			}
 			var due = vtodos[0].getFirstPropertyValue('due');
 			if(due) {
 				due.isDate = allDay;
 				vtodos[0].updatePropertyWithValue('due', due);
 			}
 			this.updateLastModified();
 			this.data = this.components.toString();
 		},
		get comments() {
			return null;
		},
		get loadedCompleted () {
			return this.loaded;
		},
		set loadedCompleted (loadedCompleted) {
			this.loaded = loadedCompleted;
		},
		updateLastModified () {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			vtodos[0].updatePropertyWithValue('last-modified', ICAL.Time.now());
			vtodos[0].updatePropertyWithValue('dtstamp', ICAL.Time.now());
		}
	};

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
			vtodo.updatePropertyWithValue('description', task.note);
		}
		if (task.due) {
			vtodo.updatePropertyWithValue('due', task.due);
		}
		if (task.start) {
			vtodo.updatePropertyWithValue('dtstart', task.start);
		}

		return new VTodo(task.calendar, {
			'{urn:ietf:params:xml:ns:caldav}calendar-data': comp.toString(),
			'{DAV:}getetag': null
		}, null);
	};

	return VTodo;
}]);

angular.module('Tasks').factory('Persistence', [
	'Request', 'Loading', '$rootScope', '$q', 'CalendarService', function(Request, Loading, $rootScope, $q, CalendarService) {
		'use strict';
		var Persistence = (function() {
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
				if (showLoading === null) {
					showLoading = true;
				}
				if (!onSuccess) {
					onSuccess = function() {};
				}
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
				if (showLoading === null) {
					showLoading = true;
				}
				if (!onSuccess) {
					onSuccess = function() {};
				}
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
				var params = {
					routeParams: {
						collectionID: collectionID,
						visibility: visibility
					}
				};
				return this._request.post('/apps/tasks/collection/{collectionID}/visibility/{visibility}', params);
			};

			Persistence.prototype.setting = function(type, setting, value) {
				var params = {
					routeParams: {
						type: type,
						setting: setting,
						value: value
					}
				};
				return this._request.post('/apps/tasks/settings/{type}/{setting}/{value}', params);
			};
		return Persistence;
	  })();
	  return new Persistence(Request, Loading, $rootScope, CalendarService);
	}
]);

angular.module('Tasks').factory('Publisher', [
	'CollectionsModel', 'SettingsModel', function(CollectionsModel, SettingsModel) {
		'use strict';
		var Publisher = (function() {
			function Publisher(_$collectionsmodel, _$settingsmodel) {
				this._$collectionsmodel = _$collectionsmodel;
				this._$settingsmodel = _$settingsmodel;
				this._subscriptions = {};
				this.subscribeObjectTo(this._$collectionsmodel, 'collections');
				this.subscribeObjectTo(this._$settingsmodel, 'settings');
			}

			Publisher.prototype.subscribeObjectTo = function(object, name) {
				var base = this._subscriptions;
				if (!base[name]) {
					base[name] = [];
				}
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

angular.module('Tasks').factory('RandomStringService', function () {
	'use strict';

	return {
		generate: function() {
			return Math.random().toString(36).substr(2);
		}
	};
});

angular.module('Tasks').factory('Request', [
	'$http', 'Publisher', function($http, Publisher) {
		'use strict';
		var Request = (function() {
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
				if (!data.config) {
					data.config = {};
				}
				data.config.method = 'POST';
				return this.request(route, data);
			};

			Request.prototype.get = function(route, data) {
				if (data === null) {
					data = {};
				}
				if (!data.config) {
					data.config = {};
				}
				data.config.method = 'GET';
				return this.request(route, data);
			};

			Request.prototype.put = function(route, data) {
				if (data === null) {
					data = {};
				}
				if (!data.config) {
					data.config = {};
				}
				data.config.method = 'PUT';
				return this.request(route, data);
			};

			Request.prototype["delete"] = function(route, data) {
				if (data === null) {
					data = {};
				}
				if (!data.config) {
					data.config = {};
				}
				data.config.method = 'DELETE';
				return this.request(route, data);
			};

			Request.prototype._shelveRequest = function(route, data) {
				var request = {
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

angular.module('Tasks').factory('Status', [
	function() {
		'use strict';
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

angular.module('Tasks').service('VTodoService', ['DavClient', 'RandomStringService', '$timeout', function(DavClient, RandomStringService, $timeout) {
	'use strict';

	var _this = this;

	this.getAll = function(calendar, completed, parent) {
		if (completed === null) {
			completed = false;
		}
		if (parent === null) {
			parent = false;
		}
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

		var cPropFilterCompleted = xmlDoc.createElement('c:prop-filter');
		cPropFilterCompleted.setAttribute('name', 'COMPLETED');
		cCompFilterVTodo.appendChild(cPropFilterCompleted);

		if (!completed) {
			var cIsNotDefined = xmlDoc.createElement('c:is-not-defined');
			cPropFilterCompleted.appendChild(cIsNotDefined);
		}

		if (parent) {
			var cPropFilterRelated = xmlDoc.createElement('c:prop-filter');
			cPropFilterRelated.setAttribute('name', 'RELATED-TO');
			cCompFilterVTodo.appendChild(cPropFilterRelated);
			var cTextMatch = xmlDoc.createElement('c:text-match');
			var cTextMatchValue = xmlDoc.createTextNode(parent.uid);
			cTextMatch.appendChild(cTextMatchValue);
			cPropFilterRelated.appendChild(cTextMatch);
		}

		// var cPropFilterStatus = xmlDoc.createElement('c:prop-filter');
		// cPropFilterStatus.setAttribute('name', 'STATUS');
		// cCompFilterVTodo.appendChild(cPropFilterStatus);

		// var cTextMatch = xmlDoc.createElement('c:text-match');
		// cTextMatch.setAttribute('negate-condition', 'yes');
		// var cTextMatchValue = xmlDoc.createTextNode('CANCELLED');
		// cTextMatch.appendChild(cTextMatchValue);
		// cPropFilterStatus.appendChild(cTextMatch);

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

				var vTodo = {
					calendar: calendar,
					properties: properties,
					uri: uri
				};
				vTodos.push(vTodo);
			}

			return vTodos;
		});
	};

	this.get = function(calendar, uri) {
		var url = calendar.url + uri;
		return DavClient.request('GET', url, {'requesttoken' : OC.requestToken}, '').then(function(response) {
			var vTodo = {
				calendar: calendar,
				properties: {
					'{urn:ietf:params:xml:ns:caldav}calendar-data': response.body,
					'{DAV:}getetag': response.xhr.getResponseHeader('ETag')},
				uri: uri
			};
			return vTodo;
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
		$timeout.cancel(task.timers.update);
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
		var uri = 'Nextcloud-';
		uri += RandomStringService.generate();
		uri += RandomStringService.generate();
		uri += '.ics';

		return uri;
	};

	// this._getTimeRangeStamp = function(momentObject) {
	// 	return momentObject.format('YYYYMMDD') + 'T' + momentObject.format('HHmmss') + 'Z';
	// };

}]);


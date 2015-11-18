(function(angular, $, moment, undefined){

/**
 * ownCloud Task App - v0.8.1
 *
 * Copyright (c) 2015 - Raimund Schlüßler <raimund.schluessler@googlemail.com>
 *
 * This file is licensed under the Affero General Public License version 3 or later.
 * See the COPYING file
 *
 */


(function() {
  angular.module('Tasks', ['ngRoute', 'ngAnimate', 'ui.bootstrap', 'ui.select', 'ngSanitize', 'dndLists']).config([
    '$provide', '$routeProvider', '$interpolateProvider', '$httpProvider', function($provide, $routeProvider, $interpolateProvider, $httpProvider) {
      var config;
      $provide.value('Config', config = {
        markReadTimeout: 500,
        taskUpdateInterval: 1000 * 600
      });
      $httpProvider.defaults.headers.common['requesttoken'] = oc_requesttoken;
      $routeProvider.when('/lists/:listID', {}).when('/lists/:listID/edit/:listparameter', {}).when('/lists/:listID/tasks/:taskID', {}).when('/lists/:listID/tasks/:taskID/settings', {}).when('/lists/:listID/tasks/:taskID/edit/:parameter', {}).when('/search/:searchString', {}).when('/search/:searchString/tasks/:taskID', {}).when('/search/:searchString/tasks/:taskID/edit/:parameter', {}).otherwise({
        redirectTo: '/lists/all'
      });
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
        if (init) {
          ListsBusinessLayer.updateModel();
          TasksBusinessLayer.updateModel();
        }
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

(function() {
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

}).call(this);

(function() {
  angular.module('Tasks').directive('autofocusOnInsert', function() {
    'use strict';
    return function(scope, elm) {
      return elm.focus();
    };
  });

}).call(this);

(function() {
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

}).call(this);

(function() {
  angular.module('Tasks').directive('clickableurl', [
    '$compile', function($compile) {
      return {
        restrict: 'A',
        scope: {
          clickableurl: '='
        },
        link: function(scope, element, attr, task) {
          return scope.$watch('clickableurl', function(clickableurl) {
            var a, index, link, mail_regex, match, matchs, text, url_regex, _i, _len;
            if (!angular.isUndefined(clickableurl)) {
              url_regex = /(?:\s|^)+(https?:\/\/)?(([\da-z\-]+\.{1})+[a-z]{2,}\.?[\.\d\/\w\-\%=&+\?~#]*)(?:\s|$)+/gi;
              mail_regex = /(?:\s|^)+(([\w.!$%&'\*\+-\/=\?^`\{\|\}~#])+([@]){1}([\da-z\-]+\.{1})+[a-z]{2,}\.?)(?:\s|$)+/gi;
              matchs = new Array();
              while ((match = url_regex.exec(clickableurl))) {
                matchs.push(match);
                url_regex.lastIndex--;
              }
              while ((match = mail_regex.exec(clickableurl))) {
                matchs.push(match);
                mail_regex.lastIndex--;
              }
              matchs.sort(function(a, b) {
                if (a.index < b.index) {
                  return -1;
                }
                if (a.index > b.index) {
                  return 1;
                }
                return 0;
              });
              element.empty();
              index = 0;
              for (_i = 0, _len = matchs.length; _i < _len; _i++) {
                link = matchs[_i];
                if (link.index) {
                  element.append(document.createTextNode(clickableurl.substring(index, link.index + 1)));
                }
                index = link.index + link[0].length;
                text = link.index ? link[0].substring(1) : link[0];
                if (link[3] === '@') {
                  a = $compile('<a href="mailto:' + link[1] + '"\
							class="handled end-edit"></a>')(scope);
                  a.text(text);
                  element.append(a);
                  continue;
                }
                if (angular.isUndefined(link[1])) {
                  link[1] = 'http://';
                }
                a = $compile('<a href="' + link[1] + link[2] + '"\
						target="_blank" class="handled end-edit"></a>')(scope);
                a.text(text);
                element.append(a);
              }
              if (index < clickableurl.length) {
                return element.append(document.createTextNode(clickableurl.substring(index)));
              }
            }
          });
        }
      };
    }
  ]);

}).call(this);

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

(function() {
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

}).call(this);

(function() {
  angular.module('Tasks').controller('AppController', [
    '$scope', 'Persistence', '$route', 'Status', '$timeout', '$location', '$routeParams', 'Loading', 'SettingsModel', function($scope, Persistence, $route, status, $timeout, $location, $routeParams, Loading, SettingsModel) {
      var AppController;
      AppController = (function() {
        function AppController(_$scope, _persistence, _$route, _$status, _$timeout, _$location, _$routeparams, _Loading, _$settingsmodel) {
          var successCallback,
            _this = this;
          this._$scope = _$scope;
          this._persistence = _persistence;
          this._$route = _$route;
          this._$status = _$status;
          this._$timeout = _$timeout;
          this._$location = _$location;
          this._$routeparams = _$routeparams;
          this._Loading = _Loading;
          this._$settingsmodel = _$settingsmodel;
          this._$scope.initialized = false;
          this._$scope.status = this._$status.getStatus();
          this._$scope.route = this._$routeparams;
          this._$scope.status.newListName = "";
          this._$scope.settingsmodel = this._$settingsmodel;
          successCallback = function() {
            return _this._$scope.initialized = true;
          };
          this._persistence.init().then(successCallback);
          this._$scope.closeAll = function($event) {
            if ($($event.target).closest('.close-all').length || $($event.currentTarget).is($($event.target).closest('.handler'))) {
              _$location.path('/lists/' + _$scope.route.listID);
              _$scope.status.addingList = false;
              _$scope.status.focusTaskInput = false;
              _$scope.status.newListName = "";
            }
            if (!$($event.target).closest('.newList').length) {
              _$scope.status.addingList = false;
              _$scope.status.newListName = "";
            }
            if (!$($event.target).closest('.add-subtask').length) {
              _$scope.status.addSubtaskTo = '';
              return _$scope.status.focusSubtaskInput = false;
            } else {

            }
          };
          this._$scope.isLoading = function() {
            return _Loading.isLoading();
          };
        }

        return AppController;

      })();
      return new AppController($scope, Persistence, $route, status, $timeout, $location, $routeParams, Loading, SettingsModel);
    }
  ]);

}).call(this);

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
          this._$scope.editName = function() {
            return _$location.path('/lists/' + _$scope.route.listID + '/tasks/' + _$scope.route.taskID + '/edit/name');
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
              return _$location.path('/lists/' + _$scope.route.listID + '/tasks/' + _$scope.route.taskID + '/edit/note');
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
            return _$location.path('/lists/' + _$scope.route.listID + '/tasks/' + _$scope.route.taskID);
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
              return _tasksbusinesslayer.starTask(taskID);
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
          this._$scope.$watch('task', function(newVal, oldVal) {
            if (newVal === oldVal || (void 0 === newVal || void 0 === oldVal) || newVal.id !== oldVal.id) {

            } else {
              if (newVal.name !== oldVal.name) {
                if (_$scope.timers['task' + newVal.id + 'name']) {
                  $timeout.cancel(_$scope.timers['task' + newVal.id + 'name']);
                }
                _$scope.timers['task' + newVal.id + 'name'] = $timeout(function() {
                  return _tasksbusinesslayer.setTaskName(newVal.id, newVal.name);
                }, 3000);
              }
              if (newVal.note !== oldVal.note) {
                if (_$scope.timers['task' + newVal.id + 'note']) {
                  $timeout.cancel(_$scope.timers['task' + newVal.id + 'note']);
                }
                _$scope.timers['task' + newVal.id + 'note'] = $timeout(function() {
                  return _tasksbusinesslayer.setTaskNote(newVal.id, newVal.note);
                }, 5000);
              }
              if (newVal.complete !== oldVal.complete) {
                if (_$scope.timers['task' + newVal.id + 'complete']) {
                  $timeout.cancel(_$scope.timers['task' + newVal.id + 'complete']);
                }
                _$scope.timers['task' + newVal.id + 'complete'] = $timeout(function() {
                  return _tasksbusinesslayer.setPercentComplete(newVal.id, newVal.complete);
                }, 1000);
              }
              if (newVal.priority !== oldVal.priority) {
                if (_$scope.timers['task' + newVal.id + 'priority']) {
                  $timeout.cancel(_$scope.timers['task' + newVal.id + 'priority']);
                }
                return _$scope.timers['task' + newVal.id + 'priority'] = $timeout(function() {
                  return _tasksbusinesslayer.setPriority(newVal.id, newVal.priority);
                }, 1000);
              }
            }
          }, true);
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

(function() {
  angular.module('Tasks').controller('ListController', [
    '$scope', '$window', '$routeParams', 'ListsModel', 'TasksBusinessLayer', 'CollectionsModel', 'ListsBusinessLayer', '$location', 'SearchBusinessLayer', function($scope, $window, $routeParams, ListsModel, TasksBusinessLayer, CollectionsModel, ListsBusinessLayer, $location, SearchBusinessLayer) {
      var ListController;
      ListController = (function() {
        function ListController(_$scope, _$window, _$routeParams, _$listsmodel, _$tasksbusinesslayer, _$collectionsmodel, _$listsbusinesslayer, $location, _$searchbusinesslayer) {
          this._$scope = _$scope;
          this._$window = _$window;
          this._$routeParams = _$routeParams;
          this._$listsmodel = _$listsmodel;
          this._$tasksbusinesslayer = _$tasksbusinesslayer;
          this._$collectionsmodel = _$collectionsmodel;
          this._$listsbusinesslayer = _$listsbusinesslayer;
          this.$location = $location;
          this._$searchbusinesslayer = _$searchbusinesslayer;
          this._$scope.collections = this._$collectionsmodel.getAll();
          this._$scope.lists = this._$listsmodel.getAll();
          this._$scope.draggedTasks = [];
          this._$scope.TasksBusinessLayer = this._$tasksbusinesslayer;
          this._$scope.status.listNameBackup = '';
          this._$scope.deleteList = function(listID) {
            var really;
            really = confirm(t('tasks', 'This will delete the Calendar "%s" and all of its entries.').replace('%s', _$listsmodel.getById(_$scope.route.listID).displayname));
            if (really) {
              _$listsbusinesslayer.deleteList(listID);
              return $location.path('/lists/' + _$listsmodel.getStandardList());
            }
          };
          this._$scope.startAddingList = function() {
            $location.path('/lists/' + _$scope.route.listID);
            return _$scope.status.addingList = true;
          };
          this._$scope.endAddingList = function() {
            _$scope.status.addingList = false;
            return _$scope.status.newListName = "";
          };
          this._$scope.checkListInput = function(event) {
            if (event.keyCode === 13) {
              event.preventDefault();
              _$scope.submitNewList();
            }
            if (event.keyCode === 27) {
              return _$scope.endAddingList();
            }
          };
          this._$scope.submitNewList = function() {
            var list,
              _this = this;
            if (_$scope.status.newListName) {
              if (_$listsmodel.checkName(_$scope.status.newListName)) {
                _$scope.status.addingList = false;
                _$scope.isAddingList = true;
                list = {
                  tmpID: 'newList' + Date.now(),
                  displayname: _$scope.status.newListName,
                  notLoaded: 0
                };
                _$listsbusinesslayer.addList(list, function(data) {
                  _$listsmodel.add(data.list);
                  $location.path('/lists/' + data.list.id);
                  return _$scope.isAddingList = false;
                }, function() {
                  _$scope.status.addingList = false;
                  return _$scope.isAddingList = false;
                });
                return _$scope.status.newListName = '';
              } else {
                return alert(t('tasks', 'The name "%s" is already used.').replace('%s', _$scope.status.newListName));
              }
            } else {
              return alert(t('tasks', 'An empty name is not allowed.'));
            }
          };
          this._$scope.editName = function(listID) {
            _$scope.status.addingList = false;
            _$scope.status.listNameBackup = _$listsmodel.getById(listID).displayname;
            return $location.path('/lists/' + _$scope.route.listID + '/edit/name');
          };
          this._$scope.checkName = function(event) {
            if (!_$scope.status.listNameBackup) {
              _$scope.status.listNameBackup = _$listsmodel.getById(_$scope.route.listID).displayname;
            }
            if (event.keyCode === 13) {
              event.preventDefault();
              _$scope.submitNewName();
            }
            if (event.keyCode === 27) {
              _$listsmodel.getById(_$scope.route.listID).displayname = _$scope.status.listNameBackup;
              return _$scope.endEditList();
            }
          };
          this._$scope.submitNewName = function() {
            var name;
            name = _$listsmodel.getById(_$scope.route.listID).displayname;
            if (name) {
              if (_$listsmodel.checkName(name, _$scope.route.listID)) {
                _$listsbusinesslayer.setListName(_$scope.route.listID);
                return _$scope.endEditList();
              } else {
                return alert(t('tasks', 'The name "%s" is already used.').replace('%s', name));
              }
            } else {
              return alert(t('tasks', 'An empty name is not allowed.'));
            }
          };
          this._$scope.endEditList = function() {
            return $location.path('/lists/' + _$scope.route.listID);
          };
          this._$scope.setListName = function(listID, listName) {
            return _$listsbusinesslayer.setListName(listID(listName));
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
          this._$scope.showDelete = function(listID) {
            var _ref;
            return (_ref = _$scope.route.listID) !== 'starred' && _ref !== 'today' && _ref !== 'completed' && _ref !== 'week' && _ref !== 'all' && _ref !== 'current';
          };
          this._$scope.update = function() {
            if (!_$scope.isLoading()) {
              _$tasksbusinesslayer.updateModel();
              return _$listsbusinesslayer.updateModel();
            }
          };
          this._$scope.dragoverList = function($event, item, index) {
            return true;
          };
          this._$scope.dropList = function($event, item, index) {
            var listID, taskID;
            taskID = item.id;
            listID = $($event.target).closest('li.list').attr('listID');
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
      return new ListController($scope, $window, $routeParams, ListsModel, TasksBusinessLayer, CollectionsModel, ListsBusinessLayer, $location, SearchBusinessLayer);
    }
  ]);

}).call(this);

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
            var list;
            if (angular.isDefined(list = _$listsmodel.getById(_$listsmodel.getStandardList()))) {
              switch (_$scope.route.listID) {
                case 'starred':
                  return t('tasks', 'Add an important item in "%s"...').replace('%s', list.displayname);
                case 'today':
                  return t('tasks', 'Add an item due today in "%s"...').replace('%s', list.displayname);
                case 'all':
                  return t('tasks', 'Add an item in "%s"...').replace('%s', list.displayname);
                case 'current':
                  return t('tasks', 'Add a current item in "%s"...').replace('%s', list.displayname);
                case 'completed':
                case 'week':
                  return null;
                default:
                  if (angular.isDefined(_$listsmodel.getById(_$scope.route.listID))) {
                    return t('tasks', 'Add an item in "%s"...').replace('%s', _$listsmodel.getById(_$scope.route.listID).displayname);
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

(function() {
  angular.module('Tasks').factory('ListsBusinessLayer', [
    'ListsModel', 'Persistence', 'TasksModel', function(ListsModel, Persistence, TasksModel) {
      var ListsBusinessLayer;
      ListsBusinessLayer = (function() {
        function ListsBusinessLayer(_$listsmodel, _persistence, _$tasksmodel) {
          this._$listsmodel = _$listsmodel;
          this._persistence = _persistence;
          this._$tasksmodel = _$tasksmodel;
        }

        ListsBusinessLayer.prototype.addList = function(list, onSuccess, onFailure) {
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
          this._$listsmodel.add(list);
          success = function(response) {
            if (response.status === 'error') {
              return onFailure();
            } else {
              return onSuccess(response.data);
            }
          };
          return this._persistence.addList(list, success);
        };

        ListsBusinessLayer.prototype.deleteList = function(listID) {
          this._$tasksmodel.removeByList(listID);
          this._$listsmodel.removeById(listID);
          return this._persistence.deleteList(listID);
        };

        ListsBusinessLayer.prototype.setListName = function(listID) {
          return this._persistence.setListName(this._$listsmodel.getById(listID));
        };

        ListsBusinessLayer.prototype.updateModel = function() {
          var success,
            _this = this;
          this._$listsmodel.voidAll();
          success = function() {
            return _this._$listsmodel.removeVoid();
          };
          return this._persistence.getLists(success, true);
        };

        return ListsBusinessLayer;

      })();
      return new ListsBusinessLayer(ListsModel, Persistence, TasksModel);
    }
  ]);

}).call(this);

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

(function() {
  angular.module('Tasks').factory('TasksBusinessLayer', [
    'TasksModel', 'Persistence', function(TasksModel, Persistence) {
      var TasksBusinessLayer;
      TasksBusinessLayer = (function() {
        function TasksBusinessLayer(_$tasksmodel, _persistence) {
          this._$tasksmodel = _$tasksmodel;
          this._persistence = _persistence;
        }

        TasksBusinessLayer.prototype.addTask = function(task, onSuccess, onFailure) {
          var parentID, success,
            _this = this;
          if (onSuccess == null) {
            onSuccess = null;
          }
          if (onFailure == null) {
            onFailure = null;
          }
          onSuccess || (onSuccess = function() {});
          onFailure || (onFailure = function() {});
          this._$tasksmodel.add(task);
          this.uncompleteParents(task.related);
          parentID = this._$tasksmodel.getIdByUid(task.related);
          if (parentID) {
            this.unhideSubtasks(parentID);
          }
          success = function(response) {
            if (response.status === 'error') {
              return onFailure();
            } else {
              return onSuccess(response.data);
            }
          };
          return this._persistence.addTask(task, success);
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

        TasksBusinessLayer.prototype.setPriority = function(taskID, priority) {
          this._$tasksmodel.setPriority(taskID, priority);
          if (+priority === 6 || +priority === 7 || +priority === 8 || +priority === 9) {
            this._$tasksmodel.star(taskID);
          } else {
            this._$tasksmodel.unstar(taskID);
          }
          return this._persistence.setPriority(taskID, priority);
        };

        TasksBusinessLayer.prototype.starTask = function(taskID) {
          return this.setPriority(taskID, '9');
        };

        TasksBusinessLayer.prototype.unstarTask = function(taskID) {
          return this.setPriority(taskID, '0');
        };

        TasksBusinessLayer.prototype.setPercentComplete = function(taskID, percentComplete) {
          var task;
          this._$tasksmodel.setPercentComplete(taskID, percentComplete);
          if (percentComplete < 100) {
            this._$tasksmodel.uncomplete(taskID);
            task = this._$tasksmodel.getById(taskID);
            this.uncompleteParents(task.related);
          } else {
            this._$tasksmodel.complete(taskID);
            this.completeChildren(taskID);
          }
          return this._persistence.setPercentComplete(taskID, percentComplete);
        };

        TasksBusinessLayer.prototype.completeTask = function(taskID) {
          this.setPercentComplete(taskID, 100);
          return this.hideSubtasks(taskID);
        };

        TasksBusinessLayer.prototype.uncompleteTask = function(taskID) {
          return this.setPercentComplete(taskID, 0);
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
      return new TasksBusinessLayer(TasksModel, Persistence);
    }
  ]);

}).call(this);

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
          this._tmpIdCache = {};
          ListsModel.__super__.constructor.call(this);
        }

        ListsModel.prototype.add = function(list, clearCache) {
          var tmplist, updateById, updateByTmpId;
          if (clearCache == null) {
            clearCache = true;
          }
          tmplist = this._tmpIdCache[list.tmpID];
          updateById = angular.isDefined(list.id) && angular.isDefined(this.getById(list.id));
          updateByTmpId = angular.isDefined(tmplist) && angular.isUndefined(tmplist.id);
          if (updateById || updateByTmpId) {
            return this.update(list, clearCache);
          } else {
            if (angular.isDefined(list.id)) {
              return ListsModel.__super__.add.call(this, list, clearCache);
            } else {
              this._tmpIdCache[list.tmpID] = list;
              this._data.push(list);
              if (clearCache) {
                return this._invalidateCache();
              }
            }
          }
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

        ListsModel.prototype.removeById = function(listID) {
          return ListsModel.__super__.removeById.call(this, listID);
        };

        ListsModel.prototype.voidAll = function() {
          var list, lists, _i, _len, _results;
          lists = this.getAll();
          _results = [];
          for (_i = 0, _len = lists.length; _i < _len; _i++) {
            list = lists[_i];
            _results.push(list["void"] = true);
          }
          return _results;
        };

        ListsModel.prototype.removeVoid = function() {
          var id, list, listIDs, lists, _i, _j, _len, _len1, _results;
          lists = this.getAll();
          listIDs = [];
          for (_i = 0, _len = lists.length; _i < _len; _i++) {
            list = lists[_i];
            if (list["void"]) {
              listIDs.push(list.id);
            }
          }
          _results = [];
          for (_j = 0, _len1 = listIDs.length; _j < _len1; _j++) {
            id = listIDs[_j];
            _results.push(this.removeById(id));
          }
          return _results;
        };

        ListsModel.prototype.getStandardList = function() {
          var lists;
          if (this.size()) {
            lists = this.getAll();
            return lists[0].id;
          }
        };

        ListsModel.prototype.checkName = function(listName, listID) {
          var list, lists, ret, _i, _len;
          if (listID == null) {
            listID = void 0;
          }
          lists = this.getAll();
          ret = true;
          for (_i = 0, _len = lists.length; _i < _len; _i++) {
            list = lists[_i];
            if (list.displayname === listName && listID !== list.id) {
              ret = false;
            }
          }
          return ret;
        };

        ListsModel.prototype.getCount = function(listID, collectionID, filter) {
          var count, task, tasks, _i, _len;
          if (filter == null) {
            filter = '';
          }
          count = 0;
          tasks = this._$tasksmodel.filteredTasks(filter);
          for (_i = 0, _len = tasks.length; _i < _len; _i++) {
            task = tasks[_i];
            count += this._$tasksmodel.filterTasks(task, collectionID) && task.calendarid === listID && !task.related;
          }
          if (collectionID === 'completed' && filter === '') {
            count += this.notLoaded(listID);
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

        TasksModel.prototype.filterTasks = function(task, filter) {
          switch (filter) {
            case 'completed':
              return task.completed === true;
            case 'all':
              return task.completed === false;
            case 'current':
              return task.completed === false && this.current(task.start, task.due);
            case 'starred':
              return task.completed === false && task.starred === true;
            case 'today':
              return task.completed === false && (this.today(task.start) || this.today(task.due));
            case 'week':
              return task.completed === false && (this.week(task.start) || this.week(task.due));
            default:
              return '' + task.calendarid === '' + filter;
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

        TasksModel.prototype.starred = function(taskID) {
          return this.getById(taskID).starred;
        };

        TasksModel.prototype.star = function(taskID) {
          return this.update({
            id: taskID,
            starred: true
          });
        };

        TasksModel.prototype.unstar = function(taskID) {
          return this.update({
            id: taskID,
            starred: false
          });
        };

        TasksModel.prototype.setPriority = function(taskID, priority) {
          return this.update({
            id: taskID,
            priority: priority
          });
        };

        TasksModel.prototype.completed = function(taskID) {
          return this.getById(taskID).completed;
        };

        TasksModel.prototype.complete = function(taskID) {
          return this.update({
            id: taskID,
            completed: true,
            completed_date: moment().format("YYYYMMDDTHHmmss")
          });
        };

        TasksModel.prototype.uncomplete = function(taskID) {
          return this.update({
            id: taskID,
            completed: false,
            completed_date: null
          });
        };

        TasksModel.prototype.setPercentComplete = function(taskID, complete) {
          return this.update({
            id: taskID,
            complete: complete
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

(function() {
  angular.module('Tasks').factory('Persistence', [
    'Request', 'Loading', '$rootScope', '$q', function(Request, Loading, $rootScope, $q) {
      var Persistence;
      Persistence = (function() {
        function Persistence(_request, _Loading, _$rootScope) {
          this._request = _request;
          this._Loading = _Loading;
          this._$rootScope = _$rootScope;
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
          this.getLists();
          this.getTasks('init', 'all', successCallback);
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

        Persistence.prototype.getLists = function(onSuccess, showLoading, which) {
          var failureCallbackWrapper, params, successCallbackWrapper,
            _this = this;
          if (showLoading == null) {
            showLoading = true;
          }
          if (which == null) {
            which = 'all';
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
              request: which
            }
          };
          return this._request.get('/apps/tasks/lists', params);
        };

        Persistence.prototype.addList = function(list, onSuccess, onFailure) {
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
              name: list.displayname,
              tmpID: list.tmpID
            },
            onSuccess: onSuccess,
            onFailure: onFailure
          };
          return this._request.post('/apps/tasks/lists/add', params);
        };

        Persistence.prototype.setListName = function(list) {
          var params;
          params = {
            routeParams: {
              listID: list.id
            },
            data: {
              name: list.displayname
            }
          };
          return this._request.post('/apps/tasks/lists/{listID}/name', params);
        };

        Persistence.prototype.deleteList = function(listID) {
          var params;
          params = {
            routeParams: {
              listID: listID
            }
          };
          return this._request.post('/apps/tasks/lists/{listID}/delete', params);
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
      return new Persistence(Request, Loading, $rootScope);
    }
  ]);

}).call(this);

(function() {
  angular.module('Tasks').factory('Publisher', [
    'ListsModel', 'TasksModel', 'CollectionsModel', 'SettingsModel', function(ListsModel, TasksModel, CollectionsModel, SettingsModel) {
      var Publisher;
      Publisher = (function() {
        function Publisher(_$listsmodel, _$tasksmodel, _$collectionsmodel, _$settingsmodel) {
          this._$listsmodel = _$listsmodel;
          this._$tasksmodel = _$tasksmodel;
          this._$collectionsmodel = _$collectionsmodel;
          this._$settingsmodel = _$settingsmodel;
          this._subscriptions = {};
          this.subscribeObjectTo(this._$collectionsmodel, 'collections');
          this.subscribeObjectTo(this._$settingsmodel, 'settings');
          this.subscribeObjectTo(this._$listsmodel, 'lists');
          this.subscribeObjectTo(this._$tasksmodel, 'tasks');
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
      return new Publisher(ListsModel, TasksModel, CollectionsModel, SettingsModel);
    }
  ]);

}).call(this);

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

(function() {
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

}).call(this);

(function() {
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

}).call(this);

(function() {
  angular.module('Tasks').filter('dateDetails', function() {
    return function(due) {
      if (moment(due, "YYYYMMDDTHHmmss").isValid()) {
        return moment(due, "YYYYMMDDTHHmmss").locale('details').calendar();
      } else {
        return t('tasks', 'Set due date');
      }
    };
  });

}).call(this);

(function() {
  angular.module('Tasks').filter('dateDetailsShort', function() {
    return function(reminder) {
      if (moment(reminder, "YYYYMMDDTHHmmss").isValid()) {
        return moment(reminder, "YYYYMMDDTHHmmss").locale('details_short').calendar();
      } else {
        return '';
      }
    };
  });

}).call(this);

(function() {
  angular.module('Tasks').filter('dateFromNow', function() {
    return function(due) {
      if (moment(due, "YYYYMMDDTHHmmss").isValid()) {
        return moment(due, "YYYYMMDDTHHmmss").fromNow();
      } else {
        return '';
      }
    };
  });

}).call(this);

(function() {
  angular.module('Tasks').filter('dateTaskList', function() {
    return function(due) {
      if (moment(due, "YYYYMMDDTHHmmss").isValid()) {
        return moment(due, "YYYYMMDDTHHmmss").locale('tasks').calendar();
      } else {
        return '';
      }
    };
  });

}).call(this);

(function() {
  angular.module('Tasks').filter('day', function() {
    return function(i) {
      return moment().add('days', i).locale('list_week').calendar();
    };
  });

}).call(this);

(function() {
  angular.module('Tasks').filter('dayTaskList', function() {
    return function(due) {
      if (moment(due, "YYYYMMDDTHHmmss").isValid()) {
        return moment(due, "YYYYMMDDTHHmmss").locale('tasks').calendar();
      } else {
        return '';
      }
    };
  });

}).call(this);

(function() {
  angular.module('Tasks').filter('percentDetails', function() {
    return function(percent) {
      return t('tasks', '%s %% completed').replace('%s', percent).replace('%%', '%');
    };
  });

}).call(this);

(function() {
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

}).call(this);

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

(function() {
  angular.module('Tasks').filter('startDetails', function() {
    return function(due) {
      if (moment(due, "YYYYMMDDTHHmmss").isValid()) {
        return moment(due, "YYYYMMDDTHHmmss").locale('start').calendar();
      } else {
        return t('tasks', 'Set start date');
      }
    };
  });

}).call(this);

(function() {
  angular.module('Tasks').filter('timeTaskList', function() {
    return function(due) {
      if (moment(due, "YYYYMMDDTHHmmss").isValid()) {
        return moment(due, "YYYYMMDDTHHmmss").format('HH:mm');
      } else {
        return '';
      }
    };
  });

}).call(this);

})(window.angular, window.jQuery, window.moment);
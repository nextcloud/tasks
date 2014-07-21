(function(angular, $, moment, undefined){

/**
 * ownCloud Task App - v0.1
 *
 * Copyright (c) 2014 - Raimund Schlüßler <raimund.schluessler@googlemail.com>
 *
 * This file is licensed under the Affero General Public License version 3 or later.
 * See the COPYING file
 *
 */


(function() {
  angular.module('Tasks', ['OC', 'ngRoute', 'ngAnimate', 'ui.bootstrap']).config([
    '$provide', '$routeProvider', '$interpolateProvider', function($provide, $routeProvider, $interpolateProvider) {
      var config;
      $provide.value('Config', config = {
        markReadTimeout: 500,
        taskUpdateInterval: 1000 * 600
      });
      $routeProvider.when('/lists/:listID', {}).when('/lists/:listID/edit/:listparameter', {}).when('/lists/:listID/tasks/:taskID', {}).when('/lists/:listID/tasks/:taskID/settings', {}).when('/lists/:listID/tasks/:taskID/edit/:parameter', {}).when('/search/:searchString', {}).when('/search/:searchString/tasks/:taskID', {}).when('/search/:searchString/tasks/:taskID/edit/:parameter', {}).otherwise({
        redirectTo: '/lists/all'
      });
      /*
      	overwrite angular's directive ngSwitchWhen
        	to handle ng-switch-when="value1 || value2 || value3
        	see
      	http://docs.angularjs.org/api/ng.directive:ngSwitch
      */

      $provide.decorator('ngSwitchWhenDirective', function($delegate) {
        $delegate[0].compile = function(element, attrs, transclude) {
          return function(scope, element, attr, ctrl) {
            var casee, i, len, subCases, _results;
            subCases = [attrs.ngSwitchWhen];
            if (attrs.ngSwitchWhen && attrs.ngSwitchWhen.length > 0 && attrs.ngSwitchWhen.indexOf('||') !== -1) {
              subCases = attrs.ngSwitchWhen.split('||');
            }
            i = 0;
            len = subCases.length;
            _results = [];
            while (i < len) {
              casee = $.trim(subCases[i++]);
              ctrl.cases['!' + casee] = ctrl.cases['!' + casee] || [];
              _results.push(ctrl.cases['!' + casee].push({
                transclude: transclude,
                element: element
              }));
            }
            return _results;
          };
        };
        return $delegate;
      });
    }
  ]);

  angular.module('Tasks').run([
    'Config', '$timeout', 'ListsBusinessLayer', 'TasksBusinessLayer', function(Config, $timeout, TasksBusinessLayer, ListsBusinessLayer) {
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
      moment.lang('details', {
        calendar: {
          lastDay: '[' + t('tasks_enhanced', 'Due yesterday') + '], HH:mm',
          sameDay: '[' + t('tasks_enhanced', 'Due today') + '], HH:mm',
          nextDay: '[' + t('tasks_enhanced', 'Due tomorrow') + '], HH:mm',
          lastWeek: '[' + t('tasks_enhanced', 'Due on') + '] MMM DD, YYYY, HH:mm',
          nextWeek: '[' + t('tasks_enhanced', 'Due on') + '] MMM DD, YYYY, HH:mm',
          sameElse: '[' + t('tasks_enhanced', 'Due on') + '] MMM DD, YYYY, HH:mm'
        }
      });
      moment.lang('start', {
        calendar: {
          lastDay: '[' + t('tasks_enhanced', 'Started yesterday') + '], HH:mm',
          sameDay: '[' + t('tasks_enhanced', 'Starts today') + '], HH:mm',
          nextDay: '[' + t('tasks_enhanced', 'Starts tomorrow') + '], HH:mm',
          lastWeek: '[' + t('tasks_enhanced', 'Started on') + '] MMM DD, YYYY, HH:mm',
          nextWeek: '[' + t('tasks_enhanced', 'Starts on') + '] MMM DD, YYYY, HH:mm',
          sameElse: function() {
            if (this.diff(moment()) > 0) {
              return '[' + t('tasks_enhanced', 'Starts on') + '] MMM DD, YYYY, HH:mm';
            } else {
              return '[' + t('tasks_enhanced', 'Started on') + '] MMM DD, YYYY, HH:mm';
            }
          }
        }
      });
      moment.lang('reminder', {
        calendar: {
          lastDay: t('tasks_enhanced', '[Remind me yesterday at ]HH:mm'),
          sameDay: t('tasks_enhanced', '[Remind me today at ]HH:mm'),
          nextDay: t('tasks_enhanced', '[Remind me tomorrow at ]HH:mm'),
          lastWeek: t('tasks_enhanced', '[Remind me on ]MMM DD, YYYY,[ at ]HH:mm'),
          nextWeek: t('tasks_enhanced', '[Remind me on ]MMM DD, YYYY,[ at ]HH:mm'),
          sameElse: t('tasks_enhanced', '[Remind me on ]MMM DD, YYYY,[ at ]HH:mm')
        }
      });
      moment.lang('tasks', {
        calendar: {
          lastDay: '[' + t('tasks_enhanced', 'Yesterday') + ']',
          sameDay: '[' + t('tasks_enhanced', 'Today') + ']',
          nextDay: '[' + t('tasks_enhanced', 'Tomorrow') + ']',
          lastWeek: 'DD.MM.YYYY',
          nextWeek: 'DD.MM.YYYY',
          sameElse: 'DD.MM.YYYY'
        }
      });
      moment.lang('details_short', {
        calendar: {
          lastDay: '[' + t('tasks_enhanced', 'Yesterday') + ']',
          sameDay: '[' + t('tasks_enhanced', 'Today') + ']',
          nextDay: '[' + t('tasks_enhanced', 'Tomorrow') + ']',
          lastWeek: 'MMM DD, YYYY',
          nextWeek: 'MMM DD, YYYY',
          sameElse: 'MMM DD, YYYY'
        }
      });
      moment.lang('list_week', {
        calendar: {
          lastDay: '[' + t('tasks_enhanced', 'Yesterday') + ']',
          sameDay: '[' + t('tasks_enhanced', 'Today') + '], MMM. DD',
          nextDay: '[' + t('tasks_enhanced', 'Tomorrow') + '], MMM. DD',
          lastWeek: 'ddd, MMM. DD',
          nextWeek: 'ddd, MMM. DD',
          sameElse: 'ddd, MMM. DD'
        }
      });
      return moment.lang('en', {
        relativeTime: {
          future: t('tasks_enhanced', "in %s"),
          past: t('tasks_enhanced', "%s ago"),
          s: t('tasks_enhanced', "seconds"),
          m: t('tasks_enhanced', "a minute"),
          mm: t('tasks_enhanced', "%d minutes"),
          h: t('tasks_enhanced', "an hour"),
          hh: t('tasks_enhanced', "%d hours"),
          d: t('tasks_enhanced', "a day"),
          dd: t('tasks_enhanced', "%d days"),
          M: t('tasks_enhanced', "a month"),
          MM: t('tasks_enhanced', "%d months"),
          y: t('tasks_enhanced', "a year"),
          yy: t('tasks_enhanced', "%d years")
        }
      });
    }
  ]);

}).call(this);

(function() {
  angular.module('Tasks').directive('avatar', function() {
    return {
      restrict: 'A',
      scope: false,
      link: function(scope, elm, attr) {
        return attr.$observe('userID', function() {
          if (attr.userid) {
            return elm.avatar(attr.userid, attr.size);
          }
        });
      }
    };
  });

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
  angular.module('Tasks').directive('ocDragTask', function() {
    return {
      link: function(scope, elm, attr) {
        return elm.draggable({
          helper: "clone",
          appendTo: $('#content'),
          cursorAt: {
            left: 150,
            top: 15
          },
          distance: 4,
          start: function(event, ui) {
            return $(this).css('visibility', 'hidden');
          },
          stop: function(event, ui) {
            return $(this).css('visibility', 'visible');
          }
        });
      }
    };
  });

}).call(this);

(function() {
  angular.module('Tasks').directive('ocDropTask', function() {
    return {
      link: function(scope, elm, attr) {
        return elm.droppable({
          over: function(event, ui) {
            return $(this).addClass('dragOver');
          },
          out: function(event, ui) {
            return $(this).removeClass('dragOver');
          },
          deactivate: function(event, ui) {
            return $(this).removeClass('dragOver');
          },
          drop: function(event, ui) {
            return scope.$apply(scope.TasksBusinessLayer.changeList($(this).attr('rel'), ui.helper.attr('rel')));
          }
        });
      }
    };
  });

}).call(this);

(function() {
  angular.module('Tasks').directive('pane', function() {
    var directive;
    return directive = {
      scope: {
        title: '@'
      },
      require: '^tabs',
      restrict: 'E',
      transclude: true,
      replace: true,
      link: function(scope, element, attrs, tabsCtrl) {
        return tabsCtrl.addPane(scope);
      },
      template: '<div class="tab-pane" ng-class="{active: selected}"' + 'ng-transclude>[[ ]]</div>'
    };
  });

}).call(this);

(function() {
  angular.module('Tasks').directive('stopEvent', function() {
    return {
      restrict: 'A',
      link: function(scope, element, attr) {
        return element.bind(attr.stopEvent, function(e) {
          return e.stopPropagation();
        });
      }
    };
  });

}).call(this);

(function() {
  angular.module('Tasks').directive('tabs', function() {
    var directive;
    return directive = {
      restrict: 'E',
      scope: {},
      controller: function($scope, $element) {
        var panes;
        panes = $scope.panes = [];
        $scope.select = function(pane) {
          angular.forEach(panes, function(pane) {
            return pane.selected = false;
          });
          return pane.selected = true;
        };
        return this.addPane = function(pane) {
          if (panes.length === 0) {
            $scope.select(pane);
          }
          return panes.push(pane);
        };
      }
    };
  });

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
          hourText: t('tasks_enhanced', 'Hours'),
          minuteText: t('tasks_enhanced', 'Minutes')
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
    '$scope', 'Persistence', '$route', 'Status', '$timeout', '$location', '$routeParams', 'Loading', '$modal', 'SettingsModel', function($scope, Persistence, $route, status, $timeout, $location, $routeParams, Loading, $modal, SettingsModel) {
      var AppController;
      AppController = (function() {
        function AppController(_$scope, _persistence, _$route, _$status, _$timeout, _$location, _$routeparams, _Loading, _$modal, _$settingsmodel) {
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
          this._$modal = _$modal;
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
          this._$scope.closeAll = function() {
            if (_$scope.status.searchActive) {
              _$location.path('/search/' + _$scope.route.searchString);
            } else {
              _$location.path('/lists/' + _$scope.route.listID);
            }
            _$scope.status.addingList = false;
            _$scope.status.focusTaskInput = false;
            return _$scope.status.newListName = "";
          };
          this._$scope.isLoading = function() {
            return _Loading.isLoading();
          };
          this._$scope.showSettings = function() {
            return _$scope.modalInstance = _$modal.open({
              templateUrl: 'part.settings.html',
              controller: 'SettingsController',
              backdrop: true,
              windowClass: 'test'
            });
          };
        }

        return AppController;

      })();
      return new AppController($scope, Persistence, $route, status, $timeout, $location, $routeParams, Loading, $modal, SettingsModel);
    }
  ]);

}).call(this);

(function() {
  angular.module('Tasks').controller('DetailsController', [
    '$scope', '$window', 'TasksModel', 'TasksBusinessLayer', '$route', '$location', '$timeout', '$routeParams', 'SettingsModel', function($scope, $window, TasksModel, TasksBusinessLayer, $route, $location, $timeout, $routeParams, SettingsModel) {
      var DetailsController;
      DetailsController = (function() {
        function DetailsController(_$scope, _$window, _$tasksmodel, _tasksbusinesslayer, _$route, _$location, _$timeout, _$routeparams, _$settingsmodel) {
          this._$scope = _$scope;
          this._$window = _$window;
          this._$tasksmodel = _$tasksmodel;
          this._tasksbusinesslayer = _tasksbusinesslayer;
          this._$route = _$route;
          this._$location = _$location;
          this._$timeout = _$timeout;
          this._$routeparams = _$routeparams;
          this._$settingsmodel = _$settingsmodel;
          this._$scope.task = _$tasksmodel.getById(_$scope.route.taskID);
          this._$scope.$on('$routeChangeSuccess', function() {
            return _$scope.task = _$tasksmodel.getById(_$scope.route.taskID);
          });
          this._$scope.settingsmodel = this._$settingsmodel;
          this._$scope.isAddingComment = false;
          this._$scope.durations = [
            {
              name: t('tasks_enhanced', 'week'),
              names: t('tasks_enhanced', 'weeks'),
              id: 'week'
            }, {
              name: t('tasks_enhanced', 'day'),
              names: t('tasks_enhanced', 'days'),
              id: 'day'
            }, {
              name: t('tasks_enhanced', 'hour'),
              names: t('tasks_enhanced', 'hours'),
              id: 'hour'
            }, {
              name: t('tasks_enhanced', 'minute'),
              names: t('tasks_enhanced', 'minutes'),
              id: 'minute'
            }, {
              name: t('tasks_enhanced', 'second'),
              names: t('tasks_enhanced', 'seconds'),
              id: 'second'
            }
          ];
          this._$scope.params = function(task) {
            var params;
            params = [
              {
                name: t('tasks_enhanced', 'before beginning'),
                invert: true,
                related: 'START',
                id: "10"
              }, {
                name: t('tasks_enhanced', 'after beginning'),
                invert: false,
                related: 'START',
                id: "00"
              }, {
                name: t('tasks_enhanced', 'before end'),
                invert: true,
                related: 'END',
                id: "11"
              }, {
                name: t('tasks_enhanced', 'after end'),
                invert: false,
                related: 'END',
                id: "01"
              }
            ];
            if (task.due && task.start) {
              return params;
            } else if (task.start) {
              return params.slice(0, 2);
            } else {
              return params.slice(2);
            }
          };
          this._$scope.closeDetails = function() {
            if (_$scope.status.searchActive) {
              return _$location.path('/search/' + _$scope.route.searchString);
            } else {
              return _$location.path('/lists/' + _$scope.route.listID);
            }
          };
          this._$scope.deleteTask = function(taskID) {
            _$scope.closeDetails();
            return _$timeout(function() {
              return _tasksbusinesslayer.deleteTask(taskID);
            }, 500);
          };
          this._$scope.editName = function() {
            if (_$scope.status.searchActive) {
              return _$location.path('/search/' + _$scope.route.searchString + '/tasks/' + _$scope.route.taskID + '/edit/name');
            } else {
              return _$location.path('/lists/' + _$scope.route.listID + '/tasks/' + _$scope.route.taskID + '/edit/name');
            }
          };
          this._$scope.editDueDate = function() {
            if (_$scope.status.searchActive) {
              _$location.path('/search/' + _$scope.route.searchString + '/tasks/' + _$scope.route.taskID + '/edit/duedate');
            } else {
              _$location.path('/lists/' + _$scope.route.listID + '/tasks/' + _$scope.route.taskID + '/edit/duedate');
            }
            return _tasksbusinesslayer.initDueDate(_$scope.route.taskID);
          };
          this._$scope.editStart = function() {
            if (_$scope.status.searchActive) {
              _$location.path('/search/' + _$scope.route.searchString + '/tasks/' + _$scope.route.taskID + '/edit/startdate');
            } else {
              _$location.path('/lists/' + _$scope.route.listID + '/tasks/' + _$scope.route.taskID + '/edit/startdate');
            }
            return _tasksbusinesslayer.initStartDate(_$scope.route.taskID);
          };
          this._$scope.editReminder = function() {
            if (_$scope.status.searchActive) {
              _$location.path('/search/' + _$scope.route.searchString + '/tasks/' + _$scope.route.taskID + '/edit/reminder');
            } else {
              _$location.path('/lists/' + _$scope.route.listID + '/tasks/' + _$scope.route.taskID + '/edit/reminder');
            }
            return _tasksbusinesslayer.initReminder(_$scope.route.taskID);
          };
          this._$scope.editNote = function() {
            if (_$scope.status.searchActive) {
              return _$location.path('/search/' + _$scope.route.searchString + '/tasks/' + _$scope.route.taskID + '/edit/note');
            } else {
              return _$location.path('/lists/' + _$scope.route.listID + '/tasks/' + _$scope.route.taskID + '/edit/note');
            }
          };
          this._$scope.editPercent = function() {
            if (_$scope.status.searchActive) {
              return _$location.path('/search/' + _$scope.route.searchString + '/tasks/' + _$scope.route.taskID + '/edit/percent');
            } else {
              return _$location.path('/lists/' + _$scope.route.listID + '/tasks/' + _$scope.route.taskID + '/edit/percent');
            }
          };
          this._$scope.endEdit = function() {
            if (_$scope.status.searchActive) {
              return _$location.path('/search/' + _$scope.route.searchString + '/tasks/' + _$scope.route.taskID);
            } else {
              return _$location.path('/lists/' + _$scope.route.listID + '/tasks/' + _$scope.route.taskID);
            }
          };
          this._$scope.endName = function(event) {
            if (event.keyCode === 13) {
              event.preventDefault();
              _$scope.endEdit();
            }
            if (event.keyCode === 27) {
              return _$scope.endEdit();
            }
          };
          this._$scope.deleteDueDate = function() {
            _tasksbusinesslayer.deleteDueDate(_$scope.route.taskID);
            return _$scope.endEdit();
          };
          this._$scope.deletePercent = function() {
            _tasksbusinesslayer.setPercentComplete(_$scope.route.taskID, 0);
            return _$scope.endEdit();
          };
          this._$scope.deleteStartDate = function() {
            _tasksbusinesslayer.deleteStartDate(_$scope.route.taskID);
            return _$scope.endEdit();
          };
          this._$scope.deleteReminder = function() {
            _tasksbusinesslayer.deleteReminderDate(_$scope.route.taskID);
            return _$scope.endEdit();
          };
          this._$scope.toggleCompleted = function(taskID) {
            if (_$tasksmodel.completed(taskID)) {
              _tasksbusinesslayer.uncompleteTask(taskID);
              return _tasksbusinesslayer.setPercentComplete(taskID, 0);
            } else {
              _tasksbusinesslayer.completeTask(taskID);
              return _tasksbusinesslayer.setPercentComplete(taskID, 100);
            }
          };
          this._$scope.toggleStarred = function(taskID) {
            if (_$tasksmodel.starred(taskID)) {
              return _tasksbusinesslayer.unstarTask(taskID);
            } else {
              return _tasksbusinesslayer.starTask(taskID);
            }
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
                if (_$scope.nametimer) {
                  $timeout.cancel(_$scope.nametimer);
                }
                _$scope.nametimer = $timeout(function() {
                  return _tasksbusinesslayer.setTaskName(_$scope.task.id, _$scope.task.name);
                }, 2000);
              }
              if (newVal.note !== oldVal.note) {
                if (_$scope.notetimer) {
                  $timeout.cancel(_$scope.notetimer);
                }
                _$scope.notetimer = $timeout(function() {
                  return _tasksbusinesslayer.setTaskNote(_$scope.task.id, _$scope.task.note);
                }, 5000);
              }
              if (newVal.complete !== oldVal.complete) {
                if (_$scope.completetimer) {
                  $timeout.cancel(_$scope.completetimer);
                }
                return _$scope.completetimer = $timeout(function() {
                  return _tasksbusinesslayer.setPercentComplete(_$scope.task.id, _$scope.task.complete);
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
                _$tasksmodel.updateComment(data.comment);
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
              button: t('tasks_enhanced', 'Comment'),
              input: t('tasks_enhanced', 'Add a comment')
            };
          };
        }

        return DetailsController;

      })();
      return new DetailsController($scope, $window, TasksModel, TasksBusinessLayer, $route, $location, $timeout, $routeParams, SettingsModel);
    }
  ]);

}).call(this);

(function() {
  angular.module('Tasks').controller('ListController', [
    '$scope', '$window', '$routeParams', 'ListsModel', 'TasksBusinessLayer', 'CollectionsModel', 'ListsBusinessLayer', '$location', function($scope, $window, $routeParams, ListsModel, TasksBusinessLayer, CollectionsModel, ListsBusinessLayer, $location) {
      var ListController;
      ListController = (function() {
        function ListController(_$scope, _$window, _$routeParams, _$listsmodel, _$tasksbusinesslayer, _$collectionsmodel, _$listsbusinesslayer, $location) {
          this._$scope = _$scope;
          this._$window = _$window;
          this._$routeParams = _$routeParams;
          this._$listsmodel = _$listsmodel;
          this._$tasksbusinesslayer = _$tasksbusinesslayer;
          this._$collectionsmodel = _$collectionsmodel;
          this._$listsbusinesslayer = _$listsbusinesslayer;
          this.$location = $location;
          this._$scope.collections = this._$collectionsmodel.getAll();
          this._$scope.lists = this._$listsmodel.getAll();
          this._$scope.TasksBusinessLayer = this._$tasksbusinesslayer;
          this._$scope.status.listNameBackup = '';
          this._$scope.deleteList = function(listID) {
            var really;
            really = confirm(t('tasks_enhanced', 'This will delete the Calendar "%s" and all of its entries.').replace('%s', _$listsmodel.getById(_$scope.route.listID).displayname));
            if (really) {
              _$listsbusinesslayer.deleteList(listID);
              return $location.path('/lists/' + _$listsmodel.getStandardList());
            }
          };
          this._$scope.startAddingList = function() {
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
                  displayname: _$scope.status.newListName
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
                return alert(t('tasks_enhanced', 'The name "%s" is already used.').replace('%s', _$scope.status.newListName));
              }
            } else {
              return alert(t('tasks_enhanced', 'An empty name ist not allowed.'));
            }
          };
          this._$scope.editName = function(listID) {
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
                return alert(t('tasks_enhanced', 'The name "%s" is already used.').replace('%s', name));
              }
            } else {
              return alert(t('tasks_enhanced', 'An empty name ist not allowed.'));
            }
          };
          this._$scope.endEditList = function() {
            return $location.path('/lists/' + _$scope.route.listID);
          };
          this._$scope.setListName = function(listID, listName) {
            return _$listsbusinesslayer.setListName(listID(listName));
          };
          this._$scope.getCollectionCount = function(collectionID) {
            return _$collectionsmodel.getCount(collectionID);
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
            return _$collectionsmodel.getCountString(collectionID);
          };
          this._$scope.getListCount = function(listID, type) {
            return _$listsmodel.getCount(listID, type);
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
        }

        return ListController;

      })();
      return new ListController($scope, $window, $routeParams, ListsModel, TasksBusinessLayer, CollectionsModel, ListsBusinessLayer, $location);
    }
  ]);

}).call(this);

(function() {
  angular.module('Tasks').controller('SearchController', [
    '$scope', '$window', 'Status', '$location', function($scope, $window, Status, $location) {
      var SearchController;
      SearchController = (function() {
        function SearchController(_$scope, _$window, _$status, _$location) {
          var _this = this;
          this._$scope = _$scope;
          this._$window = _$window;
          this._$status = _$status;
          this._$location = _$location;
          this._$scope.searchString = '';
          this._$scope.searchBuffer = '/lists/all';
          this._$scope.status = this._$status.getStatus();
          this._$scope.$on('$routeChangeSuccess', function() {
            if (_$scope.route.searchString !== void 0) {
              return _$scope.status.searchActive = true;
            }
          });
          this._$scope.openSearch = function() {
            _$scope.searchBuffer = _$location.path();
            _$location.path('/search/');
            return _$scope.status.searchActive = true;
          };
          this._$scope.closeSearch = function() {
            _$scope.searchString = '';
            _$location.path(_$scope.searchBuffer);
            return _$scope.status.searchActive = false;
          };
          this._$scope.trySearch = function(event) {
            if (event.keyCode === 27) {
              return _$scope.closeSearch();
            } else {
              return _$location.path('/search/' + _$scope.searchString);
            }
          };
        }

        return SearchController;

      })();
      return new SearchController($scope, $window, Status, $location);
    }
  ]);

}).call(this);

(function() {
  angular.module('Tasks').controller('SettingsController', [
    '$scope', '$window', 'Status', '$location', '$modalInstance', 'CollectionsModel', 'SettingsBusinessLayer', 'SettingsModel', function($scope, $window, Status, $location, $modalInstance, CollectionsModel, SettingsBusinessLayer, SettingsModel) {
      var SettingsController;
      SettingsController = (function() {
        function SettingsController(_$scope, _$window, _$status, _$location, _$modalInstance, _$collectionsmodel, _$settingsbusinesslayer, _$settingsmodel) {
          var _this = this;
          this._$scope = _$scope;
          this._$window = _$window;
          this._$status = _$status;
          this._$location = _$location;
          this._$modalInstance = _$modalInstance;
          this._$collectionsmodel = _$collectionsmodel;
          this._$settingsbusinesslayer = _$settingsbusinesslayer;
          this._$settingsmodel = _$settingsmodel;
          this._$scope.status = this._$status.getStatus();
          this._$scope.collections = this._$collectionsmodel.getAll();
          this._$scope.settingsmodel = this._$settingsmodel;
          this._$scope.collectionOptions = [
            {
              id: 0,
              name: t('tasks_enhanced', 'Hidden')
            }, {
              id: 1,
              name: t('tasks_enhanced', 'Visible')
            }, {
              id: 2,
              name: t('tasks_enhanced', 'Automatic')
            }
          ];
          this._$scope.startOfWeekOptions = [
            {
              id: 0,
              name: t('tasks_enhanced', 'Sunday')
            }, {
              id: 1,
              name: t('tasks_enhanced', 'Monday')
            }, {
              id: 2,
              name: t('tasks_enhanced', 'Tuesday')
            }, {
              id: 3,
              name: t('tasks_enhanced', 'Wednesday')
            }, {
              id: 4,
              name: t('tasks_enhanced', 'Thursday')
            }, {
              id: 5,
              name: t('tasks_enhanced', 'Friday')
            }, {
              id: 6,
              name: t('tasks_enhanced', 'Saturday')
            }
          ];
          this._$scope.ok = function() {
            return $modalInstance.close();
          };
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
      return new SettingsController($scope, $window, Status, $location, $modalInstance, CollectionsModel, SettingsBusinessLayer, SettingsModel);
    }
  ]);

}).call(this);

(function() {
  angular.module('Tasks').controller('TasksController', [
    '$scope', '$window', '$routeParams', 'TasksModel', 'ListsModel', 'CollectionsModel', 'TasksBusinessLayer', '$location', 'SettingsBusinessLayer', function($scope, $window, $routeParams, TasksModel, ListsModel, CollectionsModel, TasksBusinessLayer, $location, SettingsBusinessLayer) {
      var TasksController;
      TasksController = (function() {
        function TasksController(_$scope, _$window, _$routeParams, _$tasksmodel, _$listsmodel, _$collectionsmodel, _tasksbusinesslayer, $location, _settingsbusinesslayer) {
          this._$scope = _$scope;
          this._$window = _$window;
          this._$routeParams = _$routeParams;
          this._$tasksmodel = _$tasksmodel;
          this._$listsmodel = _$listsmodel;
          this._$collectionsmodel = _$collectionsmodel;
          this._tasksbusinesslayer = _tasksbusinesslayer;
          this.$location = $location;
          this._settingsbusinesslayer = _settingsbusinesslayer;
          this._$scope.tasks = this._$tasksmodel.getAll();
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
                  return t('tasks_enhanced', 'Add an important item in "%s"...').replace('%s', list.displayname);
                case 'today':
                  return t('tasks_enhanced', 'Add an item due today in "%s"...').replace('%s', list.displayname);
                case 'all':
                  return t('tasks_enhanced', 'Add an entry in "%s"...').replace('%s', list.displayname);
                case 'current':
                  return t('tasks_enhanced', 'Add a current entry in "%s"...').replace('%s', list.displayname);
                case 'completed':
                case 'week':
                  return null;
                default:
                  if (angular.isDefined(_$listsmodel.getById(_$scope.route.listID))) {
                    return t('tasks_enhanced', 'Add an entry in "%s"...').replace('%s', _$listsmodel.getById(_$scope.route.listID).displayname);
                  }
              }
            }
          };
          this._$scope.showInput = function() {
            var _ref;
            if (((_ref = _$scope.route.listID) === 'completed' || _ref === 'week') || _$scope.status.searchActive) {
              return false;
            } else {
              return true;
            }
          };
          this._$scope.focusInput = function() {
            return _$scope.status.focusTaskInput = true;
          };
          this._$scope.openDetails = function(id) {
            var listID, searchString;
            if (_$scope.status.searchActive) {
              searchString = _$scope.route.searchString;
              return $location.path('/search/' + searchString + '/tasks/' + id);
            } else {
              listID = _$scope.route.listID;
              return $location.path('/lists/' + listID + '/tasks/' + id);
            }
          };
          this._$scope.toggleCompleted = function(taskID) {
            if (_$tasksmodel.completed(taskID)) {
              _tasksbusinesslayer.uncompleteTask(taskID);
              return _tasksbusinesslayer.setPercentComplete(taskID, 0);
            } else {
              _tasksbusinesslayer.completeTask(taskID);
              return _tasksbusinesslayer.setPercentComplete(taskID, 100);
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
          this._$scope.filterTasks = function() {
            return function(task) {
              switch (_$scope.route.listID) {
                case 'completed':
                  return task.completed === true;
                case 'all':
                  return task.completed === false;
                case 'current':
                  return task.completed === false && _$tasksmodel.current(task.start);
                case 'starred':
                  return task.completed === false && task.starred === true;
                case 'today':
                  return task.completed === false && _$tasksmodel.today(task.due);
              }
            };
          };
          this._$scope.filterLists = function() {
            return function(list) {
              return _$scope.getCount(list.id, _$scope.route.listID);
            };
          };
          this._$scope.getCount = function(listID, type) {
            return _$listsmodel.getCount(listID, type);
          };
          this._$scope.addTask = function(taskName) {
            var task, _ref,
              _this = this;
            _$scope.isAddingTask = true;
            task = {
              tmpID: 'newTask' + Date.now(),
              calendarID: null,
              name: taskName,
              starred: false,
              due: false,
              start: false,
              completed: false
            };
            if (((_ref = _$scope.route.listID) === 'starred' || _ref === 'today' || _ref === 'week' || _ref === 'all' || _ref === 'completed' || _ref === 'current')) {
              task.calendarID = _$listsmodel.getStandardList();
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
              task.calendarID = _$scope.route.listID;
            }
            _tasksbusinesslayer.addTask(task, function(data) {
              _$tasksmodel.add(data.task);
              return _$scope.isAddingTask = false;
            }, function() {
              return _$scope.isAddingTask = false;
            });
            _$scope.status.focusTaskInput = false;
            return _$scope.taskName = '';
          };
          this._$scope.checkTaskInput = function(event) {
            if (event.keyCode === 27) {
              $('#target').blur();
              _$scope.taskName = "";
              return _$scope.status.focusTaskInput = false;
            }
          };
          this._$scope.dayHasEntry = function() {
            return function(date) {
              return _$tasksmodel.dayHasEntry(date);
            };
          };
          this._$scope.loadMore = function() {
            return console.log('TODO');
          };
          this._$scope.sortDue = function(task) {
            if (task.due === null) {
              return 'last';
            } else {
              return task.due;
            }
          };
        }

        return TasksController;

      })();
      return new TasksController($scope, $window, $routeParams, TasksModel, ListsModel, CollectionsModel, TasksBusinessLayer, $location, SettingsBusinessLayer);
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
          this._$tasksmodel.add(task);
          success = function(response) {
            if (response.status === 'error') {
              return onFailure();
            } else {
              return onSuccess(response.data);
            }
          };
          return this._persistence.addTask(task, success);
        };

        TasksBusinessLayer.prototype.starTask = function(taskID) {
          this._$tasksmodel.star(taskID);
          return this._persistence.starTask(taskID);
        };

        TasksBusinessLayer.prototype.unstarTask = function(taskID) {
          this._$tasksmodel.unstar(taskID);
          return this._persistence.unstarTask(taskID);
        };

        TasksBusinessLayer.prototype.completeTask = function(taskID) {
          this._$tasksmodel.complete(taskID);
          return this._persistence.completeTask(taskID);
        };

        TasksBusinessLayer.prototype.setPercentComplete = function(taskID, percentComplete) {
          this._$tasksmodel.setPercentComplete(taskID, percentComplete);
          this._persistence.setPercentComplete(taskID, percentComplete);
          if (percentComplete < 100) {
            return this._$tasksmodel.uncomplete(taskID);
          } else {
            return this._$tasksmodel.complete(taskID);
          }
        };

        TasksBusinessLayer.prototype.uncompleteTask = function(taskID) {
          this._$tasksmodel.uncomplete(taskID);
          return this._persistence.uncompleteTask(taskID);
        };

        TasksBusinessLayer.prototype.deleteTask = function(taskID) {
          this._$tasksmodel.removeById(taskID);
          return this._persistence.deleteTask(taskID);
        };

        TasksBusinessLayer.prototype.initDueDate = function(taskID) {
          var due;
          due = moment(this._$tasksmodel.getById(taskID).due, "YYYYMMDDTHHmmss");
          if (!due.isValid()) {
            return this.setDue(taskID, moment().startOf('hour').add('h', 1), 'time');
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
              due = date.add('h', 12);
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
            return this.setStart(taskID, moment().startOf('hour').add('h', 1), 'time');
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
              start = date.add('h', 12);
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
              task.reminder.date = moment().startOf('hour').add('h', 1).format('YYYYMMDDTHHmmss');
            }
          }
          return this.setReminder(taskID);
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
                reminderdate = date.add('h', 12);
              }
            } else {
              reminderdate = date.add('h', 12);
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
          this._$tasksmodel.changeCalendarId(taskID, calendarID);
          return this._persistence.changeCalendarId(taskID, calendarID);
        };

        TasksBusinessLayer.prototype.setTaskNote = function(taskID, note) {
          return this._persistence.setTaskNote(taskID, note);
        };

        TasksBusinessLayer.prototype.setTaskName = function(taskID, name) {
          return this._persistence.setTaskName(taskID, name);
        };

        TasksBusinessLayer.prototype.changeList = function(listID, taskID) {
          switch (listID) {
            case 'starred':
              return this.starTask(taskID);
            case 'completed':
              return this.completeTask(taskID);
            case 'uncompleted':
              return this.uncompleteTask(taskID);
            case 'today':
              return this.setDue(taskID, moment().startOf('day').add('h', 12), 'all');
            case 'week':
            case 'all':
              break;
            default:
              return this.changeCalendarId(taskID, listID);
          }
        };

        TasksBusinessLayer.prototype.updateModel = function() {
          var success,
            _this = this;
          this._$tasksmodel.voidAll();
          success = function() {
            return _this._$tasksmodel.removeVoid();
          };
          return this._persistence.getTasks(success, true);
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

        return TasksBusinessLayer;

      })();
      return new TasksBusinessLayer(TasksModel, Persistence);
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

        CollectionsModel.prototype.getCount = function(collectionID) {
          var count, task, tasks, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n;
          count = 0;
          tasks = this._$tasksmodel.getAll();
          switch (collectionID) {
            case 'starred':
              for (_i = 0, _len = tasks.length; _i < _len; _i++) {
                task = tasks[_i];
                count += task.starred && !task.completed;
              }
              break;
            case 'today':
              for (_j = 0, _len1 = tasks.length; _j < _len1; _j++) {
                task = tasks[_j];
                count += !task.completed && this._$tasksmodel.today(task.due);
              }
              break;
            case 'week':
              for (_k = 0, _len2 = tasks.length; _k < _len2; _k++) {
                task = tasks[_k];
                count += !task.completed && this._$tasksmodel.week(task.due);
              }
              break;
            case 'all':
              for (_l = 0, _len3 = tasks.length; _l < _len3; _l++) {
                task = tasks[_l];
                count += !task.completed;
              }
              break;
            case 'current':
              for (_m = 0, _len4 = tasks.length; _m < _len4; _m++) {
                task = tasks[_m];
                count += !task.completed && this._$tasksmodel.current(task.start);
              }
              break;
            case 'completed':
              for (_n = 0, _len5 = tasks.length; _n < _len5; _n++) {
                task = tasks[_n];
                count += task.completed;
              }
          }
          return count;
        };

        CollectionsModel.prototype.getCountString = function(collectionID) {
          if (collectionID !== 'completed') {
            return this.getCount(collectionID);
          } else {
            return '';
          }
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
    'TasksModel', '_Model', '_EqualQuery', 'Utils', function(TasksModel, _Model, _EqualQuery, Utils) {
      var ListsModel;
      ListsModel = (function(_super) {
        __extends(ListsModel, _super);

        function ListsModel(_$tasksmodel, _utils) {
          this._$tasksmodel = _$tasksmodel;
          this._utils = _utils;
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

        ListsModel.prototype.getCount = function(listID, type) {
          var count, task, tasks, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m;
          count = 0;
          tasks = this._$tasksmodel.getAll();
          switch (type) {
            case 'all':
              for (_i = 0, _len = tasks.length; _i < _len; _i++) {
                task = tasks[_i];
                count += task.calendarid === listID && !task.completed;
              }
              return count;
            case 'current':
              for (_j = 0, _len1 = tasks.length; _j < _len1; _j++) {
                task = tasks[_j];
                count += task.calendarid === listID && !task.completed && this._$tasksmodel.current(task.start);
              }
              return count;
            case 'completed':
              for (_k = 0, _len2 = tasks.length; _k < _len2; _k++) {
                task = tasks[_k];
                count += task.calendarid === listID && task.completed;
              }
              return count;
            case 'starred':
              for (_l = 0, _len3 = tasks.length; _l < _len3; _l++) {
                task = tasks[_l];
                count += task.calendarid === listID && !task.completed && task.starred;
              }
              return count;
            case 'today':
              for (_m = 0, _len4 = tasks.length; _m < _len4; _m++) {
                task = tasks[_m];
                count += task.calendarid === listID && !task.completed && this._$tasksmodel.today(task.due);
              }
              return count;
          }
        };

        return ListsModel;

      })(_Model);
      return new ListsModel(TasksModel, Utils);
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
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  angular.module('Tasks').factory('TasksModel', [
    '_Model', '_EqualQuery', 'Utils', function(_Model, _EqualQuery, Utils) {
      var TasksModel;
      TasksModel = (function(_super) {
        __extends(TasksModel, _super);

        function TasksModel(_utils) {
          this._utils = _utils;
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
          updateByTmpId = angular.isDefined(tmptask) && angular.isUndefined(tmptask.id);
          if (updateById || updateByTmpId) {
            return this.update(task, clearCache);
          } else {
            if (angular.isDefined(task.id)) {
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
          if (angular.isDefined(task.id) && angular.isDefined(tmptask) && angular.isUndefined(tmptask.id)) {
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

        TasksModel.prototype.dayHasEntry = function(date) {
          var diff, due, ret, task, tasks, _i, _len;
          tasks = this.getAll();
          ret = false;
          for (_i = 0, _len = tasks.length; _i < _len; _i++) {
            task = tasks[_i];
            if (task.completed) {
              continue;
            }
            due = moment(task.due, "YYYYMMDDTHHmmss");
            if (due.isValid()) {
              diff = due.diff(moment().startOf('day'), 'days', true);
              if (!date && diff < date + 1) {
                ret = true;
                break;
              } else if (diff < date + 1 && diff >= date) {
                ret = true;
                break;
              }
            }
          }
          return ret;
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

        TasksModel.prototype.current = function(start) {
          return !moment(start, "YYYYMMDDTHHmmss").isValid() || moment(start, "YYYYMMDDTHHmmss").diff(moment(), 'days', true) < 0;
        };

        TasksModel.prototype.changeCalendarId = function(taskID, calendarID) {
          return this.update({
            id: taskID,
            calendarid: calendarID
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
      return new TasksModel(Utils);
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
          this.getTasks(successCallback);
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
          return this._request.get('/apps/tasks_enhanced/collections', params);
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
          return this._request.get('/apps/tasks_enhanced/settings', params);
        };

        Persistence.prototype.setVisibility = function(collectionID, visibility) {
          var params;
          params = {
            routeParams: {
              collectionID: collectionID,
              visibility: visibility
            }
          };
          return this._request.post('/apps/tasks_enhanced/collection/\
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
          return this._request.post('/apps/tasks_enhanced/settings/\
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
          return this._request.get('/apps/tasks_enhanced/lists', params);
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
          return this._request.post('/apps/tasks_enhanced/lists/add', params);
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
          return this._request.post('/apps/tasks_enhanced/lists/{listID}/name', params);
        };

        Persistence.prototype.deleteList = function(listID) {
          var params;
          params = {
            routeParams: {
              listID: listID
            }
          };
          return this._request.post('/apps/tasks_enhanced/lists/{listID}/delete', params);
        };

        Persistence.prototype.getTasks = function(onSuccess, showLoading) {
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
          return this._request.get('/apps/tasks_enhanced/tasks', params);
        };

        Persistence.prototype.starTask = function(taskID) {
          var params;
          params = {
            routeParams: {
              taskID: taskID
            }
          };
          return this._request.post('/apps/tasks_enhanced/tasks/{taskID}/star', params);
        };

        Persistence.prototype.unstarTask = function(taskID) {
          var params;
          params = {
            routeParams: {
              taskID: taskID
            }
          };
          return this._request.post('/apps/tasks_enhanced/tasks/{taskID}/unstar', params);
        };

        Persistence.prototype.completeTask = function(taskID) {
          var params;
          params = {
            routeParams: {
              taskID: taskID
            }
          };
          return this._request.post('/apps/tasks_enhanced/tasks/{taskID}/complete', params);
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
          return this._request.post('/apps/tasks_enhanced/tasks/{taskID}/percentcomplete', params);
        };

        Persistence.prototype.uncompleteTask = function(taskID) {
          var params;
          params = {
            routeParams: {
              taskID: taskID
            }
          };
          return this._request.post('/apps/tasks_enhanced/tasks/{taskID}/uncomplete', params);
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
              calendarID: task.calendarID,
              starred: task.starred,
              due: task.due,
              start: task.start,
              tmpID: task.tmpID
            },
            onSuccess: onSuccess,
            onFailure: onFailure
          };
          return this._request.post('/apps/tasks_enhanced/tasks/add', params);
        };

        Persistence.prototype.deleteTask = function(taskID) {
          var params;
          params = {
            routeParams: {
              taskID: taskID
            }
          };
          return this._request.post('/apps/tasks_enhanced/tasks/{taskID}/delete', params);
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
          return this._request.post('/apps/tasks_enhanced/tasks/{taskID}/due', params);
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
          return this._request.post('/apps/tasks_enhanced/tasks/{taskID}/start', params);
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
          return this._request.post('/apps/tasks_enhanced/tasks/{taskID}/reminder', params);
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
          return this._request.post('/apps/tasks_enhanced/tasks/{taskID}/calendar', params);
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
          return this._request.post('/apps/tasks_enhanced/tasks/{taskID}/name', params);
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
          return this._request.post('/apps/tasks_enhanced/tasks/{taskID}/note', params);
        };

        Persistence.prototype.setShowHidden = function(showHidden) {
          var params;
          params = {
            routeParams: {
              showHidden: +showHidden
            }
          };
          return this._request.post('/apps/tasks_enhanced/settings/showhidden/{showHidden}', params);
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
          return this._request.post('/apps/tasks_enhanced/tasks/{taskID}/comment', params);
        };

        Persistence.prototype.deleteComment = function(taskID, commentID) {
          var params;
          params = {
            routeParams: {
              taskID: taskID,
              commentID: commentID
            }
          };
          return this._request.post('/apps/tasks_enhanced/tasks/{taskID}/comment/\
			{commentID}/delete', params);
        };

        return Persistence;

      })();
      return new Persistence(Request, Loading, $rootScope);
    }
  ]);

}).call(this);

(function() {
  angular.module('Tasks').factory('Request', [
    '_Request', '$http', 'Publisher', 'Router', function(_Request, $http, Publisher, Router) {
      return new _Request($http, Publisher, Router);
    }
  ]);

  angular.module('Tasks').factory('Loading', [
    '_Loading', function(_Loading) {
      return new _Loading();
    }
  ]);

  angular.module('Tasks').factory('Publisher', [
    '_Publisher', 'ListsModel', 'TasksModel', 'CollectionsModel', 'SettingsModel', function(_Publisher, ListsModel, TasksModel, CollectionsModel, SettingsModel) {
      var publisher;
      publisher = new _Publisher();
      publisher.subscribeObjectTo(CollectionsModel, 'collections');
      publisher.subscribeObjectTo(SettingsModel, 'settings');
      publisher.subscribeObjectTo(ListsModel, 'lists');
      publisher.subscribeObjectTo(TasksModel, 'tasks');
      return publisher;
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
            searchActive: false,
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
  angular.module('Tasks').filter('dateDetails', function() {
    return function(due) {
      if (moment(due, "YYYYMMDDTHHmmss").isValid()) {
        return moment(due, "YYYYMMDDTHHmmss").lang('details').calendar();
      } else {
        return t('tasks_enhanced', 'Set due date');
      }
    };
  });

}).call(this);

(function() {
  angular.module('Tasks').filter('dateDetailsShort', function() {
    return function(reminder) {
      if (moment(reminder, "YYYYMMDDTHHmmss").isValid()) {
        return moment(reminder, "YYYYMMDDTHHmmss").lang('details_short').calendar();
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
        return moment(due, "YYYYMMDDTHHmmss").lang('tasks').calendar();
      } else {
        return '';
      }
    };
  });

}).call(this);

(function() {
  angular.module('Tasks').filter('day', function() {
    return function(i) {
      return moment().add('days', i).lang('list_week').calendar();
    };
  });

}).call(this);

(function() {
  angular.module('Tasks').filter('dayHasEntry', function() {
    return function(date) {
      return _$tasksmodel.dayHasEntry(date);
    };
  });

}).call(this);

(function() {
  angular.module('Tasks').filter('dayTaskList', function() {
    return function(due) {
      if (moment(due, "YYYYMMDDTHHmmss").isValid()) {
        return moment(due, "YYYYMMDDTHHmmss").lang('tasks').calendar();
      } else {
        return '';
      }
    };
  });

}).call(this);

(function() {
  angular.module('Tasks').filter('percentDetails', function() {
    return function(percent) {
      return t('tasks_enhanced', '%s % completed').replace('%s', percent);
    };
  });

}).call(this);

(function() {
  angular.module('Tasks').filter('reminderDetails', function() {
    return function(reminder, scope) {
      var ds, time, token, _i, _len, _ref;
      if (!(angular.isUndefined(reminder) || reminder === null)) {
        if (reminder.type === 'DATE-TIME' && moment(reminder.date, "YYYYMMDDTHHmmss").isValid()) {
          return moment(reminder.date, "YYYYMMDDTHHmmss").lang('reminder').calendar();
        } else if (reminder.type === 'DURATION' && reminder.duration) {
          ds = t('tasks_enhanced', 'Remind me');
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
              ds += ' ' + t('tasks_enhanced', 'at the end');
            } else {
              ds += ' ' + t('tasks_enhanced', 'at the beginning');
            }
          } else {
            if (reminder.duration.params.invert) {
              if (reminder.duration.params.related === 'END') {
                ds += ' ' + t('tasks_enhanced', 'before end');
              } else {
                ds += ' ' + t('tasks_enhanced', 'before beginning');
              }
            } else {
              if (reminder.duration.params.related === 'END') {
                ds += ' ' + t('tasks_enhanced', 'after end');
              } else {
                ds += ' ' + t('tasks_enhanced', 'after beginning');
              }
            }
          }
          return ds;
        } else {
          return t('tasks_enhanced', 'Remind me');
        }
      } else {
        return t('tasks_enhanced', 'Remind me');
      }
    };
  });

}).call(this);

(function() {
  angular.module('Tasks').filter('startDetails', function() {
    return function(due) {
      if (moment(due, "YYYYMMDDTHHmmss").isValid()) {
        return moment(due, "YYYYMMDDTHHmmss").lang('start').calendar();
      } else {
        return t('tasks_enhanced', 'Set start date');
      }
    };
  });

}).call(this);

(function() {
  angular.module('Tasks').filter('taskAtDay', function() {
    return function(tasks, date) {
      var diff, due, ret, task, _i, _len;
      ret = [];
      for (_i = 0, _len = tasks.length; _i < _len; _i++) {
        task = tasks[_i];
        due = moment(task.due, "YYYYMMDDTHHmmss");
        if (due.isValid()) {
          diff = due.diff(moment().startOf('day'), 'days', true);
          if (!date && diff < date + 1) {
            ret.push(task);
          } else if (diff < date + 1 && diff >= date) {
            ret.push(task);
          }
        }
      }
      return ret;
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
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
		.when('/search/:searchString/tasks/:taskID/edit/:parameter', {});
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

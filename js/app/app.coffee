###

ownCloud - Tasks

@author Raimund Schlüßler
@copyright 2013

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
License as published by the Free Software Foundation; either
version 3 of the License, or any later version.

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU AFFERO GENERAL PUBLIC LICENSE for more details.

You should have received a copy of the GNU Affero General Public
License along with this library.  If not, see <http://www.gnu.org/licenses/>.

###
angular.module('Tasks',['OC','ngRoute','ngAnimate','ui.bootstrap','ui.select',
	'ngSanitize', 'dndLists'])
.config ['$provide','$routeProvider', '$interpolateProvider',
($provide, $routeProvider, $interpolateProvider) ->
	$provide.value 'Config', config =
		markReadTimeout: 500
		taskUpdateInterval: 1000*600

	$routeProvider
	.when('/lists/:listID',{})
	.when('/lists/:listID/edit/:listparameter',{})
	.when('/lists/:listID/tasks/:taskID',{})
	.when('/lists/:listID/tasks/:taskID/settings',{})
	.when('/lists/:listID/tasks/:taskID/edit/:parameter',{})
	.when('/search/:searchString',{})
	.when('/search/:searchString/tasks/:taskID',{})
	.when('/search/:searchString/tasks/:taskID/edit/:parameter',{})
	.otherwise({
		redirectTo: '/lists/all'
	})

	return
]

angular.module('Tasks').run ['$document', '$rootScope', 'Config', '$timeout',
'ListsBusinessLayer', 'TasksBusinessLayer', 'SearchBusinessLayer'
($document, $rootScope, Config, $timeout,TasksBusinessLayer,
	ListsBusinessLayer, SearchBusinessLayer) ->

	init = false
	do update = ->
		timeOutUpdate = ->
			$timeout update, Config.taskUpdateInterval
		if init
			# CollectionsBusinessLayer.updateModel()
			ListsBusinessLayer.updateModel()
			TasksBusinessLayer.updateModel()
		init = true
		timeOutUpdate()

	OCA.Search.tasks = SearchBusinessLayer

	$document.click (event) ->
		$rootScope.$broadcast 'documentClicked', event
		return

	moment.locale('details', {
		calendar: {
			lastDay  : 	'['+t('tasks','Due yesterday')+'], HH:mm'
			sameDay  : 	'['+t('tasks','Due today')+'], HH:mm'
			nextDay  : 	'['+t('tasks','Due tomorrow')+'], HH:mm'
			lastWeek : 	'['+t('tasks', 'Due on')+'] MMM DD, YYYY, HH:mm'
			nextWeek : 	'['+t('tasks', 'Due on')+'] MMM DD, YYYY, HH:mm'
			sameElse :	'['+t('tasks', 'Due on')+'] MMM DD, YYYY, HH:mm'
		}
	})
	moment.locale('start', {
		calendar: {
			lastDay  : 	'['+t('tasks','Started yesterday')+'], HH:mm'
			sameDay  : 	'['+t('tasks','Starts today')+'], HH:mm'
			nextDay  : 	'['+t('tasks','Starts tomorrow')+'], HH:mm'
			lastWeek : 	'['+t('tasks', 'Started on')+'] MMM DD, YYYY, HH:mm'
			nextWeek : 	'['+t('tasks', 'Starts on')+'] MMM DD, YYYY, HH:mm'
			sameElse :	() ->
				if this.diff(moment()) > 0
					'['+t('tasks', 'Starts on')+'] MMM DD, YYYY, HH:mm'
				else
					'['+t('tasks', 'Started on')+'] MMM DD, YYYY, HH:mm'
		}
	})
	moment.locale('reminder', {
		calendar: {
			lastDay  : 	t('tasks', '[Remind me yesterday at ]HH:mm')
			sameDay  : 	t('tasks', '[Remind me today at ]HH:mm')
			nextDay  : 	t('tasks', '[Remind me tomorrow at ]HH:mm')
			lastWeek : 	t('tasks', '[Remind me on ]MMM DD, YYYY,[ at ]HH:mm')
			nextWeek : 	t('tasks', '[Remind me on ]MMM DD, YYYY,[ at ]HH:mm')
			sameElse :	t('tasks', '[Remind me on ]MMM DD, YYYY,[ at ]HH:mm')
		}
	})
	moment.locale('tasks', {
		calendar: {
			lastDay : '['+t('tasks','Yesterday')+']'
			sameDay : '['+t('tasks','Today')+']'
			nextDay : '['+t('tasks','Tomorrow')+']'
			lastWeek : 'DD.MM.YYYY'
			nextWeek : 'DD.MM.YYYY'
			sameElse : 'DD.MM.YYYY'
		}
	})
	moment.locale('details_short', {
		calendar: {
			lastDay : '['+t('tasks','Yesterday')+']'
			sameDay : '['+t('tasks','Today')+']'
			nextDay : '['+t('tasks','Tomorrow')+']'
			lastWeek : 'MMM DD, YYYY'
			nextWeek : 'MMM DD, YYYY'
			sameElse : 'MMM DD, YYYY'
		}
	})
	moment.locale('list_week', {
		calendar: {
			lastDay  : '['+t('tasks','Yesterday')+']'
			sameDay  : '['+t('tasks','Today')+'], MMM. DD'
			nextDay  : '['+t('tasks','Tomorrow')+'], MMM. DD'
			lastWeek : 'ddd, MMM. DD'
			nextWeek : 'ddd, MMM. DD'
			sameElse : 'ddd, MMM. DD'
		}
	})
	moment.locale('en', {
		relativeTime: {
			future:	t('tasks', "in %s")
			past:	t('tasks', "%s ago")
			s:		t('tasks', "seconds")
			m:		t('tasks', "a minute")
			mm:		t('tasks', "%d minutes")
			h:		t('tasks', "an hour")
			hh:		t('tasks', "%d hours")
			d:		t('tasks', "a day")
			dd:		t('tasks', "%d days")
			M:		t('tasks', "a month")
			MM:		t('tasks', "%d months")
			y:		t('tasks', "a year")
			yy:		t('tasks', "%d years")
		}
	})
]

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
angular.module('Tasks',['OC','ngRoute','ngAnimate'])
.config ['$provide','$routeProvider', '$interpolateProvider',
($provide, $routeProvider, $interpolateProvider) ->
	$provide.value 'Config', config =
		markReadTimeout: 500
		taskUpdateInterval: 1000*600

	$routeProvider
	.when('/lists/:listID',{})
	.when('/lists/:listID/edit/:listparameter',{})
	.when('/lists/:listID/tasks/:taskID',{})
	.when('/lists/:listID/tasks/:taskID/edit/:parameter',{})
	.when('/search/:searchString',{})
	.when('/search/:searchString/tasks/:taskID',{})
	.when('/search/:searchString/tasks/:taskID/edit/:parameter',{})
	.otherwise({
		redirectTo: '/lists/all'
	})

	###
	overwrite angular's directive ngSwitchWhen
   	to handle ng-switch-when="value1 || value2 || value3
   	see
	http://docs.angularjs.org/api/ng.directive:ngSwitch
	###
	$provide.decorator 'ngSwitchWhenDirective', ($delegate) ->
		$delegate[0].compile = (element, attrs, transclude) ->
			return (scope, element, attr, ctrl) ->
				subCases = [attrs.ngSwitchWhen]
				if(attrs.ngSwitchWhen && attrs.ngSwitchWhen.length > 0 &&
				attrs.ngSwitchWhen.indexOf('||') != -1)
					subCases = attrs.ngSwitchWhen.split('||')
				i = 0
				len = subCases.length
				while(i<len)
			        casee = $.trim(subCases[i++])
			        ctrl.cases['!' + casee] = (ctrl.cases['!' + casee] || [])
			        ctrl.cases['!' + casee]
			        .push({ transclude: transclude, element: element })
		return $delegate
	return
]

angular.module('Tasks').run ['Config', '$timeout',
'ListsBusinessLayer', 'TasksBusinessLayer',
(Config, $timeout,TasksBusinessLayer, ListsBusinessLayer) ->

	init = false
	do update = ->
		timeOutUpdate = ->
			$timeout update, Config.taskUpdateInterval
		if init
			ListsBusinessLayer.updateModel()
			TasksBusinessLayer.updateModel()
		init = true
		timeOutUpdate()

	moment.lang('details', {
		calendar: {
			lastDay  : 	'['+t('tasks_enhanced','Due Yesterday')+'], HH:mm'
			sameDay  : 	'['+t('tasks_enhanced','Due Today')+'], HH:mm'
			nextDay  : 	'['+t('tasks_enhanced','Due Tomorrow')+'], HH:mm'
			lastWeek : 	'['+t('tasks_enhanced', 'Due on')+'] MMM DD, YYYY, HH:mm'
			nextWeek : 	'['+t('tasks_enhanced', 'Due on')+'] MMM DD, YYYY, HH:mm'
			sameElse :	'['+t('tasks_enhanced', 'Due on')+'] MMM DD, YYYY, HH:mm'
		}
	})
	moment.lang('start', {
		calendar: {
			lastDay  : 	'['+t('tasks_enhanced','Started Yesterday')+'], HH:mm'
			sameDay  : 	'['+t('tasks_enhanced','Starts Today')+'], HH:mm'
			nextDay  : 	'['+t('tasks_enhanced','Starts Tomorrow')+'], HH:mm'
			lastWeek : 	'['+t('tasks_enhanced', 'Started on')+'] MMM DD, YYYY, HH:mm'
			nextWeek : 	'['+t('tasks_enhanced', 'Starts on')+'] MMM DD, YYYY, HH:mm'
			sameElse :	() ->
				if this.diff(moment()) > 0
					'['+t('tasks_enhanced', 'Starts on')+'] MMM DD, YYYY, HH:mm'
				else
					'['+t('tasks_enhanced', 'Started on')+'] MMM DD, YYYY, HH:mm'
		}
	})
	moment.lang('tasks', {
		calendar: {
			lastDay : '['+t('tasks_enhanced','Yesterday')+']'
			sameDay : '['+t('tasks_enhanced','Today')+']'
			nextDay : '['+t('tasks_enhanced','Tomorrow')+']'
			lastWeek : 'DD.MM.YYYY'
			nextWeek : 'DD.MM.YYYY'
			sameElse : 'DD.MM.YYYY'
		}
	})
	moment.lang('details_short', {
		calendar: {
			lastDay : '['+t('tasks_enhanced','Yesterday')+']'
			sameDay : '['+t('tasks_enhanced','Today')+']'
			nextDay : '['+t('tasks_enhanced','Tomorrow')+']'
			lastWeek : 'MMM DD, YYYY'
			nextWeek : 'MMM DD, YYYY'
			sameElse : 'MMM DD, YYYY'
		}
	})
	moment.lang('list_week', {
		calendar: {
			lastDay  : '['+t('tasks_enhanced','Yesterday')+']'
			sameDay  : '['+t('tasks_enhanced','Today')+'], MMM. DD'
			nextDay  : '['+t('tasks_enhanced','Tomorrow')+'], MMM. DD'
			lastWeek : 'ddd, MMM. DD'
			nextWeek : 'ddd, MMM. DD'
			sameElse : 'ddd, MMM. DD'
		}
	})
]
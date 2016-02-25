###

ownCloud - News

@author Alessandro Cosentino
@copyright 2013 Alessandro Cosentino cosenal@gmail.com

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


angular.module('Tasks').controller 'AppController',
['$scope', 'ListsBusinessLayer', '$route', 'Status', '$timeout',
'$location', '$routeParams', 'Loading', 'SettingsModel', 'Persistence',
($scope, ListsBusinessLayer, $route, status, $timeout, $location,
$routeParams, Loading, SettingsModel, Persistence) ->

	class AppController

		constructor: (@_$scope, @_$listsbusinesslayer, @_$route, @_$status,
			@_$timeout, @_$location, @_$routeparams, @_Loading,
			@_$settingsmodel, @_persistence) ->

			@_$scope.initialized = false

			@_$scope.status = @_$status.getStatus()

			@_$scope.route = @_$routeparams

			@_$scope.status.newListName = ""

			@_$scope.settingsmodel = @_$settingsmodel

			@_persistence.init()

			# successCallback = =>
			# 	@_$scope.initialized = true
			# 	@_$scope.$apply()
			# 	console.log('initialized')

			# @_$listsbusinesslayer.init().then((calendars) ->
			# 	$scope.calendars = calendars
			# 	console.log($scope.calendars)
			# 	$scope.$apply()
			# 	)
			# console.log($scope.calendars)

			@_$scope.closeAll = ($event) ->
				if $($event.target).closest('.close-all').length ||
				$($event.currentTarget).is($($event.target).closest('.handler'))
					_$location.path('/lists/'+_$scope.route.listID)
					_$scope.status.addingList = false
					_$scope.status.focusTaskInput = false
					_$scope.status.newListName = ""
				if !$($event.target).closest('.newList').length
					_$scope.status.addingList = false
					_$scope.status.newListName = ""
				if !$($event.target).closest('.add-subtask').length
					_$scope.status.addSubtaskTo = ''
					_$scope.status.focusSubtaskInput = false
				else
					return

			@_$scope.isLoading = () ->
				return _Loading.isLoading()

	return new AppController($scope, ListsBusinessLayer, $route, status, $timeout,
	$location, $routeParams, Loading, SettingsModel, Persistence)

]

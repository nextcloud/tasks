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
angular.module('Tasks').controller 'SearchController',
['$scope', '$window', 'Status', '$location',
($scope, $window, Status, $location) ->

	class SearchController

		constructor: (@_$scope, @_$window, @_$status,
		@_$location) ->
			@_$scope.searchString = ''
			@_$scope.searchBuffer = '/lists/all'

			@_$scope.status = @_$status.getStatus()

			@_$scope.$on('$routeChangeSuccess', () ->
				if _$scope.route.searchString != undefined
					_$scope.status.searchActive = true
			)

			@_$scope.openSearch = () =>
				_$scope.searchBuffer = _$location.path()
				_$location.path('/search/')
				_$scope.status.searchActive = true

			@_$scope.closeSearch = () =>
				_$scope.searchString = ''
				_$location.path(_$scope.searchBuffer)
				_$scope.status.searchActive = false

			@_$scope.trySearch = (event) =>
				if (event.keyCode == 27)
					_$scope.closeSearch()
				else
					_$location.path('/search/'+_$scope.searchString)


	return new SearchController($scope, $window, Status, $location)
]
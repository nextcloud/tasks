###

ownCloud - Music

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

angular.module('Tasks').directive 'tabs', ->
    directive =
        restrict: 'E',
        scope: {},
        controller: ($scope, $element) ->
        	panes = $scope.panes = []
        	$scope.select = (pane) ->
        		angular.forEach(panes, (pane) ->
        			pane.selected = false
        			)
        		pane.selected = true
        	this.addPane = (pane) ->
        		$scope.select(pane) if (panes.length == 0)
        		panes.push(pane)
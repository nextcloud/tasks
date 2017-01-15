/**
 * Nextcloud - Tasks
 *
 * @author Raimund Schlüßler
 * @copyright 2017 Raimund Schlüßler <raimund.schluessler@googlemail.com>
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

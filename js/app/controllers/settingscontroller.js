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
                this._$scope.parsingOptions = [
                    {
                        id: 0,
                        name: 'yes'
                    }, {
                        id: 1,
                        name: 'no'
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

                this._$scope.setOpenTaskParsing = function() {
                    return _$settingsbusinesslayer.set('various', 'openTaskParsing', _$settingsmodel.getById('various').parsingOptions);
                };
			}

			return SettingsController;

		})();
		return new SettingsController($scope, $window, Status, $location, CollectionsModel, SettingsBusinessLayer, SettingsModel);
	}
]);

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
angular.module('Tasks').controller 'SettingsController',
['$scope', '$window', 'Status', '$location','$modalInstance',
'CollectionsModel', 'SettingsBusinessLayer', 'SettingsModel'
($scope, $window, Status, $location, $modalInstance,CollectionsModel,
	SettingsBusinessLayer, SettingsModel) ->

	class SettingsController

		constructor: (@_$scope, @_$window, @_$status,
		@_$location, @_$modalInstance, @_$collectionsmodel,
		@_$settingsbusinesslayer, @_$settingsmodel) ->

			@_$scope.status = @_$status.getStatus()

			@_$scope.collections = @_$collectionsmodel.getAll()

			@_$scope.settingsmodel = @_$settingsmodel

			@_$scope.collectionOptions = [
				{
					id: 0,
					name: t('tasks','Hidden')},
				{
					id: 1,
					name: t('tasks','Visible')},
				{
					id: 2,
					name: t('tasks','Automatic')}
			]

			@_$scope.startOfWeekOptions = [
				{
					id: 0,
					name: t('tasks','Sunday')},
				{
					id: 1,
					name: t('tasks','Monday')},
				{
					id: 2,
					name: t('tasks','Tuesday')},
				{
					id: 3,
					name: t('tasks','Wednesday')},
				{
					id: 4,
					name: t('tasks','Thursday')},
				{
					id: 5,
					name: t('tasks','Friday')},
				{
					id: 6,
					name: t('tasks','Saturday')}
			]

			@_$scope.ok = () =>
				$modalInstance.close()

			@_$scope.setVisibility = (collectionID) =>
				collection = _$collectionsmodel.getById(collectionID)
				_$settingsbusinesslayer.setVisibility(collectionID,collection.show)

			@_$scope.setStartOfWeek = () =>
				_$settingsbusinesslayer.set('various','startOfWeek',
				_$settingsmodel.getById('various').startOfWeek)


	return new SettingsController($scope, $window, Status, $location,
		$modalInstance, CollectionsModel, SettingsBusinessLayer,
		SettingsModel)
]
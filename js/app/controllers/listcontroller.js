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

angular.module('Tasks').controller('ListController', [
	'$scope', '$window', '$routeParams', 'ListsModel', 'TasksBusinessLayer', 'CollectionsModel', 'ListsBusinessLayer', '$location',
	'SearchBusinessLayer', 'CalendarService', 'TasksModel',
	function($scope, $window, $routeParams, ListsModel, TasksBusinessLayer, CollectionsModel, ListsBusinessLayer, $location,
		SearchBusinessLayer, CalendarService, TasksModel) {
		'use strict';
	  var ListController;
	  ListController = (function() {
		function ListController(_$scope, _$window, _$routeParams, _$listsmodel, _$tasksbusinesslayer, _$collectionsmodel, _$listsbusinesslayer, $location,
		_$searchbusinesslayer, _$calendarservice, _$tasksmodel) {
		
			this._$scope = _$scope;
			this._$window = _$window;
			this._$routeParams = _$routeParams;
			this._$listsmodel = _$listsmodel;
			this._$tasksmodel = _$tasksmodel;
			this._$tasksbusinesslayer = _$tasksbusinesslayer;
			this._$collectionsmodel = _$collectionsmodel;
			this._$listsbusinesslayer = _$listsbusinesslayer;
			this.$location = $location;
			this._$searchbusinesslayer = _$searchbusinesslayer;
			this._$calendarservice = _$calendarservice;
			this._$scope.collections = this._$collectionsmodel.getAll();
			this._$scope.calendars = this._$listsmodel.getAll();
			this._$scope.draggedTasks = [];
			this._$scope.TasksBusinessLayer = this._$tasksbusinesslayer;

			this._$scope["delete"] = function(calendar) {
				var really;
				really = confirm(t('tasks', 'This will delete the Calendar "%s" and all of its entries.').replace('%s', calendar.displayname));
				if (really) {
					return _$listsbusinesslayer["delete"](calendar).then(function() {
						$location.path('/calendars/' + _$listsmodel.getStandardList().uri);
						return $scope.$apply();
					});
				}
			};

			this._$scope.startCreate = function() {
				_$scope.status.addingList = true;
			};

			this._$scope.cancelCreate = function(event) {
				if (event.keyCode === 27) {
					_$scope.status.addingList = false;
					_$scope.status.newListName = "";
				}
			};

			this._$scope.create = function() {
				if (_$scope.status.newListName) {
					if (!_$listsmodel.isNameAlreadyTaken(_$scope.status.newListName)) {
						_$scope.status.addingList = false;
						_$scope.isAddingList = true;
						_$listsbusinesslayer.add(_$scope.status.newListName).then(function(calendar) {
							$location.path('/calendars/' + calendar.uri);
							return $scope.$apply();
						});
						_$scope.status.newListName = '';
					} else {
						alert(t('tasks', 'The name "%s" is already used.').replace('%s', _$scope.status.newListName));
				 	}
				} else {
					alert(t('tasks', 'An empty name is not allowed.'));
				}
			};

			this._$scope.startRename = function(calendar) {
				_$scope.status.addingList = false;
				calendar.prepareUpdate();
				return $location.path('/calendars/' + _$scope.route.calendarID + '/edit/name');
			};

			this._$scope.cancelRename = function(event,calendar) {
				if (event.keyCode === 27) {
					event.preventDefault();
					calendar.resetToPreviousState();
					$location.path('/calendars/' + _$scope.route.calendarID);
				}
			};

			this._$scope.rename = function(calendar) {
				var name = calendar.displayname;
				if (name) {
					if (!_$listsmodel.isNameAlreadyTaken(calendar.displayname, calendar.uri)) {
						_$listsbusinesslayer.rename(calendar);
						$location.path('/calendars/' + _$scope.route.calendarID);
					} else {
						return alert(t('tasks', 'The name "%s" is already used.').replace('%s', name));
					}
				} else {
					return alert(t('tasks', 'An empty name is not allowed.'));
				}
			};

			this._$scope.getCollectionCount = function(collectionID) {
				var filter;
				filter = _$searchbusinesslayer.getFilter();
				return _$collectionsmodel.getCount(collectionID, filter);
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
				var filter;
				if (collectionID !== 'completed') {
					filter = _$searchbusinesslayer.getFilter();
					return _$collectionsmodel.getCount(collectionID, filter);
				} else {
					return '';
				}
			};

			this._$scope.getListCount = function(listID, type) {
				var filter;
				filter = _$searchbusinesslayer.getFilter();
				return _$listsmodel.getCount(listID, type, filter);
			};

			this._$scope.dragoverList = function($event, item, index) {
				var calendarID = $($event.target).closest('li.list').attr('calendarID');
				var calendar = _$listsmodel.getByUri(calendarID);
				return calendar.writable;
			};

			this._$scope.dropList = function($event, item, index) {
				// we can't simply use item as task, since the directive seems to not copy all properties --> task.calendar.uri == undefined
				var task = _$tasksmodel.getByUri(item.uri);
				var calendarID = $($event.target).closest('li.list').attr('calendarID');
				var calendar = _$listsmodel.getByUri(calendarID);
				_$tasksbusinesslayer.changeCalendar(task, calendar).then(function() {
					_$scope.$apply();
				});
				return true;
			};

			this._$scope.dragoverCollection = function($event, item, index) {
				var collectionID;
				collectionID = $($event.target).closest('li.collection').attr('collectionID');
				return collectionID === 'starred' || collectionID === 'completed' || collectionID === 'today';
			};

			this._$scope.dropCollection = function($event, item, index) {
				var collectionID = $($event.target).closest('li.collection').attr('collectionID');
				_$tasksbusinesslayer.changeCollection(item.uri, collectionID);
				return true;
			};
		}

		return ListController;

	  })();
	  return new ListController($scope, $window, $routeParams, ListsModel, TasksBusinessLayer, CollectionsModel, ListsBusinessLayer, $location,
	  	SearchBusinessLayer, CalendarService, TasksModel);
	}
]);

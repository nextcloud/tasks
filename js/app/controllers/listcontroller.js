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
	'$scope', '$rootScope', '$window', '$routeParams', 'ListsModel', 'TasksBusinessLayer', 'CollectionsModel', 'ListsBusinessLayer', '$location',
	'SearchBusinessLayer', 'CalendarService', 'TasksModel', '$timeout',
	function($scope, $rootScope, $window, $routeParams, ListsModel, TasksBusinessLayer, CollectionsModel, ListsBusinessLayer, $location,
		SearchBusinessLayer, CalendarService, TasksModel, $timeout) {
		'use strict';
	  var ListController;
	  ListController = (function() {
		function ListController(_$scope, $rootScope, _$window, _$routeParams, _$listsmodel, _$tasksbusinesslayer, _$collectionsmodel, _$listsbusinesslayer, $location,
		_$searchbusinesslayer, _$calendarservice, _$tasksmodel, _$timeout) {

			this._$scope = _$scope;
			this._$window = _$window;
			this._$routeParams = _$routeParams;
			this._$listsmodel = _$listsmodel;
			this._$tasksmodel = _$tasksmodel;
			this._$tasksbusinesslayer = _$tasksbusinesslayer;
			this._$collectionsmodel = _$collectionsmodel;
			this._$listsbusinesslayer = _$listsbusinesslayer;
			this.$location = $location;
			this._$timeout = _$timeout;
			this._$searchbusinesslayer = _$searchbusinesslayer;
			this._$calendarservice = _$calendarservice;
			this._$scope.collections = this._$collectionsmodel.getAll();
			this._$scope.calendars = this._$listsmodel.getAll();
			this._$scope.draggedTasks = [];
			this._$scope.TasksBusinessLayer = this._$tasksbusinesslayer;
			this._$scope.nameError = false;
			this._$scope.color = '#31CC7C';

			this._$scope.deleteMessage = function (calendar) {
				return t('tasks', 'This will delete the Calendar "%s" and all of its entries.').replace('%s', calendar.displayname);
			};

			this._$scope["delete"] = function(calendar) {
				return _$listsbusinesslayer["delete"](calendar).then(function() {
					$location.path('/calendars/' + _$listsmodel.getStandardList().uri);
					return $scope.$apply();
				});
			};

			this._$scope.startCreate = function() {
				_$scope.status.addingList = true;
				_$scope.nameError = false;
				$('.hasTooltip').tooltip('hide');
				_$timeout(function() {
					$('#newList').focus();
				}, 50);
			};

			this._$scope.create = function() {
				var check = _$scope.isNameAllowed(_$scope.status.newListName);
				if (check.allowed) {
					_$scope.status.addingList = false;
					_$scope.isAddingList = true;
					_$listsbusinesslayer.add(_$scope.status.newListName, _$scope.color).then(function(calendar) {
						$location.path('/calendars/' + calendar.uri);
						return $scope.$apply();
					});
					_$scope.status.newListName = '';
				}
			};

			this._$scope.cancelCreate = function() {
					$('.hasTooltip').tooltip('hide');
					_$scope.nameError = false;
					_$scope.status.addingList = false;
					_$scope.status.newListName = "";
			};

			this._$scope.startEdit = function(calendar) {
				_$scope.status.addingList = false;
				_$scope.nameError = false;
				$('.hasTooltip').tooltip('hide');
				calendar.prepareUpdate();
				$location.path('/calendars/' + _$scope.route.calendarID + '/edit/name');
				_$timeout(function() {
					$('#list_' + calendar.uri + ' input.edit').focus();
				}, 50);
			};

			this._$scope.showCalDAVUrl = function(calendar) {
				_$scope.status.addingList = false;
				_$scope.nameError = false;
				$location.path('/calendars/' + _$scope.route.calendarID + '/edit/caldav');
				_$timeout(function() {
					$('#list_' + calendar.uri + ' input.caldav').focus();
				}, 50);
			};

			this._$scope.hideCalDAVUrl = function() {
				$location.path('/calendars/' + _$scope.route.calendarID);
			};

			this._$scope.download = function (calendar) {
				var url = calendar.url;
				// cut off last slash to have a fancy name for the ics
				if (url.slice(url.length - 1) === '/') {
					url = url.slice(0, url.length - 1);
				}
				url += '?export';
				$window.open(url);
			};

			this._$scope.checkNew = function(event,name) {
				_$scope.checkName(event,name);
			};

			this._$scope.checkEdit = function(event,calendar) {
				_$scope.checkName(event,calendar.displayname,calendar.uri);
				if (event.keyCode === 27) {
					_$scope.cancelEdit(calendar);
				}
			};

			this._$scope.checkName = function(event,name,uri) {
				var check = _$scope.isNameAllowed(name,uri);
				var $input = $(event.currentTarget);
				if (!check.allowed) {
					$input.attr('title', check.msg)
						.tooltip({placement: 'bottom', trigger: 'manual'})
						.tooltip('fixTitle').tooltip('show');
					_$scope.nameError = true;
				} else {
					$input.tooltip('hide');
					_$scope.nameError = false;
				}
				if (event.keyCode === 27) {
					event.preventDefault();
					$input.tooltip('hide');
					_$scope.status.addingList = false;
					_$scope.status.newListName = "";
					_$scope.nameError = false;
				}
			};

			$rootScope.$on('cancelEditCalendar', function(s, calendarUri) {
				var calendar = _$listsmodel.getByUri(calendarUri);
				_$scope.cancelEdit(calendar);
			});

			this._$scope.cancelEdit = function(calendar) {
				calendar.resetToPreviousState();
				$('.hasTooltip').tooltip('hide');
				_$scope.nameError = false;
				$location.path('/calendars/' + _$scope.route.calendarID);
			};

			this._$scope.saveEdit = function(calendar) {
				var check = _$scope.isNameAllowed(calendar.displayname, calendar.uri);
				if (check.allowed) {
					_$listsbusinesslayer.rename(calendar);
					$location.path('/calendars/' + _$scope.route.calendarID);
				}
			};

			this._$scope.isNameAllowed = function(name, uri) {
				var check = {
					allowed:	false,
					msg:		''
				};
				if (_$listsmodel.isNameAlreadyTaken(name, uri)) {
					check.msg = t('tasks', 'The name "%s" is already used.').replace('%s', name);
				} else if (!name) {
					check.msg = t('tasks', 'An empty name is not allowed.');
				} else {
					check.allowed = true;
				}
				return check;
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

			this._$scope.dragoverList = function($event, index) {
				var calendarID = $($event.target).closest('li.list').attr('calendarID');
				var calendar = _$listsmodel.getByUri(calendarID);
				return calendar.writable;
			};

			this._$scope.dropList = function($event, index, item) {
				if ($event.dataTransfer.dropEffect === 'move') {
					// we can't simply use item as task, since the directive seems to not copy all properties --> task.calendar.uri == undefined
					var task = _$tasksmodel.getByUri(item.uri);
					var calendarID = $($event.target).closest('li.list').attr('calendarID');
					var calendar = _$listsmodel.getByUri(calendarID);
					_$tasksbusinesslayer.changeCalendar(task, calendar).then(function() {
						_$scope.$apply();
					});
				}
				return true;
			};

			this._$scope.dragoverCollection = function($event, index) {
				if ($event.dataTransfer.effectAllowed === 'copy' || ($event.dataTransfer.effectAllowed === 'copyMove' && $event.ctrlKey)) {
					return false;
				}
				var collectionID;
				collectionID = $($event.target).closest('li.collection').attr('collectionID');
				return collectionID === 'starred' || collectionID === 'completed' || collectionID === 'today';
			};

			this._$scope.dropCollection = function($event, index, item) {
				if ($event.dataTransfer.dropEffect === 'move') {
					var collectionID = $($event.target).closest('li.collection').attr('collectionID');
					_$tasksbusinesslayer.changeCollection(item.uri, collectionID);
				}
				return true;
			};
		}

		return ListController;

	  })();
	  return new ListController($scope, $rootScope, $window, $routeParams, ListsModel, TasksBusinessLayer, CollectionsModel, ListsBusinessLayer, $location,
	  	SearchBusinessLayer, CalendarService, TasksModel, $timeout);
	}
]);

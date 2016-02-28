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

(function() {
  angular.module('Tasks').factory('ListsBusinessLayer', [
	'ListsModel', 'Persistence', 'TasksBusinessLayer', 'CalendarService', function(ListsModel, Persistence, TasksBusinessLayer, CalendarService) {
	  var ListsBusinessLayer;
	  ListsBusinessLayer = (function() {
		function ListsBusinessLayer(_$listsmodel, _persistence, _$tasksbusinesslayer, _$calendarservice) {
		  this._$listsmodel = _$listsmodel;
		  this._persistence = _persistence;
		  this._$tasksbusinesslayer = _$tasksbusinesslayer;
		  this._$calendarservice = _$calendarservice;
		}

		ListsBusinessLayer.prototype.init = function() {
		  return this._$calendarservice.getAll().then(function(calendars) {
			var calendar, _i, _len, _results;
			_results = [];
			for (_i = 0, _len = calendars.length; _i < _len; _i++) {
			  calendar = calendars[_i];
			  _results.push(ListsModel.add(calendar));
			}
			return _results;
		  });
		};

		ListsBusinessLayer.prototype.add = function(calendar, onSuccess, onFailure) {
		  if (onSuccess == null) {
			onSuccess = null;
		  }
		  if (onFailure == null) {
			onFailure = null;
		  }
		  return this._$calendarservice.create(calendar, '#FF7A66', ['vtodo']).then(function(calendar) {
			ListsModel.add(calendar);
			return calendar;
		  });
		};

		ListsBusinessLayer.prototype["delete"] = function(calendar) {
		  return this._$calendarservice["delete"](calendar).then(function() {
			return ListsModel["delete"](calendar);
		  });
		};

		ListsBusinessLayer.prototype.rename = function(calendar) {
			this._$calendarservice.update(calendar).then(function(calendar) {
				calendar.dropPreviousState();
			});
		};

		return ListsBusinessLayer;

	  })();
	  return new ListsBusinessLayer(ListsModel, Persistence, TasksBusinessLayer, CalendarService);
	}
  ]);

}).call(this);

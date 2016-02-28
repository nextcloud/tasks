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
  var __hasProp = {}.hasOwnProperty,
	__extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  angular.module('Tasks').factory('CollectionsModel', [
	'TasksModel', '_Model', function(TasksModel, _Model) {
	  var CollectionsModel;
	  CollectionsModel = (function(_super) {
		__extends(CollectionsModel, _super);

		function CollectionsModel(_$tasksmodel) {
		  this._$tasksmodel = _$tasksmodel;
		  this._nameCache = {};
		  CollectionsModel.__super__.constructor.call(this);
		}

		CollectionsModel.prototype.add = function(data, clearCache) {
		  if (clearCache == null) {
			clearCache = true;
		  }
		  this._nameCache[data.displayname] = data;
		  if (angular.isDefined(data.id)) {
			return CollectionsModel.__super__.add.call(this, data, clearCache);
		  }
		};

		CollectionsModel.prototype.getCount = function(collectionID, filter) {
		  var count, task, tasks, _i, _len;
		  if (filter == null) {
			filter = '';
		  }
		  count = 0;
		  tasks = this._$tasksmodel.filteredTasks(filter);
		  for (_i = 0, _len = tasks.length; _i < _len; _i++) {
			task = tasks[_i];
			count += this._$tasksmodel.filterTasks(task, collectionID) && !task.related;
		  }
		  return count;
		};

		return CollectionsModel;

	  })(_Model);
	  return new CollectionsModel(TasksModel);
	}
  ]);

}).call(this);

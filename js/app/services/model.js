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
  angular.module('Tasks').factory('_Model', [
	function() {
	  var Model;
	  Model = (function() {
		function Model() {
		  this._data = [];
		  this._dataMap = {};
		  this._filterCache = {};
		}

		Model.prototype.handle = function(data) {
		  var item, _i, _len, _results;
		  _results = [];
		  for (_i = 0, _len = data.length; _i < _len; _i++) {
			item = data[_i];
			_results.push(this.add(item));
		  }
		  return _results;
		};

		Model.prototype.add = function(data, clearCache) {
		  if (clearCache == null) {
			clearCache = true;
		  }
		  if (clearCache) {
			this._invalidateCache();
		  }
		  if (angular.isDefined(this._dataMap[data.id])) {
			return this.update(data, clearCache);
		  } else {
			this._data.push(data);
			return this._dataMap[data.id] = data;
		  }
		};

		Model.prototype.update = function(data, clearCache) {
		  var entry, key, value, _results;
		  if (clearCache == null) {
			clearCache = true;
		  }
		  if (clearCache) {
			this._invalidateCache();
		  }
		  entry = this.getById(data.id);
		  _results = [];
		  for (key in data) {
			value = data[key];
			if (key === 'id') {
			  continue;
			} else {
			  _results.push(entry[key] = value);
			}
		  }
		  return _results;
		};

		Model.prototype.getById = function(id) {
		  return this._dataMap[id];
		};

		Model.prototype.getAll = function() {
		  return this._data;
		};

		Model.prototype.removeById = function(id, clearCache) {
		  var counter, data, entry, _i, _len, _ref;
		  if (clearCache == null) {
			clearCache = true;
		  }
		  _ref = this._data;
		  for (counter = _i = 0, _len = _ref.length; _i < _len; counter = ++_i) {
			entry = _ref[counter];
			if (entry.id === id) {
			  this._data.splice(counter, 1);
			  data = this._dataMap[id];
			  delete this._dataMap[id];
			  if (clearCache) {
				this._invalidateCache();
			  }
			  return data;
			}
		  }
		};

		Model.prototype.clear = function() {
		  this._data.length = 0;
		  this._dataMap = {};
		  return this._invalidateCache();
		};

		Model.prototype._invalidateCache = function() {
		  return this._filterCache = {};
		};

		Model.prototype.get = function(query) {
		  var hash;
		  hash = query.hashCode();
		  if (!angular.isDefined(this._filterCache[hash])) {
			this._filterCache[hash] = query.exec(this._data);
		  }
		  return this._filterCache[hash];
		};

		Model.prototype.size = function() {
		  return this._data.length;
		};

		return Model;

	  })();
	  return Model;
	}
  ]);

}).call(this);

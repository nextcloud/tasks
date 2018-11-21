/**
 * Nextcloud - Tasks
 *
 * @author Raimund Schlüßler
 * @copyright 2018 Raimund Schlüßler <raimund.schluessler@mailbox.org>
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
	'use strict';
	var __bind = function(fn, me){
		return function(){
			return fn.apply(me, arguments);
		};
	};

	angular.module('Tasks').factory('SearchBusinessLayer', [
		'ListsModel', 'Persistence', 'TasksModel', '$rootScope', '$routeParams', '$location', function(ListsModel, Persistence, TasksModel, $rootScope, $routeParams, $location) {
			var SearchBusinessLayer;
			SearchBusinessLayer = (function() {
				function SearchBusinessLayer(_$listsmodel, _persistence, _$tasksmodel, _$rootScope, _$routeparams, _$location) {
					this._$listsmodel = _$listsmodel;
					this._persistence = _persistence;
					this._$tasksmodel = _$tasksmodel;
					this._$rootScope = _$rootScope;
					this._$routeparams = _$routeparams;
					this._$location = _$location;
					this.getFilter = __bind(this.getFilter, this);
					this.setFilter = __bind(this.setFilter, this);
					this.cleanSearch = __bind(this.cleanSearch, this);
					this.attach = __bind(this.attach, this);
					this.initialize();
					this._$searchString = '';
				}

				SearchBusinessLayer.prototype.attach = function(search) {
					var _this = this;
					search.setFilter('tasks', function(query) {
						return _this.setFilter(query);
					});
				};

				SearchBusinessLayer.prototype.setFilter = function(query) {
					var _this = this;
					return _this._$rootScope.$apply(function() {
						_this._$searchString = query;	
					});
				};

				SearchBusinessLayer.prototype.cleanSearch = function() {
					var _this = this;
					return _this._$rootScope.$apply(function() {
						_this._$searchString = '';
					});
				};

				SearchBusinessLayer.prototype.getFilter = function() {
					return this._$searchString;
				};

				SearchBusinessLayer.prototype.initialize = function() {

					var version = OC.config.version.split('.');

					if (version[0] >= 14) {
						OC.Search = new OCA.Search(this.setFilter, this.cleanSearch);
					} else {
						OC.Plugins.register('OCA.Search', this);
					}
				};

				return SearchBusinessLayer;

			})();
			return new SearchBusinessLayer(ListsModel, Persistence, TasksModel, $rootScope, $routeParams, $location);
		}
	]);

}).call(this);

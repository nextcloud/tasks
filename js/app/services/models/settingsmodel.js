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
	var __hasProp = {}.hasOwnProperty,
	__extends = function(child, parent) {
		for (var key in parent) {
			if (__hasProp.call(parent, key)) {
				child[key] = parent[key];
			}
		}
		function Ctor() {
			this.constructor = child;
		}
		Ctor.prototype = parent.prototype;
		child.prototype = new Ctor();
		child.__super__ = parent.prototype;
		return child;
	},
	__indexOf = [].indexOf || function(item) {
		for (var i = 0, l = this.length; i < l; i++) {
			if (i in this && this[i] === item) {
				return i;
			}
		}
		return -1;
	};

	angular.module('Tasks').factory('SettingsModel', [
		'_Model', function(_Model) {
			var SettingsModel = (function(_super) {

				function SettingsModel() {
					this._nameCache = {};
					SettingsModel.__super__.constructor.call(this);
				}

				__extends(SettingsModel, _super);

				SettingsModel.prototype.add = function(data, clearCache) {
					if (clearCache === null) {
						clearCache = true;
					}
					this._nameCache[data.displayname] = data;
					if (angular.isDefined(data.id)) {
						return SettingsModel.__super__.add.call(this, data, clearCache);
					} else {
						return this._data.push(data);
					}
				};

				SettingsModel.prototype.toggle = function(type, setting) {
					var set;
					set = this.getById(type);
					this.getById(type)[setting] = !set[setting];
				};
				return SettingsModel;
			})(_Model);
			return new SettingsModel();
		}
	]);
}).call(this);

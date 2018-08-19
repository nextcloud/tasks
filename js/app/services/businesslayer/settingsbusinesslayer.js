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

angular.module('Tasks').factory('SettingsBusinessLayer', [
	'Persistence', 'SettingsModel', function(Persistence, SettingsModel) {
		'use strict';
		var SettingsBusinessLayer = (function() {
			function SettingsBusinessLayer(_persistence, _$settingsmodel) {
				this._persistence = _persistence;
				this._$settingsmodel = _$settingsmodel;
			}

			SettingsBusinessLayer.prototype.updateModel = function() {
				var success, _this = this;
				success = function() {};
				return this._persistence.getCollections(success, true);
			};

			SettingsBusinessLayer.prototype.setVisibility = function(collectionID, visibility) {
				return this._persistence.setVisibility(collectionID, visibility);
			};

			SettingsBusinessLayer.prototype.toggle = function(type, setting) {
				this._$settingsmodel.toggle(type, setting);
				var value = this._$settingsmodel.getById(type)[setting];
				return this._persistence.setting(type, setting, +value);
			};

			SettingsBusinessLayer.prototype.set = function(type, setting, value) {
				return this._persistence.setting(type, setting, value);
			};

			return SettingsBusinessLayer;

		})();
		return new SettingsBusinessLayer(Persistence, SettingsModel);
	}
]);

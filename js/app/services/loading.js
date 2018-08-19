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

  angular.module('Tasks').factory('Loading', [
	function() {
		'use strict';
		var Loading = (function() {
			function Loading() {
				this.count = 0;
			}

			Loading.prototype.increase = function() {
				return this.count += 1;
			};

			Loading.prototype.decrease = function() {
				return this.count -= 1;
			};

			Loading.prototype.getCount = function() {
				return this.count;
			};

			Loading.prototype.isLoading = function() {
				return this.count > 0;
			};

			return Loading;

		})();
		return new Loading();
	}
]);

/**
 * Nextcloud - Tasks
 *
 * @author Raimund Schlüßler
 * @copyright 2017 Raimund Schlüßler <raimund.schluessler@googlemail.com>
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


angular.module('Tasks').filter('priorityDetails', function() {
	'use strict';
	return function(priority) {
		var string;
		string = t('tasks', 'priority %s: ').replace('%s', priority);
		if (+priority === 6 || +priority === 7 || +priority === 8 || +priority === 9) {
			return string + ' ' + t('tasks', 'high');
		} else if (+priority === 5) {
			return string + ' ' + t('tasks', 'medium');
		} else if (+priority === 1 || +priority === 2 || +priority === 3 || +priority === 4) {
			return string + ' ' + t('tasks', 'low');
		} else {
			return t('tasks', 'no priority assigned');
		}
	};
});

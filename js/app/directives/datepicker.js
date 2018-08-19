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

angular.module('Tasks').directive('datepicker', function() {
	'use strict';
	return {
		restrict: 'A',
		scope: false,
		link: function(scope, elm, attr) {
			return elm.datepicker({
				onSelect: function(date, inst) {
					scope['set' + attr.datepicker + 'day'](date);
					return scope.$apply();
				},
				beforeShow: function(input, inst) {
					var dp, marginLeft;
					dp = $(inst).datepicker('widget');
					marginLeft = -Math.abs($(input).outerWidth() - dp.outerWidth()) / 2 + 'px';
					dp.css({
						'margin-left': marginLeft
					});
					$("div.ui-datepicker:before").css({
						'left': 100 + 'px'
					});
					return $('.hasDatepicker').datepicker("option", "firstDay", scope.settingsmodel.getById('various').startOfWeek);
				},
				beforeShowDay: function(date) {
					if (moment(date).startOf('day').diff(moment(scope.task[attr.datepicker], "YYYYMMDDTHHmmss").startOf('day'), 'days') === 0) {
						return [1, "selected"];
					} else {
						return [1, ""];
					}
				},
				minDate: null
			});
		}
	};
});

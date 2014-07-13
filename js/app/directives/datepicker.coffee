###

ownCloud - Tasks

@author Raimund Schlüßler
@copyright 2013

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
License as published by the Free Software Foundation; either
version 3 of the License, or any later version.

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU AFFERO GENERAL PUBLIC LICENSE for more details.

You should have received a copy of the GNU Affero General Public
License along with this library.  If not, see <http://www.gnu.org/licenses/>.

###
angular.module('Tasks').directive 'datepicker', ->
	restrict: 'A'
	scope: false
	link: (scope, elm, attr) ->
		elm.datepicker({
				onSelect: (date, inst) ->
					scope['set'+attr.datepicker+'day'](date)
					scope.$apply()
				beforeShow: (input, inst) ->
					dp = $(inst).datepicker('widget')
					marginLeft = -Math.abs($(input).outerWidth()-dp.outerWidth())/2+'px'
					dp.css({'margin-left':marginLeft})
					$("div.ui-datepicker:before").css({'left':100+'px'})
					$('.hasDatepicker').datepicker("option", "firstDay",
					scope.settingsmodel.getById('various').startOfWeek)
				beforeShowDay: (date) ->
					if (moment(date).startOf('day')
					.diff(moment(scope.task[attr.datepicker], "YYYYMMDDTHHmmss")
					.startOf('day'),'days') == 0)
						return [1,"selected"]
					else
						return [1,""]
				minDate: null
		})
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
angular.module('Tasks').filter 'reminderDetails', () ->
	(reminder,scope) ->
		if !(angular.isUndefined(reminder) || reminder == null)
			if reminder.type == 'DATE-TIME' &&
			moment(reminder.date, "YYYYMMDDTHHmmss").isValid()
				return moment(reminder.date, "YYYYMMDDTHHmmss").lang('reminder').calendar()
			else if reminder.type == 'DURATION' && reminder.duration
				ds = t('tasks', 'Remind me')
				for token in scope.durations
					if +reminder.duration[token.id]
						time = 1
						ds+=' '+reminder.duration[token.id]+' '
						if +reminder.duration[token.id] == 1
							ds+=token.name
						else
							ds+=token.names
				if !time
					if reminder.duration.params.related == 'END'
						ds+= ' '+t('tasks','at the end')
					else
						ds+= ' '+t('tasks','at the beginning')
				else
					if reminder.duration.params.invert
						if reminder.duration.params.related == 'END'
							ds+= ' '+t('tasks','before end')
						else
							ds+= ' '+t('tasks','before beginning')
					else
						if reminder.duration.params.related == 'END'
							ds+= ' '+t('tasks','after end')
						else
							ds+= ' '+t('tasks','after beginning')
				return ds
			else
				return t('tasks', 'Remind me')
		else
			return t('tasks', 'Remind me')
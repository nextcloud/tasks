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
angular.module('Tasks').filter 'taskAtDay', () ->
	return (tasks, date) ->
		ret = []
		for task in tasks
			due = moment(task.due, "YYYYMMDDTHHmmss")
			if due.isValid()
				diff = due.diff(moment().startOf('day'), 'days', true)
				if !date && diff < date+1
					ret.push(task)
				else if diff < date+1 && diff >= date
					ret.push(task)
		return ret
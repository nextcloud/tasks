/**
 * Nextcloud - Inventory
 *
 * @author Raimund Schlüßler
 * @copyright 2017 Raimund Schlüßler <raimund.schluessler@mailbox.org>
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
'use strict'

/**
 * Returns the count of tasks in a calendar
 *
 * Tasks have to be
 *	- a root task
 *	- uncompleted
 *
 * @param {Task} task the task to check
 * @param {String} task the id of the list in question
 */
function isTaskInList(task, listID) {
	switch (listID) {
	case 'completed':
		return task.completed === true
	case 'all':
		return task.completed === false
	case 'current':
		return task.completed === false && current(task.start, task.due)
	case 'starred':
		return task.completed === false && task.priority > 5
	case 'today':
		return task.completed === false && (today(task.start) || today(task.due))
	case 'week':
		return task.completed === false && (week(task.start) || week(task.due))
	default:
		return '' + task.calendar.uri === '' + listID
	}
}

function current(start, due) {
	return !moment(start, 'YYYYMMDDTHHmmss').isValid() || moment(start, 'YYYYMMDDTHHmmss').diff(moment(), 'days', true) < 0 || moment(due, 'YYYYMMDDTHHmmss').diff(moment(), 'days', true) < 0
}

function today(date) {
	return moment(date, 'YYYYMMDDTHHmmss').isValid() && moment(date, 'YYYYMMDDTHHmmss').diff(moment().startOf('day'), 'days', true) < 1
}

function week(date) {
	return moment(date, 'YYYYMMDDTHHmmss').isValid() && moment(date, 'YYYYMMDDTHHmmss').diff(moment().startOf('day'), 'days', true) < 7
}

function due(due) {
	return moment(due, 'YYYYMMDDTHHmmss').isValid()
}

function overdue(due) {
	return moment(due, 'YYYYMMDDTHHmmss').isValid() && moment(due, 'YYYYMMDDTHHmmss').diff(moment()) < 0
}

export {
	isTaskInList,
	due,
	overdue
}

/**
 * Nextcloud - Inventory
 *
 * @author Raimund Schlüßler
 * @copyright 2017 Raimund Schlüßler <raimund.schluessler@mailbox.org>
 * @copyright 2018 Vadim Nicolai <contact@vadimnicolai.com>
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
 * Returns if a task belongs to a list
 *
 * @param {Object} task the task to check
 * @param {String} listId the id of the list in question
 * @returns {Boolean}
 */
function isTaskInList(task, listId) {
	switch (listId) {
	case 'completed':
		return task.completed === true
	case 'all':
		return task.completed === false
	case 'current':
		return task.completed === false && current(task.start, task.due)
	case 'starred':
		return task.completed === false && (task.priority > 0 && task.priority < 5)
	case 'today':
		return task.completed === false && (today(task.start) || today(task.due))
	case 'week':
		return task.completed === false && (week(task.start) || week(task.due))
	default:
		return '' + task.calendar.id === '' + listId
	}
}

/**
 * Checks if the start or due date have already passed
 *
 * @param {String} start The start date
 * @param {String} due The due date
 * @returns {Boolean}
 */
function current(start, due) {
	return !valid(start) || moment(start, 'YYYYMMDDTHHmmss').diff(moment(), 'days', true) < 0 || moment(due, 'YYYYMMDDTHHmmss').diff(moment(), 'days', true) < 0
}

/**
 * Checks if a date is today
 *
 * @param {String} date The date
 * @returns {Boolean}
 */
function today(date) {
	return valid(date) && moment(date, 'YYYYMMDDTHHmmss').diff(moment().startOf('day'), 'days', true) < 1
}

/**
 * Checks if a date lies within the next week
 *
 * @param {String} date The date
 * @returns {Boolean}
 */
function week(date) {
	return valid(date) && moment(date, 'YYYYMMDDTHHmmss').diff(moment().startOf('day'), 'days', true) < 7
}

/**
 * Checks if a date is valid
 *
 * @param {String} date The date
 * @returns {Boolean}
 */
function valid(date) {
	return moment(date, 'YYYYMMDDTHHmmss').isValid()
}

/**
 * Checks if a date is overdue
 *
 * @param {String} due The due date
 * @returns {Boolean}
 */
function overdue(due) {
	return valid(due) && moment(due, 'YYYYMMDDTHHmmss').diff(moment()) < 0
}

/**
 * Checks if for a given task the parent is found in the given Object
 *
 * @param {Object} task The task
 * @param {Object} tasks The tasks to search in
 * @returns {Boolean}
 */
function isParentInList(task, tasks) {
	return Object.values(tasks).some(t => {
		return t.uid === task.related
	})
}

/**
 * Sorts tasks in specified order type
 *
 * @param {Array} tasks The tasks to search in
 * @param {String} sortOrder The sorting order type
 * @param {Boolean} sortDirection The sorting direction
 * @returns {Array}
 */
function sort(tasks, sortOrder, sortDirection) {
	switch (sortOrder) {
	case 'alphabetically': {
		const sortedTasks = sortAlphabetically(tasks)
		if (sortDirection) return sortedTasks
		return sortedTasks.reverse()
	}
	case 'priority': {
		const sortedTasks = tasks.sort((taskA, taskB) => taskA.priority - taskB.priority)
		if (sortDirection) return sortedTasks
		return sortedTasks.reverse()
	}
	case 'due': {
		const sortedTasks = sortByDate(tasks, 'due')
		if (sortDirection) return sortedTasks
		return sortedTasks.reverse()
	}
	case 'start': {
		const sortedTasks = sortByDate(tasks, 'start')
		if (sortDirection) return sortedTasks
		return sortedTasks.reverse()
	}
	default:
		return tasks
	}
}

/**
 * Sorts tasks alphabetically in ascending order
 *
 * @param {Array} tasks The tasks to be sorted
 * @returns {Array}
 */
function sortAlphabetically(tasks) {
	return tasks.sort((taskA, taskB) =>
		taskA.summary.toLowerCase().localeCompare(taskB.summary.toLowerCase())
	)
}

/**
 * Sorts tasks by date in ascending order
 *
 * @param {Array} tasks The tasks to be sorted
 * @param {String} date The date sort type
 * @returns {Array}
 */
function sortByDate(tasks, date) {
	return tasks.sort((taskA, taskB) => {
		if (taskA[date] === null && taskB[date] !== null) {
			return -1
		}

		if (taskA[date] !== null && taskB[date] === null) {
			return 1
		}

		if (taskA[date] === null && taskB[date] === null) {
			return 0
		}

		return moment(taskA[date]).format('YYYYMMDDHHmm') - moment(taskB[date]).format('YYYYMMDDHHmm')
	})
}

export {
	isTaskInList,
	valid,
	overdue,
	isParentInList,
	sort,
}

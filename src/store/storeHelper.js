/**
 * Nextcloud - Tasks
 *
 * @author Raimund Schlüßler
 * @copyright 2019 Raimund Schlüßler <raimund.schluessler@mailbox.org>
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

import ICAL from 'ical.js'

/**
 * Returns if a task belongs to a list
 *
 * @param {Object} task The task to check
 * @param {String} listId The id of the list in question
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
 * @param {Task} task The task
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
 * @param {Array<Task>} tasks The tasks to sort
 * @param {String} sortOrder The sorting order type
 * @param {Boolean} sortDirection The sorting direction
 * @returns {Array}
 */
function sort(tasks, sortOrder, sortDirection) {
	var comparators
	switch (sortOrder) {
	case 'alphabetically': {
		comparators = [sortByPinned, sortAlphabetically, sortByPriority]
		break
	}
	case 'priority': {
		comparators = [sortByPinned, sortByPriority, sortAlphabetically]
		break
	}
	case 'due': {
		comparators = [sortByPinned, sortByDue, sortAlphabetically]
		break
	}
	case 'start': {
		comparators = [sortByPinned, sortByStart, sortAlphabetically]
		break
	}
	case 'created': {
		comparators = [sortByPinned, sortByCreated, sortAlphabetically]
		break
	}
	case 'modified': {
		comparators = [sortByPinned, sortByModified, sortAlphabetically]
		break
	}
	case 'completedDate': {
		comparators = [sortByPinned, sortByCompletedDate, sortAlphabetically]
		break
	}
	default:
		comparators = [sortByPinned, sortByCompleted, sortByDue, sortByPriority, sortByStart, sortAlphabetically]
	}
	var sortedTasks = tasks.sort((taskA, taskB) => {
		var compIndex = 0
		var result = comparators[compIndex](taskA, taskB)
		while (result === 0 && compIndex < comparators.length) {
			result = comparators[compIndex](taskA, taskB)
			compIndex++
		}
		return result
	})
	return sortDirection ? sortedTasks.reverse() : sortedTasks
}

/**
 * Comparator to compare two tasks by pinned state
 *
 * @param {Task} taskA The first task
 * @param {Task} taskB The second task
 * @returns {Integer}
 */
function sortByPinned(taskA, taskB) {
	if (taskA.pinned && taskB.pinned) return 0
	if (taskA.pinned) return -1
	if (taskB.pinned) return 1
	return 0
}

/**
 * Comparator to compare two tasks by completed state in ascending order
 *
 * @param {Task} taskA The first task
 * @param {Task} taskB The second task
 * @returns {Integer}
 */
function sortByCompleted(taskA, taskB) {
	return taskA.completed - taskB.completed
}

/**
 * Comparator to compare two tasks by priority in ascending order
 *
 * Sorting by priority is a bit tricky, because
 * 0 means no priority, but 1 is highest priority and 9 is lowest priority.
 * Hence, sort order must be 1, 2, ..., 9, 0
 *
 * @param {Task} taskA The first task
 * @param {Task} taskB The second task
 * @returns {Integer}
 */
function sortByPriority(taskA, taskB) {
	if (-taskA.priority === -taskB.priority) return 0
	if (-taskA.priority === 0) return 1
	if (-taskB.priority === 0) return -1
	return taskA.priority - taskB.priority
}

/**
 * Comparator to compare two tasks alphabetically in ascending order
 *
 * @param {Task} taskA The first task
 * @param {Task} taskB The second task
 * @returns {Integer}
 */
function sortAlphabetically(taskA, taskB) {
	return taskA.summary.toLowerCase().localeCompare(taskB.summary.toLowerCase())
}

/**
 * Comparator proxy to compare two tasks by due date in ascending order
 *
 * @param {Task} taskA The first task
 * @param {Task} taskB The second task
 * @returns {Integer}
 */
function sortByDue(taskA, taskB) {
	return sortByDate(taskA, taskB, 'due')
}

/**
 * Comparator proxy to compare two tasks by start date in ascending order
 *
 * @param {Task} taskA The first task
 * @param {Task} taskB The second task
 * @returns {Integer}
 */
function sortByStart(taskA, taskB) {
	return sortByDate(taskA, taskB, 'start')
}

/**
 * Comparator proxy to compare two tasks by last-modified date in ascending order
 *
 * @param {Task} taskA The first task
 * @param {Task} taskB The second task
 * @returns {Integer}
 */
function sortByModified(taskA, taskB) {
	return sortByDate(taskA, taskB, 'modified')
}

/**
 * Comparator proxy to compare two tasks by completed date in ascending order
 *
 * @param {Task} taskA The first task
 * @param {Task} taskB The second task
 * @returns {Integer}
 */
function sortByCompletedDate(taskA, taskB) {
	return sortByDate(taskA, taskB, 'completedDate')
}

/**
 * Comparator proxy to compare two tasks by created date in ascending order
 *
 * @param {Task} taskA The first task
 * @param {Task} taskB The second task
 * @returns {Integer}
 */
function sortByCreated(taskA, taskB) {
	return sortByDate(taskA, taskB, 'created')
}

/**
 * Comparator to compare two tasks by date in ascending order
 *
 * @param {Task} taskA The first task
 * @param {Task} taskB The second task
 * @param {String} date The date sort type
 * @returns {Integer}
 */
function sortByDate(taskA, taskB, date) {
	if (taskA[date] === null && taskB[date] !== null) {
		return 1
	}

	if (taskA[date] !== null && taskB[date] === null) {
		return -1
	}

	if (taskA[date] === null && taskB[date] === null) {
		return 0
	}

	return moment(taskA[date], 'YYYYMMDDTHHmmss').diff(moment(taskB[date], 'YYYYMMDDTHHmmss'))
}

/**
 * Function to convert a moment to a ICAL Time
 *
 * @param {Moment} moment The moment to convert
 * @param {Bool} asDate Is the moment all day
 * @returns {ICAL.Time}
 */
function momentToICALTime(moment, asDate) {
	if (asDate) {
		return ICAL.Time.fromDateString(moment.format('YYYY-MM-DD'))
	} else {
		return ICAL.Time.fromDateTimeString(moment.format('YYYY-MM-DDTHH:mm:ss'))
	}
}

/**
 * Checks if one of the tasks sub(sub-...)tasks matches the search query
 *
 * @param {Task} task The task to search in
 * @param {String} searchQuery The string to find
 * @returns {Boolean} If the task matches
 */
function searchSubTasks(task, searchQuery) {
	return Object.values(task.subTasks).some((subTask) => {
		if (subTask.matches(searchQuery)) {
			return true
		}
		return searchSubTasks(subTask, searchQuery)
	})
}

export {
	isTaskInList,
	valid,
	overdue,
	isParentInList,
	sort,
	momentToICALTime,
	searchSubTasks,
}

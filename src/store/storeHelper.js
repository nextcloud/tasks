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

import moment from '@nextcloud/moment'

import ICAL from 'ical.js'

/**
 * Returns if a task belongs to a list
 *
 * @param {Object} task The task to check
 * @param {String} listId The id of the list in question
 * @param {Boolean} checkSubtasks Whether we also check if a descendant task matches
 * @returns {Boolean}
 */
function isTaskInList(task, listId, checkSubtasks = true) {
	const parts = listId.split('-')
	listId = parts[0]
	const day = parts[1] ? parts[1] : null
	switch (listId) {
	case 'completed':
		return task.completed
	case 'all':
		return !task.completed
	case 'current':
		return !task.completed && testTask(task, isTaskCurrent, checkSubtasks)
	case 'starred':
		return !task.completed && testTask(task, isTaskPriority, checkSubtasks)
	case 'today':
		return !task.completed && testTask(task, isTaskToday, checkSubtasks)
	case 'week':
		if (!day) {
			return !task.completed && testTask(task, isTaskWeek, checkSubtasks)
		} else {
			return !task.completed && testTask(task, (task) => isTaskDay(task, parseInt(day)), checkSubtasks)
		}
	default:
		return '' + task.calendar.id === '' + listId
	}
}

/**
 * Checks for a task (and possibly its subtasks) if the given test function returns true
 *
 * @param {Object} task The task to check
 * @param {Function} testFunction The function to apply on the task
 * @param {Boolean} checkSubtasks Whether to check subtasks
 * @returns {Boolean}
 */
function testTask(task, testFunction, checkSubtasks = false) {
	if (!task.completed && testFunction(task)) {
		return true
	}
	if (checkSubtasks) {
		for (const key in task.subTasks) {
			const subTask = task.subTasks[key]
			if (testTask(subTask, testFunction, checkSubtasks)) {
				return true
			}
		}
	}
	return false
}

/**
 * Checks if the task has a high priority
 *
 * @param {Object} task The task to check
 * @returns {Boolean}
 */
function isTaskPriority(task) {
	return (task.priority > 0 && task.priority < 5)
}

/**
 * Checks if the start or due date have already passed
 *
 * @param {Object} task The task to check
 * @returns {Boolean}
 */
function isTaskCurrent(task) {
	return !task.startMoment.isValid() || task.startMoment.diff(moment(), 'days', true) < 0 || task.dueMoment.diff(moment(), 'days', true) < 0
}

/**
 * Checks if the start or due date of a task are today
 *
 * @param {Object} task The task to check
 * @returns {Boolean}
 */
function isTaskToday(task) {
	return (today(task.startMoment) || today(task.dueMoment))
}

/**
 * Checks if a date is today
 *
 * @param {Moment} date The date as moment
 * @returns {Boolean}
 */
function today(date) {
	return date.isValid() && date.diff(moment().startOf('day'), 'days', true) < 1
}

/**
 * Checks if the start or due date of a task are this week
 *
 * @param {Object} task The task to check
 * @returns {Boolean}
 */
function isTaskWeek(task) {
	return (week(task.startMoment) || week(task.dueMoment))
}

/**
 * Checks if a date lies within the next week
 *
 * @param {Moment} date The date as moment
 * @returns {Boolean}
 */
function week(date) {
	return date.isValid() && date.diff(moment().startOf('day'), 'days', true) < 7
}

/**
 * Checks if the start or due date of a task are at a given day
 *
 * @param {Object} task The task to check
 * @param {Integer} day The day
 * @returns {Boolean}
 */
function isTaskDay(task, day) {
	let diff = dayOfTask(task)
	diff = (diff < 0) ? 0 : diff
	return diff === day
}

function dayOfTask(task) {
	let diff, startdiff, duediff
	const start = task.startMoment.startOf('day')
	const due = task.dueMoment.startOf('day')

	// Add all tasks whose start date will be reached at that day.
	if (start.isValid() && !due.isValid()) {
		diff = start.diff(moment().startOf('day'), 'days')
	}

	// Add all tasks whose due date will be reached at that day.
	if (due.isValid() && !start.isValid()) {
		diff = due.diff(moment().startOf('day'), 'days')
	}

	// Add all tasks whose due or start date will be reached at that day.
	// Add the task to the day at which either due or start date are reached first.
	if (start.isValid() && due.isValid()) {
		startdiff = start.diff(moment().startOf('day'), 'days')
		duediff = due.diff(moment().startOf('day'), 'days')
		// chose the date that is reached first
		diff = (startdiff < duediff) ? startdiff : duediff
	}

	return diff
}

/**
 * Checks if a date is overdue
 *
 * @param {Moment} date The date
 * @returns {Boolean}
 */
function overdue(date) {
	return date.isValid() && date.diff(moment()) < 0
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
	let comparators
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
	case 'manual': {
		comparators = [sortBySortOrder]
		break
	}
	default:
		comparators = [sortByPinned, sortByCompleted, sortByDue, sortByPriority, sortByStart, sortAlphabetically]
	}
	const sortedTasks = tasks.sort((taskA, taskB) => {
		let compIndex = 0
		let result = comparators[compIndex](taskA, taskB)
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
	return taskA[date + 'Moment'].diff(taskB[date + 'Moment'])
}

/**
 * Comparator to compare two tasks by sort order in ascending order
 *
 * @param {Task} taskA The first task
 * @param {Task} taskB The second task
 * @returns {Integer}
 */
function sortBySortOrder(taskA, taskB) {
	return taskA.sortOrder - taskB.sortOrder
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
	overdue,
	isParentInList,
	sort,
	momentToICALTime,
	searchSubTasks,
}

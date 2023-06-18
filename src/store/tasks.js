/**
 * Nextcloud - Tasks
 *
 * @author Raimund Schlüßler
 *
 * @copyright 2018 Raimund Schlüßler <raimund.schluessler@mailbox.org>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library. If not, see <http://www.gnu.org/licenses/>.
 *
 */
'use strict'

import { Calendar } from './calendars.js'
import { findVTODObyUid } from './cdav-requests.js'
import { isParentInList, momentToICALTime, parseString } from './storeHelper.js'
import SyncStatus from '../models/syncStatus.js'
import Task from '../models/task.js'

import { showError } from '@nextcloud/dialogs'
import { emit } from '@nextcloud/event-bus'
import { translate as t } from '@nextcloud/l10n'
import moment from '@nextcloud/moment'

import ICAL from 'ical.js'

const state = {
	tasks: {},
	searchQuery: '',
	filter: {
		tags: [],
	},
	deletedTasks: {},
	deleteInterval: null,
}

const getters = {
	/**
	 * Returns all tasks corresponding to the calendar
	 *
	 * @param {object} state The store data
	 * @param {object} getters The store getters
	 * @param {object} rootState The store root state
	 * @return {Array<Task>} The tasks
	 */
	getTasksByCalendarId: (state, getters, rootState) =>
		/**
		 * @param {string} calendarId The Id of the calendar in question
		 * @return {Array<Task>} The tasks
		 */
		(calendarId) => {
			const calendar = getters.getCalendarById(calendarId)
			if (calendar) {
				return Object.values(calendar.tasks)
			}
			return []
		},

	/**
	 * Returns all tasks which are direct children of the current task
	 *
	 * @param {object} state The store data
	 * @param {object} getters The store getters
	 * @param {object} rootState The store root state
	 * @return {Array<Task>} The sub-tasks of the current task
	 */
	getTasksByParent: (state, getters, rootState) =>
		/**
		 * @param {object} parent The parent task
		 * @return {Array<Task>} The sub-tasks of the current task
		 */
		(parent) => {
			return getters.getTasksByCalendarId(parent.calendar.id)
				.filter(task => {
					return task.related === parent.uid
				})
		},

	/**
	 * Returns all tasks of all calendars
	 *
	 * @param {object} state The store data
	 * @param {object} getters The store getters
	 * @return {Array} All tasks in store
	 */
	getAllTasks: (state, getters) => {
		let tasks = []
		getters.getTaskCalendars.forEach(calendar => {
			tasks = tasks.concat(Object.values(calendar.tasks))
		})
		return tasks
	},

	/**
	 * Returns the task currently opened by route
	 *
	 * @param {object} state The store data
	 * @param {object} getters The store getters
	 * @param {object} rootState The store root state
	 * @return {Task} The task
	 */
	getTaskByRoute: (state, getters, rootState) => (route) => {
		// If a calendar is given, only search in that calendar.
		if (route.params.calendarId) {
			const calendar = getters.getCalendarById(route.params.calendarId)
			if (!calendar) {
				return null
			}
			return Object.values(calendar.tasks).find(task => {
				return task.uri === route.params.taskId
			})
		}
		// Else, we have to search all calendars
		return getters.getTaskByUri(route.params.taskId)
	},

	/**
	 * Returns the task by Uri
	 *
	 * @param {object} state The store data
	 * @param {object} getters The store getters
	 * @return {Task} The task
	 */
	getTaskByUri: (state, getters) =>
		/**
		 * @param {string} taskUri The Uri of the task in question
		 * @return {Task} The task
		 */
		(taskUri) => {
			// We have to search in all calendars
			let task
			for (const calendar of getters.getTaskCalendars) {
				task = Object.values(calendar.tasks).find(task => {
					return task.uri === taskUri
				})
				if (task) return task
			}
			return null
		},

	/**
	 * Returns the task by Uri
	 *
	 * @param {object} state The store data
	 * @param {object} getters The store getters
	 * @return {Task} The task
	 */
	getTaskByUid: (state, getters) =>
		/**
		 * @param {string} taskUid The Uid of the task in question
		 * @return {Task} The task
		 */
		(taskUid) => {
			// We have to search in all calendars
			let task
			for (const calendar of getters.getTaskCalendars) {
				task = Object.values(calendar.tasks).find(task => {
					return task.uid === taskUid
				})
				if (task) return task
			}
			return null
		},

	/**
	 * Returns the root tasks from a given object
	 *
	 * @return {Array<Task>}
	 */
	findRootTasks: () =>
		/**
		 * @param {object} tasks The tasks to search in
		 * @return {Array<Task>}
		 */
		(tasks) => {
			return Object.values(tasks).filter(task => {
				/**
				 * Check if the task has the related field set.
				 * If it has, then check if the parent task is available
				 * (otherwise it might happen, that this task is not shown at all)
				 */
				return !task.related || !isParentInList(task, tasks)
			})
		},

	/**
	 * Returns the closed root tasks from a given object
	 *
	 * @return {Array<Task>}
	 */
	findClosedRootTasks: () =>
		/**
		 * @param {object} tasks The tasks to search in
		 * @return {Array<Task>}
		 */
		(tasks) => {
			return Object.values(tasks).filter(task => {
				/**
				 * Check if the task has the related field set.
				 * If it has, then check if the parent task is available
				 * (otherwise it might happen, that this task is not shown at all)
				 */
				return (!task.related || !isParentInList(task, tasks)) && task.closed
			})
		},

	/**
	 * Returns the not closed root tasks from a given object
	 *
	 * @return {Array<Task>}
	 */
	findOpenRootTasks: () =>
		/**
		 * @param {object} tasks The tasks to search in
		 * @return {Array<Task>}
		 */
		(tasks) => {
			return Object.values(tasks).filter(task => {
				/**
				 * Check if the task has the related field set.
				 * If it has, then check if the parent task is available
				 * (otherwise it might happen, that this task is not shown at all)
				 */
				return (!task.related || !isParentInList(task, tasks)) && !task.closed
			})
		},

	/**
	 * Returns the parent task of a given task
	 *
	 * @return {Task} The parent task
	 */
	getParentTask: () =>
		/**
		 * @param {Task} task The task of which to find the parent
		 * @return {Task} The parent task
		 */
		(task) => {
			const tasks = task.calendar.tasks
			return Object.values(tasks).find(search => search.uid === task.related) || null
		},

	/**
	 * Returns the current search query
	 *
	 * @param {object} state The store data
	 * @param {object} getters The store getters
	 * @param {object} rootState The store root state
	 * @return {string} The current search query
	 */
	searchQuery: (state, getters, rootState) => {
		return state.searchQuery
	},

	/**
	 * Returns the current filter
	 *
	 * @param {object} state The store data
	 * @param {object} getters The store getters
	 * @param {object} rootState The store root state
	 * @return {string} The current filter
	 */
	filter: (state, getters, rootState) => {
		return state.filter
	},

	/**
	 * Returns all tags of all tasks
	 *
	 * @param {object} state The store data
	 * @param {object} getters The store getters
	 * @return {Array<string>} All tags
	 */
	tags: (state, getters) => {
		const tasks = getters.getAllTasks
		return tasks.reduce((tags, task) => {
			// Add each tag to the tags array if it's not present yet
			task.tags.forEach((tag) => {
				if (!tags.includes(tag)) {
					tags.push(tag)
				}
			})
			return tags
		}, []).sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))
	},
}

const mutations = {

	/**
	 * Stores tasks into state
	 *
	 * @param {object} state Default state
	 * @param {Array<Task>} tasks Tasks
	 */
	appendTasks(state, tasks = []) {
		state.tasks = tasks.reduce(function(list, task) {
			if (task instanceof Task) {
				list[task.key] = task
			} else {
				console.error('Wrong task object', task)
			}
			return list
		}, state.tasks)
	},

	/**
	 * Stores task into state
	 *
	 * @param {object} state Default state
	 * @param {Task} task The task to append
	 */
	appendTask(state, task) {
		state.tasks[task.key] = task
	},

	/**
	 * Deletes a task from state
	 *
	 * @param {object} state Default state
	 * @param {Task} task The task to delete
	 */
	deleteTask(state, task) {
		if (state.tasks[task.key] && task instanceof Task) {
			delete state.tasks[task.key]
		}
	},

	/**
	 * Deletes a task from the parent
	 *
	 * @param {object} state The store data
	 * @param {object} data Destructuring object
	 * @param {Task} data.task The task to delete from the parents subtask list
	 * @param {Task} data.parent The parent task
	 */
	deleteTaskFromParent(state, { task, parent }) {
		if (task instanceof Task) {
			// Remove task from parents subTask list if necessary
			if (task.related && parent) {
				delete parent.subTasks[task.uid]
			}
		}
	},

	/**
	 * Adds a task to parent task as subtask
	 *
	 * @param {object} state The store data
	 * @param {object} data Destructuring object
	 * @param {Task} data.task The task to add to the parents subtask list
	 * @param {Task} data.parent The parent task
	 */
	addTaskToParent(state, { task, parent }) {
		if (task.related && parent) {
			parent.subTasks[task.uid] = task
		}
	},

	/**
	 * Toggles the completed state of a task
	 *
	 * @param {object} state The store data
	 * @param {object} data Destructuring object
	 * @param {Task} data.task The task
	 * @param {number} data.complete The complete value
	 */
	setComplete(state, { task, complete }) {
		task.complete = complete
	},

	/**
	 * Toggles the starred state of a task
	 *
	 * @param {object} state The store data
	 * @param {Task} task The task
	 */
	toggleStarred(state, task) {
		if (+task.priority < 1 || +task.priority > 4) {
			task.priority = 1
		} else {
			task.priority = 0
		}
	},

	/**
	 * Toggles the pinned state of a task
	 *
	 * @param {object} state The store data
	 * @param {Task} task The task
	 */
	togglePinned(state, task) {
		task.pinned = !task.pinned
	},

	/**
	 * Toggles the visibility of the subtasks
	 *
	 * @param {object} state The store data
	 * @param {Task} task The task
	 */
	toggleSubtasksVisibility(state, task) {
		task.hideSubtasks = !task.hideSubtasks
	},

	/**
	 * Toggles the visibility of the completed subtasks
	 *
	 * @param {object} state The store data
	 * @param {Task} task The task
	 */
	toggleCompletedSubtasksVisibility(state, task) {
		task.hideCompletedSubtasks = !task.hideCompletedSubtasks
	},

	/**
	 * Sets the summary of a task
	 *
	 * @param {object} state The store data
	 * @param {object} data Destructuring object
	 * @param {Task} data.task The task
	 * @param {string} data.summary The summary
	 */
	setSummary(state, { task, summary }) {
		task.summary = summary
	},

	/**
	 * Sets the note of a task
	 *
	 * @param {object} state The store data
	 * @param {object} data Destructuring object
	 * @param {Task} data.task The task
	 * @param {string} data.note The note
	 */
	setNote(state, { task, note }) {
		task.note = note
	},

	/**
	 * Sets the tags of a task
	 *
	 * @param {object} state The store data
	 * @param {object} data Destructuring object
	 * @param {Task} data.task The task
	 * @param {Array} data.tags The array of tags
	 */
	setTags(state, { task, tags }) {
		task.tags = tags
	},

	/**
	 * Adds a tag to a task
	 *
	 * @param {object} state The store data
	 * @param {object} data Destructuring object
	 * @param {Task} data.task The task
	 * @param {string} data.tag The tag to add
	 */
	addTag(state, { task, tag }) {
		task.tags = task.tags.concat([tag])
	},

	/**
	 * Sets the priority of a task
	 *
	 * @param {object} state The store data
	 * @param {object} data Destructuring object
	 * @param {Task} data.task The task
	 * @param {string} data.priority The priority
	 */
	setPriority(state, { task, priority }) {
		task.priority = priority
	},

	/**
	 * Sets the location of a task
	 *
	 * @param {object} state The store data
	 * @param {object} data Destructuring object
	 * @param {Task} data.task The task
	 * @param {string} data.location The location
	 */
	setLocation(state, { task, location }) {
		task.location = location
	},

	/**
	 * Sets the url of a task
	 *
	 * @param {object} state The store data
	 * @param {object} data Destructuring object
	 * @param {Task} data.task The task
	 * @param {string} data.url The url
	 */
	setUrl(state, { task, url }) {
		task.customUrl = url
	},

	/**
	 * Sets the classification of a task
	 *
	 * @param {object} state The store data
	 * @param {object} data Destructuring object
	 * @param {Task} data.task The task
	 * @param {string} data.classification The classification
	 */
	setClassification(state, { task, classification }) {
		task.class = classification
	},

	/**
	 * Sets the status of a task
	 *
	 * @param {object} state The store data
	 * @param {object} data Destructuring object
	 * @param {Task} data.task The task
	 * @param {string} data.status The status
	 */
	setStatus(state, { task, status }) {
		task.status = status
	},

	/**
	 * Sets the sort order of a task
	 *
	 * @param {object} state The store data
	 * @param {object} data Destructuring object
	 * @param {Task} data.task The task
	 * @param {number} data.order The sort order
	 */
	setSortOrder(state, { task, order }) {
		task.sortOrder = order
	},

	/**
	 * Sets the due date of a task
	 *
	 * @param {object} state The store data
	 * @param {object} data Destructuring object
	 * @param {Task} data.task The task
	 * @param {moment} data.due The due date moment
	 * @param {boolean} data.allDay Whether the date is all-day
	 */
	setDue(state, { task, due, allDay }) {
		if (due === null) {
			// If the date is null, just set (remove) it.
			task.due = due
		} else {
			// Check, that the due date is after the start date.
			// If it is not, shift the start date to keep the difference between start and due equal.
			let start = task.startMoment
			if (start.isValid() && due.isBefore(start)) {
				const currentdue = task.dueMoment
				if (currentdue.isValid()) {
					start.subtract(currentdue.diff(due), 'ms')
				} else {
					start = due.clone()
				}
				task.start = momentToICALTime(start, allDay)
			}
			// Set the due date, convert it to ICALTime first.
			task.due = momentToICALTime(due, allDay)
		}
	},

	/**
	 * Sets the start date of a task
	 *
	 * @param {object} state The store data
	 * @param {object} data Destructuring object
	 * @param {Task} data.task The task
	 * @param {moment} data.start The start date moment
	 * @param {boolean} data.allDay Whether the date is all-day
	 */
	setStart(state, { task, start, allDay }) {
		if (start === null) {
			// If the date is null, just set (remove) it.
			task.start = start
		} else {
			// Check, that the start date is before the due date.
			// If it is not, shift the due date to keep the difference between start and due equal.
			let due = task.dueMoment
			if (due.isValid() && start.isAfter(due)) {
				const currentstart = task.startMoment
				if (currentstart.isValid()) {
					due.add(start.diff(currentstart), 'ms')
				} else {
					due = start.clone()
				}
				task.due = momentToICALTime(due, allDay)
			}
			// Set the due date, convert it to ICALTime first.
			task.start = momentToICALTime(start, allDay)
		}
	},

	/**
	 * Toggles if the start and due dates of a task are all day
	 *
	 * @param {object} state The store data
	 * @param {Task} task The task
	 */
	toggleAllDay(state, task) {
		task.allDay = !task.allDay
	},

	/**
	 * Move task to a different calendar
	 *
	 * @param {object} state The store data
	 * @param {object} data Destructuring object
	 * @param {Task} data.task The task
	 * @param {Calendar} data.calendar The calendar to move the task to
	 */
	setTaskCalendar(state, { task, calendar }) {
		task.calendar = calendar
	},

	/**
	 * Move task to a different calendar
	 *
	 * @param {object} state The store data
	 * @param {object} data Destructuring object
	 * @param {Task} data.task The task
	 * @param {string} data.related The uid of the related task
	 */
	setTaskParent(state, { task, related }) {
		task.related = related
	},

	/**
	 * Update a task etag
	 *
	 * @param {object} state The store object
	 * @param {object} data Destructuring object
	 * @param {Task} data.task The task to update
	 */
	updateTaskEtag(state, { task }) {
		if (state.tasks[task.key] && task instanceof Task) {
			// replace task object data
			state.tasks[task.key].dav.etag = task.conflict
		} else {
			console.error('Error while replacing the etag of following task ', task)
		}
	},

	/**
	 * Resets the sync status
	 *
	 * @param {object} state The store object
	 * @param {object} data Destructuring object
	 * @param {Task} data.task The task to update
	 */
	resetStatus(state, { task }) {
		if (state.tasks[task.key] && task instanceof Task) {
			// replace task object data
			state.tasks[task.key].syncStatus = null
		}
	},

	/**
	 * Update a task
	 *
	 * @param {object} state The store data
	 * @param {Task} task The task to update
	 */
	updateTask(state, task) {
		if (state.tasks[task.key] && task instanceof Task) {
			// replace task object data
			state.tasks[task.key].updateTask(task.jCal)

		} else {
			console.error('Error while replacing the following task ', task)
		}
	},

	/**
	 * Sets the search query
	 *
	 * @param {object} state The store data
	 * @param {string} searchQuery The search query
	 */
	setSearchQuery(state, searchQuery) {
		state.searchQuery = searchQuery
	},

	/**
	 * Sets the filter
	 *
	 * @param {object} state The store data
	 * @param {string} filter The filter
	 */
	setFilter(state, filter) {
		state.filter.tags = filter.tags
		state.filter = filter
	},

	addTaskForDeletion(state, { task }) {
		state.deletedTasks[task.key] = task
	},

	clearTaskFromDeletion(state, { task }) {
		if (state.deletedTasks[task.key] && task instanceof Task) {
			delete state.deletedTasks[task.key]
		}
	},

	/**
	 * Sets the delete countdown value
	 *
	 * @param {object} state The store data
	 * @param {object} data Destructuring object
	 * @param {Task} data.task The task
	 * @param {number} data.countdown The countdown value
	 */
	setTaskDeleteCountdown(state, { task, countdown }) {
		task.deleteCountdown = countdown
	},
}

const actions = {

	/**
	 * Creates a new task
	 *
	 * @param {object} context The store mutations
	 * @param {object} taskData The data of the new task
	 * @return {Promise}
	 */
	async createTask(context, taskData) {
		if (!taskData.calendar) {
			taskData.calendar = context.getters.getDefaultCalendar
		}

		// Don't try to create tasks in read-only calendars
		if (taskData.calendar.readOnly) {
			return
		}
		const task = new Task('BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Nextcloud Tasks v' + appVersion + '\nEND:VCALENDAR', taskData.calendar)

		const parsed = parseString(taskData.summary)

		task.created = ICAL.Time.fromJSDate(new Date(), true)
		task.summary = parsed.summary
		task.tags = parsed.tags
		task.hidesubtasks = 0
		if (taskData.priority) {
			task.priority = taskData.priority
		}
		if (taskData.complete) {
			task.complete = taskData.complete
		}
		if (taskData.note) {
			task.note = taskData.note
		}
		if (taskData.due) {
			task.due = taskData.due
		}
		if (taskData.start) {
			task.start = taskData.start
		}
		if (taskData.allDay) {
			task.allDay = taskData.allDay
		}
		if (taskData.related) {
			task.related = taskData.related
			// Check that parent task is not completed, uncomplete if necessary.
			if (task.complete !== 100) {
				const parent = context.getters.getParentTask(task)
				if (parent && parent.completed) {
					await context.dispatch('setPercentComplete', { task: parent, complete: 0 })
				}
			}
		}

		const vData = ICAL.stringify(task.jCal)

		if (!task.dav) {
			const response = await task.calendar.dav.createVObject(vData)
			task.dav = response
			task.syncStatus = new SyncStatus('success', t('tasks', 'Successfully created the task.'))
			context.commit('appendTask', task)
			context.commit('addTaskToCalendar', task)
			const parent = context.getters.getTaskByUid(task.related)
			context.commit('addTaskToParent', { task, parent })

			return task
		}
	},

	/**
	 * Deletes a task
	 *
	 * @param {object} context The store mutations
	 * @param {object} data Destructuring object
	 * @param {Task} data.task The task to delete
	 * @param {boolean} [data.dav] Trigger a dav deletion
	 */
	async deleteTask(context, { task, dav = true }) {
		// Don't try to delete tasks in read-only calendars
		if (task.calendar.readOnly) {
			return
		}
		// Don't delete tasks in shared calendars with access class not PUBLIC
		if (task.calendar.isSharedWithMe && task.class !== 'PUBLIC') {
			return
		}

		// Clear task from deletion array
		context.dispatch('clearTaskDeletion', task)

		/**
		 * Deletes a task from the store
		 */
		function deleteTaskFromStore() {
			context.commit('deleteTask', task)
			const parent = context.getters.getTaskByUid(task.related)
			context.commit('deleteTaskFromParent', { task, parent })
			context.commit('deleteTaskFromCalendar', task)
			// We emit the id of the deleted task, to close the sidebar in case it's open.
			emit('tasks:task:deleted', { taskId: task.uri })
			// Stop the delete timeout if no tasks are scheduled for deletion anymore
			if (Object.values(context.state.deletedTasks).length < 1) {
				clearInterval(context.state.deleteInterval)
				context.state.deleteInterval = null
			}
		}
		// Delete all subtasks first
		await Promise.all(Object.values(task.subTasks).map(async (subTask) => {
			await context.dispatch('deleteTask', { task: subTask, dav: true })
		}))
		// Only local delete if the task does not exist on the server
		if (task.dav && dav) {
			await task.dav.delete()
				.then(() => {
					deleteTaskFromStore()
				})
				.catch((error) => {
					console.debug(error)
					task.syncStatus = new SyncStatus('error', t('tasks', 'Could not delete the task.'))
				})
		} else {
			deleteTaskFromStore()
		}
	},

	/**
	 * Schedules a task for deletion
	 *
	 * @param {object} context The store context
	 * @param {Task} task The task to delete
	 * @return {Promise}
	 */
	async scheduleTaskDeletion(context, task) {
		// Don't try to delete tasks in read-only calendars
		if (task.calendar.readOnly) {
			return
		}
		// Don't delete tasks in shared calendars with access class not PUBLIC
		if (task.calendar.isSharedWithMe && task.class !== 'PUBLIC') {
			return
		}

		context.commit('addTaskForDeletion', { task })
		context.commit('setTaskDeleteCountdown', { task, countdown: 7 })
		// Start the delete timeout if it is not running
		if (context.state.deleteInterval === null) {
			context.state.deleteInterval = setInterval(async () => {
				Object.values(context.state.deletedTasks).forEach(task => {
					context.commit('setTaskDeleteCountdown', { task, countdown: --task.deleteCountdown })
					if (task.deleteCountdown <= 0) {
						context.dispatch('deleteTask', { task, dav: true })
					}
				})
			}, 1000)
		}
	},

	/**
	 * Cancels a scheduled task deletion
	 *
	 * @param {object} context The store context
	 * @param {Task} task The task to not delete
	 * @return {Promise}
	 */
	async clearTaskDeletion(context, task) {
		context.commit('clearTaskFromDeletion', { task })
		context.commit('setTaskDeleteCountdown', { task, countdown: null })
		// Stop the delete timeout if no tasks scheduled for deletion are left
		if (Object.values(context.state.deletedTasks).length === 0) {
			clearInterval(context.state.deleteInterval)
			context.state.deleteInterval = null
		}
	},

	/**
	 * Updates a task
	 *
	 * @param {object} context The store context
	 * @param {Task} task The task to update
	 * @return {Promise}
	 */
	async updateTask(context, task) {
		// If an update is currently running, we schedule another one an return
		if (task.updateRunning) {
			task.updateScheduled = true
			return
		}
		task.updateRunning = true
		task.updateScheduled = false
		// Don't try to update tasks in read-only calendars
		if (task.calendar.readOnly) {
			return
		}
		// Don't edit tasks in shared calendars with access class not PUBLIC
		if (task.calendar.isSharedWithMe && task.class !== 'PUBLIC') {
			return
		}

		const vCalendar = ICAL.stringify(task.jCal)

		if (!task.conflict) {
			task.dav.data = vCalendar
			task.syncStatus = new SyncStatus('sync', t('tasks', 'Synchronizing to the server.'))
			try {
				await task.dav.update()
				task.syncStatus = new SyncStatus('success', t('tasks', 'Task successfully saved to server.'))
			} catch (error) {
				// Wrong etag, we most likely have a conflict
				if (error && error.status === 412) {
					// Saving the new etag so that the user can manually
					// trigger a fetchCompleteData without any further errors
					task.conflict = error.xhr.getResponseHeader('etag')
					task.syncStatus = new SyncStatus('conflict', t('tasks', 'Could not update the task because it was changed on the server. Please click to refresh it, local changes will be discarded.'))
				} else {
					task.syncStatus = new SyncStatus('error', t('tasks', 'Could not update the task.'))
				}
			}
		} else {
			task.syncStatus = new SyncStatus('conflict', t('tasks', 'Could not update the task because it was changed on the server. Please click to refresh it, local changes will be discarded.'))
		}
		task.updateRunning = false
		// We have to run again if an update was scheduled in the meantime.
		if (task.updateScheduled) {
			await context.dispatch('updateTask', task)
		}
	},

	/**
	 * Retrieves the task with the given uri from the given calendar
	 * and commits the result
	 *
	 * @param {object} context The store mutations
	 * @param {object} data Destructuring object
	 * @param {Calendar} data.calendar The calendar
	 * @param {string} data.taskUri The uri of the requested task
	 * @return {Task}
	 */
	async getTaskByUri(context, { calendar, taskUri }) {
		const response = await calendar.dav.find(taskUri)
		if (response) {
			const task = new Task(response.data, calendar)
			task.dav = response
			if (task.related) {
				let parent = context.getters.getTaskByUid(task.related)
				// If the parent is not found locally, we try to get it from the server.
				if (!parent) {
					parent = await context.dispatch('getTaskByUid', { calendar, taskUid: task.related })
				}
				context.commit('addTaskToParent', { task, parent })
			}

			// In case we already have subtasks of this task in the store, add them as well.
			const subTasksInStore = context.getters.getTasksByParent(task)
			subTasksInStore.forEach(
				subTask => {
					context.commit('addTaskToParent', { task: subTask, parent: task })
				},
			)

			context.commit('appendTasksToCalendar', { calendar, tasks: [task] })
			context.commit('appendTasks', [task])
			return task
		} else {
			return null
		}
	},

	/**
	 * Retrieves the task with the given uid from the given calendar
	 * and commits the result
	 *
	 * @param {object} context The store mutations
	 * @param {object} data Destructuring object
	 * @param {Calendar} data.calendar The calendar
	 * @param {string} data.taskUid The uid of the requested task
	 * @return {Task}
	 */
	async getTaskByUid(context, { calendar, taskUid }) {
		const response = await findVTODObyUid(calendar, taskUid)
		// We expect to only get zero or one task when we query by UID.
		if (response.length) {
			const task = new Task(response[0].data, calendar)
			task.dav = response[0]
			if (task.related) {
				let parent = context.getters.getTaskByUid(task.related)
				// If the parent is not found locally, we try to get it from the server.
				if (!parent) {
					parent = await context.dispatch('getTaskByUid', { calendar, taskUid: task.related })
				}
				context.commit('addTaskToParent', { task, parent })
			}

			// In case we already have subtasks of this task in the store, add them as well.
			const subTasksInStore = context.getters.getTasksByParent(task)
			subTasksInStore.forEach(
				subTask => {
					context.commit('addTaskToParent', { task: subTask, parent: task })
				},
			)

			context.commit('appendTasksToCalendar', { calendar, tasks: [task] })
			context.commit('appendTasks', [task])
			return task
		} else {
			console.debug('no task')
			return null
		}
	},

	/**
	 * Toggles the completed state of a task
	 *
	 * @param {object} context The store context
	 * @param {Task} task The task to update
	 */
	async toggleCompleted(context, task) {
		// Don't try to edit tasks in read-only calendars
		if (task.calendar.readOnly) {
			return
		}
		// Don't edit tasks in shared calendars with access class not PUBLIC
		if (task.calendar.isSharedWithMe && task.class !== 'PUBLIC') {
			return
		}
		// Don't complete a task if it is still recurring, but update its start date instead
		if (task.recurring) {
			task.completeRecurring()
			await context.dispatch('updateTask', task)
			return
		}
		if (task.completed) {
			await context.dispatch('setPercentComplete', { task, complete: 0 })
		} else {
			await context.dispatch('setPercentComplete', { task, complete: 100 })
		}
	},

	/**
	 * Sets the percent complete property of a task
	 *
	 * @param {object} context The store context
	 * @param {Task} task The task to update
	 */
	async setPercentComplete(context, { task, complete }) {
		if (complete === task.complete) {
			return
		}
		if (complete < 100) {
			// uncomplete the parent task
			const parent = context.getters.getParentTask(task)
			if (parent && parent.closed) {
				await context.dispatch('setPercentComplete', { task: parent, complete: 0 })
			}
		} else {
			// complete all sub tasks
			await Promise.all(Object.values(task.subTasks).map(async (subTask) => {
				if (!subTask.closed) {
					await context.dispatch('setPercentComplete', { task: subTask, complete: 100 })
				}
			}))
		}
		context.commit('setComplete', { task, complete })
		context.dispatch('updateTask', task)
	},

	/**
	 * Toggles the visibility of a tasks subtasks
	 *
	 * @param {object} context The store context
	 * @param {Task} task The task to update
	 */
	async toggleSubtasksVisibility(context, task) {
		context.commit('toggleSubtasksVisibility', task)
		context.dispatch('updateTask', task)
	},

	/**
	 * Toggles the visibility of a tasks completed subtasks
	 *
	 * @param {object} context The store context
	 * @param {Task} task The task to update
	 */
	async toggleCompletedSubtasksVisibility(context, task) {
		context.commit('toggleCompletedSubtasksVisibility', task)
		context.dispatch('updateTask', task)
	},

	/**
	 * Toggles the starred state of a task
	 *
	 * @param {object} context The store context
	 * @param {Task} task The task to update
	 */
	async toggleStarred(context, task) {
		// Don't try to edit tasks in read-only calendars
		if (task.calendar.readOnly) {
			return
		}
		// Don't edit tasks in shared calendars with access class not PUBLIC
		if (task.calendar.isSharedWithMe && task.class !== 'PUBLIC') {
			return
		}
		context.commit('toggleStarred', task)
		context.dispatch('updateTask', task)
	},

	/**
	 * Toggles the pinned state of a task
	 *
	 * @param {object} context The store context
	 * @param {Task} task The task to update
	 */
	async togglePinned(context, task) {
		// Don't try to edit tasks in read-only calendars
		if (task.calendar.readOnly) {
			return
		}
		// Don't edit tasks in shared calendars with access class not PUBLIC
		if (task.calendar.isSharedWithMe && task.class !== 'PUBLIC') {
			return
		}
		context.commit('togglePinned', task)
		context.dispatch('updateTask', task)
	},

	/**
	 * Sets the summary of a task
	 *
	 * @param {object} context The store context
	 * @param {Task} task The task to update
	 */
	async setSummary(context, { task, summary }) {
		context.commit('setSummary', { task, summary })
		context.dispatch('updateTask', task)
	},

	/**
	 * Sets the note of a task
	 *
	 * @param {object} context The store context
	 * @param {Task} task The task to update
	 */
	async setNote(context, { task, note }) {
		if (note === task.note) {
			return
		}
		context.commit('setNote', { task, note })
		context.dispatch('updateTask', task)
	},

	/**
	 * Sets the tags of a task
	 *
	 * @param {object} context The store context
	 * @param {Task} task The task to update
	 */
	async setTags(context, { task, tags }) {
		context.commit('setTags', { task, tags })
		context.dispatch('updateTask', task)
	},

	/**
	 * Adds a tag to a task
	 *
	 * @param {object} context The store context
	 * @param {Task} task The task to update
	 */
	async addTag(context, { task, tag }) {
		context.commit('addTag', { task, tag })
		context.dispatch('updateTask', task)
	},

	/**
	 * Sets the priority of a task
	 *
	 * @param {object} context The store context
	 * @param {Task} task The task to update
	 */
	async setPriority(context, { task, priority }) {
		if (priority === task.priority) {
			return
		}
		// check priority to comply with RFC5545 (to be between 0 and 9)
		priority = (+priority < 0) ? 0 : (+priority > 9) ? 9 : Math.round(+priority)
		context.commit('setPriority', { task, priority })
		context.dispatch('updateTask', task)
	},

	/**
	 * Sets the location of a task
	 *
	 * @param {object} context The store context
	 * @param {Task} task The task to update
	 */
	async setLocation(context, { task, location }) {
		if (location === task.location) {
			return
		}
		context.commit('setLocation', { task, location })
		context.dispatch('updateTask', task)
	},

	/**
	 * Sets the URL of a task
	 *
	 * @param {object} context The store context
	 * @param {Task} task The task to update
	 */
	async setUrl(context, { task, url }) {
		if (url === task.customUrl) {
			return
		}
		context.commit('setUrl', { task, url })
		context.dispatch('updateTask', task)
	},

	/**
	 * Sets the classification of a task
	 *
	 * @param {object} context The store context
	 * @param {Task} task The task to update
	 */
	async setClassification(context, { task, classification }) {
		// check classification to comply with RFC5545 values
		classification = (['PUBLIC', 'PRIVATE', 'CONFIDENTIAL'].indexOf(classification) > -1) ? classification : null
		context.commit('setClassification', { task, classification })
		context.dispatch('updateTask', task)
	},

	/**
	 * Sets the status of a task
	 *
	 * @param {object} context The store context
	 * @param {Task} task The task to update
	 */
	async setStatus(context, { task, status }) {
		// check status to comply with RFC5545 values
		status = (['NEEDS-ACTION', 'COMPLETED', 'IN-PROCESS', 'CANCELLED'].indexOf(status) > -1) ? status : null
		if (status !== 'CANCELLED' && !task.completed) {
			// uncancel the parent task
			const parent = context.getters.getParentTask(task)
			if (parent && parent.closed) {
				await context.dispatch('setStatus', { task: parent, status: 'IN-PROCESS' })
			}
		} else {
			// set all open subtasks to cancelled
			await Promise.all(Object.values(task.subTasks).map(async (subTask) => {
				if (!subTask.closed) {
					await context.dispatch('setStatus', { task: subTask, status: 'CANCELLED' })
				}
			}))
		}
		context.commit('setStatus', { task, status })
		context.dispatch('updateTask', task)
	},

	/**
	 * Sets the sort order of a task
	 *
	 * @param {object} context The store context
	 * @param {object} data Destructuring object
	 * @param {Task} data.task The task to update
	 * @param {number} data.order The sort order
	 */
	async setSortOrder(context, { task, order }) {
		if (task.sortOrder === order) {
			return
		}
		context.commit('setSortOrder', { task, order })
		context.dispatch('updateTask', task)
	},

	/**
	 * Sets the due date of a task
	 *
	 * @param {object} context The store context
	 * @param {Task} task The task to update
	 */
	async setDue(context, { task, due, allDay }) {
		context.commit('setDue', { task, due, allDay })
		context.dispatch('updateTask', task)
	},

	/**
	 * Sets the start date of a task
	 *
	 * @param {object} context The store context
	 * @param {Task} task The task to update
	 */
	async setStart(context, { task, start, allDay }) {
		context.commit('setStart', { task, start, allDay })
		context.dispatch('updateTask', task)
	},

	/**
	 * Sets the start or due date to the given day
	 *
	 * @param {object} context The store context
	 * @param {object} data Destructuring object
	 * @param {Task} data.task The task to update
	 * @param {number} data.day The day to set
	 */
	async setDate(context, { task, day }) {
		const start = task.startMoment.startOf('day')
		const due = task.dueMoment.startOf('day')
		day = moment().startOf('day').add(day, 'days')

		let diff
		// Adjust start date
		if (start.isValid()) {
			diff = start.diff(moment().startOf('day'), 'days')
			diff = diff < 0 ? 0 : diff
			if (diff !== day) {
				const newStart = task.startMoment.year(day.year()).month(day.month()).date(day.date())
				context.commit('setStart', { task, start: newStart })
				context.dispatch('updateTask', task)
			}
		// Adjust due date
		} else if (due.isValid()) {
			diff = due.diff(moment().startOf('day'), 'days')
			diff = diff < 0 ? 0 : diff
			if (diff !== day) {
				const newDue = task.dueMoment.year(day.year()).month(day.month()).date(day.date())
				context.commit('setDue', { task, due: newDue })
				context.dispatch('updateTask', task)
			}
		// Set the due date to appropriate value
		} else {
			context.commit('setDue', { task, due: day })
			context.dispatch('updateTask', task)
		}
	},

	/**
	 * Toggles if due and start date of a task are all-day
	 *
	 * @param {object} context The store context
	 * @param {Task} task The task to update
	 */
	async toggleAllDay(context, task) {
		// Don't try to toggle tasks from read-only calendars
		if (task.calendar.readOnly) {
			return task
		}
		// Don't edit tasks in shared calendars with access class not PUBLIC
		if (task.calendar.isSharedWithMe && task.class !== 'PUBLIC') {
			return
		}
		context.commit('toggleAllDay', task)
		if (+context.rootState.settings.settings.allDay !== +task.allDay) {
			context.dispatch('setSetting', { type: 'allDay', value: +task.allDay })
		}
		context.dispatch('updateTask', task)
	},

	/**
	 * Fetch the full vObject from the dav server
	 *
	 * @param {object} context The store mutations
	 * @param {object} data Destructuring object
	 * @param {Task} data.task The task to fetch
	 * @return {Promise}
	 */
	async fetchFullTask(context, { task }) {
		if (task.conflict !== '') {
			await context.commit('updateTaskEtag', { task })
		}
		return task.dav.fetchCompleteData()
			.then((response) => {
				const newTask = new Task(task.dav.data, task.calendar)
				task.syncStatus = new SyncStatus('success', t('tasks', 'Successfully updated the task.'))
				task.conflict = false
				context.commit('updateTask', newTask)
			})
			.catch((error) => { throw error })
	},

	/**
	 * Moves a task to a new parent task
	 *
	 * @param {object} context The store mutations
	 * @param {object} data Destructuring object
	 * @param {Task} data.task The task to move
	 * @param {Task} data.parent The new parent task
	 */
	async setTaskParent(context, { task, parent }) {
		const parentId = parent ? parent.uid : null
		// Only update the parent in case it differs from the current one.
		if (task.related !== parentId) {
			// Remove the task from the old parents subtask list
			const oldParent = context.getters.getTaskByUid(task.related)
			context.commit('deleteTaskFromParent', { task, parent: oldParent })
			// Link to new parent
			task.related = parentId
			// Add task to new parents subtask list
			if (parent) {
				parent.subTasks[task.uid] = task
				// If the parent is completed, we complete the task
				if (parent.completed) {
					await context.dispatch('setPercentComplete', { task, complete: 100 })
				}
			}
			// We have to send an update.
			await context.dispatch('updateTask', task)
		}
	},

	/**
	 * Moves a task to a new calendar or parent task
	 *
	 * @param {object} context The store mutations
	 * @param {object} data Destructuring object
	 * @param {Task} data.task The task to move
	 * @param {Calendar} data.calendar The calendar to move the task to
	 * @param {Task} data.parent The new parent task
	 * @return {Task} The moved task
	 */
	async moveTask(context, { task, calendar, parent = null }) {
		// Don't try to move tasks from read-only calendars
		if (task.calendar.readOnly) {
			return task
		}
		// Don't move tasks with access class not PUBLIC from or to calendars shared with me
		if ((task.calendar.isSharedWithMe || calendar.isSharedWithMe) && task.class !== 'PUBLIC') {
			return
		}
		// Don't move if source and target calendar are the same.
		if (task.dav && task.calendar !== calendar) {
			// Move all subtasks first
			await Promise.all(Object.values(task.subTasks).map(async (subTask) => {
				await context.dispatch('moveTask', { task: subTask, calendar, parent: task })
			}))

			await task.dav.move(calendar.dav)
				.then((response) => {
					context.commit('deleteTaskFromCalendar', task)
					context.commit('deleteTask', task)
					// Update the calendar of the task
					context.commit('setTaskCalendar', { task, calendar })
					// Remove the task from the calendar, add it to the new one
					context.commit('addTaskToCalendar', task)
					context.commit('appendTask', task)
					task.syncStatus = new SyncStatus('success', t('tasks', 'Task successfully moved to new calendar.'))
				})
				.catch((error) => {
					console.error(error)
					showError(t('tasks', 'An error occurred'))
				})
		}

		// Set the new parent
		await context.dispatch('setTaskParent', { task, parent })

		return task
	},
}

export default { state, getters, mutations, actions }

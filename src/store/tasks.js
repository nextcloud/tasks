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

import Task from '../models/task.js'
import { isParentInList, momentToICALTime } from './storeHelper.js'
import TaskStatus from '../models/taskStatus.js'
import router from '../router.js'
import { findVTODObyUid } from './cdav-requests.js'

import { showError } from '@nextcloud/dialogs'
import moment from '@nextcloud/moment'

import ICAL from 'ical.js'
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
	tasks: {},
	searchQuery: '',
}

const getters = {
	/**
	 * Returns all tasks corresponding to the calendar
	 *
	 * @param {Object} state The store data
	 * @param {Object} getters The store getters
	 * @param {Object} rootState The store root state
	 * @param {String} calendarId The Id of the calendar in question
	 * @returns {Array} The tasks
	 */
	getTasksByCalendarId: (state, getters, rootState) => (calendarId) => {
		const calendar = getters.getCalendarById(calendarId)
		if (calendar) {
			return Object.values(calendar.tasks)
		}
	},

	/**
	 * Returns all tasks corresponding to current route value
	 *
	 * @param {Object} state The store data
	 * @param {Object} getters The store getters
	 * @param {Object} rootState The store root state
	 * @returns {Array} The tasks
	 */
	getTasksByRoute: (state, getters, rootState) => {
		return getters.getTasksByCalendarId(rootState.route.params.calendarId)
	},

	/**
	 * Returns all tasks which are direct children of the current task
	 *
	 * @param {Object} state The store data
	 * @param {Object} getters The store getters
	 * @param {Object} rootState The store root state
	 * @param {Object} parent The parent task
	 * @returns {Array} The sub-tasks of the current task
	 */
	getTasksByParent: (state, getters, rootState) => (parent) => {
		return getters.getTasksByCalendarId(parent.calendar.id)
			.filter(task => {
				return task.related === parent.uid
			})
	},

	/**
	 * Returns all tasks of all calendars
	 *
	 * @param {Object} state The store data
	 * @param {Object} getters The store getters
	 * @param {Object} rootState The store root state
	 * @returns {Array} All tasks in store
	 */
	getAllTasks: (state, getters, rootState) => {
		let tasks = []
		rootState.calendars.calendars.forEach(calendar => {
			tasks = tasks.concat(Object.values(calendar.tasks))
		})
		return tasks
	},

	/**
	 * Returns the task currently opened by route
	 *
	 * @param {Object} state The store data
	 * @param {Object} getters The store getters
	 * @param {Object} rootState The store root state
	 * @returns {Task} The task
	 */
	getTaskByRoute: (state, getters, rootState) => {
		// If a calendar is given, only search in that calendar.
		if (rootState.route.params.calendarId) {
			const calendar = getters.getCalendarById(rootState.route.params.calendarId)
			if (!calendar) {
				return null
			}
			return Object.values(calendar.tasks).find(task => {
				return task.uri === rootState.route.params.taskId
			})
		}
		// Else, we have to search all calendars
		return getters.getTaskByUri(rootState.route.params.taskId)
	},

	/**
	 * Returns the task by Uri
	 *
	 * @param {Object} state The store data
	 * @param {Object} getters The store getters
	 * @param {Object} rootState The store root state
	 * @param {String} taskUri The Uri of the task in question
	 * @returns {Task} The task
	 */
	getTaskByUri: (state, getters, rootState) => (taskUri) => {
		// We have to search in all calendars
		let task
		for (const calendar of rootState.calendars.calendars) {
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
	 * @param {Object} state The store data
	 * @param {Object} getters The store getters
	 * @param {Object} rootState The store root state
	 * @param {String} taskUid The Uid of the task in question
	 * @returns {Task} The task
	 */
	getTaskByUid: (state, getters, rootState) => (taskUid) => {
		// We have to search in all calendars
		let task
		for (const calendar of rootState.calendars.calendars) {
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
	 * @param {Object} tasks The tasks to search in
	 * @returns {Array}
	 */
	findRootTasks: () => (tasks) => {
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
	 * Returns the completed root tasks from a given object
	 *
	 * @param {Object} tasks The tasks to search in
	 * @returns {Array}
	 */
	findCompletedRootTasks: () => (tasks) => {
		return Object.values(tasks).filter(task => {
			/**
			 * Check if the task has the related field set.
			 * If it has, then check if the parent task is available
			 * (otherwise it might happen, that this task is not shown at all)
			 */
			return (!task.related || !isParentInList(task, tasks)) && task.completed
		})
	},

	/**
	 * Returns the not completed root tasks from a given object
	 *
	 * @param {Object} tasks The tasks to search in
	 * @returns {Array}
	 */
	findUncompletedRootTasks: () => (tasks) => {
		return Object.values(tasks).filter(task => {
			/**
			 * Check if the task has the related field set.
			 * If it has, then check if the parent task is available
			 * (otherwise it might happen, that this task is not shown at all)
			 */
			return (!task.related || !isParentInList(task, tasks)) && !task.completed
		})
	},

	/**
	 * Returns the parent task of a given task
	 *
	 * @param {Task} task The task of which to find the parent
	 * @returns {Task} The parent task
	 */
	getParentTask: () => (task) => {
		const tasks = task.calendar.tasks
		return Object.values(tasks).find(search => search.uid === task.related) || null
	},

	/**
	 * Returns the current search query
	 *
	 * @param {Object} state The store data
	 * @param {Object} getters The store getters
	 * @param {Object} rootState The store root state
	 * @returns {String} The current search query
	 */
	searchQuery: (state, getters, rootState) => {
		return state.searchQuery
	},

	/**
	 * Returns all categories of all tasks
	 *
	 * @param {Object} state The store data
	 * @param {Object} getters The store getters
	 * @returns {Array} All categories
	 */
	categories: (state, getters) => {
		const tasks = getters.getAllTasks
		return tasks.reduce((categories, task) => {
			// Add each category to the categories array if it's not present yet
			task.categories.forEach((category) => {
				if (!categories.includes(category)) {
					categories.push(category)
				}
			})
			return categories
		}, [])
	},
}

const mutations = {

	/**
	 * Stores tasks into state
	 *
	 * @param {Object} state Default state
	 * @param {Array<Task>} tasks Tasks
	 */
	appendTasks(state, tasks = []) {
		state.tasks = tasks.reduce(function(list, task) {
			if (task instanceof Task) {
				Vue.set(list, task.key, task)
			} else {
				console.error('Wrong task object', task)
			}
			return list
		}, state.tasks)
	},

	/**
	 * Stores task into state
	 *
	 * @param {Object} state Default state
	 * @param {Task} task The task to append
	 */
	appendTask(state, task) {
		Vue.set(state.tasks, task.key, task)
	},

	/**
	 * Deletes a task from state
	 *
	 * @param {Object} state Default state
	 * @param {Task} task The task to delete
	 */
	deleteTask(state, task) {
		if (state.tasks[task.key] && task instanceof Task) {
			Vue.delete(state.tasks, task.key)
		}
	},

	/**
	 * Deletes a task from the parent
	 *
	 * @param {Object} state The store data
	 * @param {Task} task The task to delete from the parents subtask list
	 * @param {Task} parent The paren task
	 */
	deleteTaskFromParent(state, { task, parent }) {
		if (task instanceof Task) {
			// Remove task from parents subTask list if necessary
			if (task.related && parent) {
				Vue.delete(parent.subTasks, task.uid)
			}
		}
	},

	/**
	 * Adds a task to parent task as subtask
	 *
	 * @param {Object} state The store data
	 * @param {Task} task The task to add to the parents subtask list
	 * @param {Task} parent The paren task
	 */
	addTaskToParent(state, { task, parent }) {
		if (task.related && parent) {
			Vue.set(parent.subTasks, task.uid, task)
		}
	},

	/**
	 * Toggles the completed state of a task
	 *
	 * @param {Object} state The store data
	 * @param {Task} task The task
	 */
	setComplete(state, { task, complete }) {
		Vue.set(task, 'complete', complete)
	},

	/**
	 * Toggles the starred state of a task
	 *
	 * @param {Object} state The store data
	 * @param {Task} task The task
	 */
	toggleStarred(state, task) {
		if (+task.priority < 1 || +task.priority > 4) {
			Vue.set(task, 'priority', 1)
		} else {
			Vue.set(task, 'priority', 0)
		}
	},

	/**
	 * Toggles the pinned state of a task
	 *
	 * @param {Object} state The store data
	 * @param {Task} task The task
	 */
	togglePinned(state, task) {
		Vue.set(task, 'pinned', !task.pinned)
	},

	/**
	 * Toggles the visibility of the subtasks
	 *
	 * @param {Object} state The store data
	 * @param {Task} task The task
	 */
	toggleSubtasksVisibility(state, task) {
		Vue.set(task, 'hideSubtasks', !task.hideSubtasks)
	},

	/**
	 * Toggles the visibility of the completed subtasks
	 *
	 * @param {Object} state The store data
	 * @param {Task} task The task
	 */
	toggleCompletedSubtasksVisibility(state, task) {
		Vue.set(task, 'hideCompletedSubtasks', !task.hideCompletedSubtasks)
	},

	/**
	 * Sets the summary of a task
	 *
	 * @param {Object} state The store data
	 * @param {Task} task The task
	 * @param {String} summary The summary
	 */
	setSummary(state, { task, summary }) {
		Vue.set(task, 'summary', summary)
	},

	/**
	 * Sets the note of a task
	 *
	 * @param {Object} state The store data
	 * @param {Task} task The task
	 * @param {String} note The note
	 */
	setNote(state, { task, note }) {
		Vue.set(task, 'note', note)
	},

	/**
	 * Sets the categories of a task
	 *
	 * @param {Object} state The store data
	 * @param {Task} task The task
	 * @param {Array} categories The array of categories
	 */
	setCategories(state, { task, categories }) {
		Vue.set(task, 'categories', categories)
	},

	/**
	 * Adds a category to a task
	 *
	 * @param {Object} state The store data
	 * @param {Task} task The task
	 * @param {String} category The category to add
	 */
	addCategory(state, { task, category }) {
		Vue.set(task, 'categories', task.categories.concat([category]))
	},

	/**
	 * Sets the priority of a task
	 *
	 * @param {Object} state The store data
	 * @param {Task} task The task
	 * @param {String} priority The priority
	 */
	setPriority(state, { task, priority }) {
		Vue.set(task, 'priority', priority)
	},

	/**
	 * Sets the classification of a task
	 *
	 * @param {Object} state The store data
	 * @param {Task} task The task
	 * @param {String} classification The classification
	 */
	setClassification(state, { task, classification }) {
		Vue.set(task, 'class', classification)
	},

	/**
	 * Sets the status of a task
	 *
	 * @param {Object} state The store data
	 * @param {Task} task The task
	 * @param {String} status The status
	 */
	setStatus(state, { task, status }) {
		Vue.set(task, 'status', status)
	},

	/**
	 * Sets the sort order of a task
	 *
	 * @param {Object} state The store data
	 * @param {Task} task The task
	 * @param {Integer} order The sort order
	 */
	setSortOrder(state, { task, order }) {
		Vue.set(task, 'sortOrder', order)
	},

	/**
	 * Sets the due date of a task
	 *
	 * @param {Object} state The store data
	 * @param {Task} task The task
	 * @param {Moment} due The due date moment
	 * @param {Boolean} allDay Whether the date is all-day
	 */
	setDue(state, { task, due, allDay }) {
		if (due === null) {
			// If the date is null, just set (remove) it.
			Vue.set(task, 'due', due)
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
				Vue.set(task, 'start', momentToICALTime(start, allDay))
			}
			// Set the due date, convert it to ICALTime first.
			Vue.set(task, 'due', momentToICALTime(due, allDay))
		}
	},

	/**
	 * Sets the start date of a task
	 *
	 * @param {Object} state The store data
	 * @param {Task} task The task
	 * @param {Moment} start The start date moment
	 * @param {Boolean} allDay Whether the date is all-day
	 */
	setStart(state, { task, start, allDay }) {
		if (start === null) {
			// If the date is null, just set (remove) it.
			Vue.set(task, 'start', start)
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
				Vue.set(task, 'due', momentToICALTime(due, allDay))
			}
			// Set the due date, convert it to ICALTime first.
			Vue.set(task, 'start', momentToICALTime(start, allDay))
		}
	},

	/**
	 * Toggles if the start and due dates of a task are all day
	 *
	 * @param {Object} state The store data
	 * @param {Task} task The task
	 */
	toggleAllDay(state, task) {
		Vue.set(task, 'allDay', !task.allDay)
	},

	/**
	 * Move task to a different calendar
	 *
	 * @param {Object} state The store data
	 * @param {Task} task The task
	 * @param {Calendar} calendar The calendar to move the task to
	 */
	setTaskCalendar(state, { task, calendar }) {
		Vue.set(task, 'calendar', calendar)
	},

	/**
	 * Move task to a different calendar
	 *
	 * @param {Object} state The store data
	 * @param {Task} task The task
	 * @param {String} related The uid of the related task
	 */
	setTaskParent(state, { task, related }) {
		Vue.set(task, 'related', related)
	},

	/**
	 * Update a task etag
	 *
	 * @param {Object} state The store data
	 * @param {Object} data Destructuring object
	 * @param {Task} task The task to update
	 * @param {string} etag The task etag
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
	 * @param {Object} state The store data
	 * @param {Object} data Destructuring object
	 * @param {Task} task The task to update
	 */
	resetStatus(state, { task }) {
		if (state.tasks[task.key] && task instanceof Task) {
			// replace task object data
			state.tasks[task.key].syncstatus = null
		}
	},

	/**
	 * Update a task
	 *
	 * @param {Object} state The store data
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
	 * @param {Object} state The store data
	 * @param {String} searchQuery The search query
	 */
	setSearchQuery(state, searchQuery) {
		state.searchQuery = searchQuery
	},
}

const actions = {

	/**
	 * Creates a new task
	 *
	 * @param {Object} context The store mutations
	 * @param {Object} taskData The data of the new task
	 * @returns {Promise}
	 */
	async createTask(context, taskData) {
		if (!taskData.calendar) {
			taskData.calendar = context.getters.getDefaultCalendar
		}

		// Don't try to create tasks in read-only calendars
		if (taskData.calendar.readOnly) {
			return
		}

		const task = new Task('BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Nextcloud Tasks v' + $appVersion + '\nEND:VCALENDAR', taskData.calendar)

		task.created = ICAL.Time.now()
		task.summary = taskData.summary
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
			await task.calendar.dav.createVObject(vData)
				.then((response) => {
					Vue.set(task, 'dav', response)
					task.syncstatus = new TaskStatus('success', OCA.Tasks.$t('tasks', 'Successfully created the task.'))
					context.commit('appendTask', task)
					context.commit('addTaskToCalendar', task)
					const parent = context.getters.getTaskByUid(task.related)
					context.commit('addTaskToParent', { task, parent })

					// Open the details view for the new task
					const calendarId = context.rootState.route.params.calendarId
					const collectionId = context.rootState.route.params.collectionId
					// Only open the details view if there is enough space or if it is already open.
					if (document.documentElement.clientWidth >= 768 || context.rootState.route.params.taskId !== undefined) {
						if (calendarId) {
							router.push({ name: 'calendarsTask', params: { calendarId, taskId: task.uri } })
						} else if (collectionId) {
							if (collectionId === 'week') {
								router.push({
									name: 'collectionsParamTask',
									params: { collectionId, taskId: task.uri, collectionParam: '0' },
								})
							} else {
								router.push({ name: 'collectionsTask', params: { collectionId, taskId: task.uri } })
							}
						}
					}

				})
				.catch((error) => { throw error })
		}
	},

	/**
	 * Deletes a task
	 *
	 * @param {Object} context The store mutations
	 * @param {Object} data Destructuring object
	 * @param {Task} data.task The task to delete
	 * @param {Boolean} [data.dav = true] Trigger a dav deletion
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

		function deleteTaskFromStore() {
			context.commit('deleteTask', task)
			const parent = context.getters.getTaskByUid(task.related)
			context.commit('deleteTaskFromParent', { task, parent })
			context.commit('deleteTaskFromCalendar', task)
		}
		// delete all subtasks first
		await Promise.all(Object.values(task.subTasks).map(async(subTask) => {
			await context.dispatch('deleteTask', { task: subTask, dav: true })
		}))
		// only local delete if the task doesn't exists on the server
		if (task.dav && dav) {
			await task.dav.delete()
				.then(() => {
					deleteTaskFromStore()
				})
				.catch((error) => {
					console.debug(error)
					task.syncstatus = new TaskStatus('error', OCA.Tasks.$t('tasks', 'Could not delete the task.'))
				})
		} else {
			deleteTaskFromStore()
		}
	},

	/**
	 * Schedules an update request for a given task
	 *
	 * @param {Object} context The store context
	 * @param {Task} task The task to update
	 * @returns {Promise}
	 */
	async scheduleTaskUpdate(context, task) {
		// If there already is an update request scheduled that has not started yet,
		// we don't have to schedule another one.
		if (!task.updateQueue.size) {
			task.updateQueue.add(() => context.dispatch('updateTask', task))
		}
	},

	/**
	 * Updates a task
	 *
	 * @param {Object} context The store context
	 * @param {Task} task The task to update
	 * @returns {Promise}
	 */
	async updateTask(context, task) {
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
			task.syncstatus = new TaskStatus('sync', OCA.Tasks.$t('tasks', 'Synchronizing to the server.'))
			return task.dav.update()
				.then((response) => {
					task.syncstatus = new TaskStatus('success', OCA.Tasks.$t('tasks', 'Task successfully saved to server.'))
				})
				.catch((error) => {
					// Wrong etag, we most likely have a conflict
					if (error && error.status === 412) {
						// Saving the new etag so that the user can manually
						// trigger a fetchCompleteData without any further errors
						task.conflict = error.xhr.getResponseHeader('etag')
						task.syncstatus = new TaskStatus('refresh', OCA.Tasks.$t('tasks', 'Could not update the task because it was changed on the server. Please click to refresh it, local changes will be discarded.'), 'fetchFullTask')
					} else {
						task.syncstatus = new TaskStatus('error', OCA.Tasks.$t('tasks', 'Could not update the task.'))
					}
				})
		} else {
			task.syncstatus = new TaskStatus('refresh', OCA.Tasks.$t('tasks', 'Could not update the task because it was changed on the server. Please click to refresh it, local changes will be discarded.'), 'fetchFullTask')
		}
	},

	/**
	 * Retrieves the task with the given uri from the given calendar
	 * and commits the result
	 *
	 * @param {Object} context The store mutations
	 * @param {Object} data Destructuring object
	 * @param {Calendar} data.calendar The calendar
	 * @param {String} data.taskUri The uri of the requested task
	 * @returns {Task}
	 */
	async getTaskByUri(context, { calendar, taskUri }) {
		const response = await calendar.dav.find(taskUri)
		if (response) {
			const task = new Task(response.data, calendar)
			Vue.set(task, 'dav', response)
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
				}
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
	 * @param {Object} context The store mutations
	 * @param {Object} data Destructuring object
	 * @param {Calendar} data.calendar The calendar
	 * @param {String} data.taskUid The uid of the requested task
	 * @returns {Task}
	 */
	async getTaskByUid(context, { calendar, taskUid }) {
		const response = await findVTODObyUid(calendar, taskUid)
		// We expect to only get zero or one task when we query by UID.
		if (response.length) {
			const task = new Task(response[0].data, calendar)
			Vue.set(task, 'dav', response[0])
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
				}
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
	 * @param {Object} context The store context
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
		if (task.completed) {
			await context.dispatch('setPercentComplete', { task, complete: 0 })
		} else {
			await context.dispatch('setPercentComplete', { task, complete: 100 })
		}
	},

	/**
	 * Sets the percent complete property of a task
	 *
	 * @param {Object} context The store context
	 * @param {Task} task The task to update
	 */
	async setPercentComplete(context, { task, complete }) {
		if (complete < 100) {
			// uncomplete the parent task
			const parent = context.getters.getParentTask(task)
			if (parent && parent.completed) {
				await context.dispatch('setPercentComplete', { task: parent, complete: 0 })
			}
		} else {
			// complete all sub tasks
			await Promise.all(Object.values(task.subTasks).map(async(subTask) => {
				if (!subTask.completed) {
					await context.dispatch('setPercentComplete', { task: subTask, complete: 100 })
				}
			}))
		}
		context.commit('setComplete', { task, complete })
		context.dispatch('scheduleTaskUpdate', task)
	},

	/**
	 * Toggles the visibility of a tasks subtasks
	 *
	 * @param {Object} context The store context
	 * @param {Task} task The task to update
	 */
	async toggleSubtasksVisibility(context, task) {
		context.commit('toggleSubtasksVisibility', task)
		context.dispatch('scheduleTaskUpdate', task)
	},

	/**
	 * Toggles the visibility of a tasks completed subtasks
	 *
	 * @param {Object} context The store context
	 * @param {Task} task The task to update
	 */
	async toggleCompletedSubtasksVisibility(context, task) {
		context.commit('toggleCompletedSubtasksVisibility', task)
		context.dispatch('scheduleTaskUpdate', task)
	},

	/**
	 * Toggles the starred state of a task
	 *
	 * @param {Object} context The store context
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
		context.dispatch('scheduleTaskUpdate', task)
	},

	/**
	 * Toggles the pinned state of a task
	 *
	 * @param {Object} context The store context
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
		context.dispatch('scheduleTaskUpdate', task)
	},

	/**
	 * Sets the summary of a task
	 *
	 * @param {Object} context The store context
	 * @param {Task} task The task to update
	 */
	async setSummary(context, { task, summary }) {
		context.commit('setSummary', { task, summary })
		context.dispatch('scheduleTaskUpdate', task)
	},

	/**
	 * Sets the note of a task
	 *
	 * @param {Object} context The store context
	 * @param {Task} task The task to update
	 */
	async setNote(context, { task, note }) {
		context.commit('setNote', { task, note })
		context.dispatch('scheduleTaskUpdate', task)
	},

	/**
	 * Sets the categories of a task
	 *
	 * @param {Object} context The store context
	 * @param {Task} task The task to update
	 */
	async setCategories(context, { task, categories }) {
		context.commit('setCategories', { task, categories })
		context.dispatch('scheduleTaskUpdate', task)
	},

	/**
	 * Adds a category to a task
	 *
	 * @param {Object} context The store context
	 * @param {Task} task The task to update
	 */
	async addCategory(context, { task, category }) {
		context.commit('addCategory', { task, category })
		context.dispatch('scheduleTaskUpdate', task)
	},

	/**
	 * Sets the priority of a task
	 *
	 * @param {Object} context The store context
	 * @param {Task} task The task to update
	 */
	async setPriority(context, { task, priority }) {
		// check priority to comply with RFC5545 (to be between 0 and 9)
		priority = (+priority < 0) ? 0 : (+priority > 9) ? 9 : Math.round(+priority)
		context.commit('setPriority', { task, priority })
		context.dispatch('scheduleTaskUpdate', task)
	},

	/**
	 * Sets the classification of a task
	 *
	 * @param {Object} context The store context
	 * @param {Task} task The task to update
	 */
	async setClassification(context, { task, classification }) {
		// check classification to comply with RFC5545 values
		classification = (['PUBLIC', 'PRIVATE', 'CONFIDENTIAL'].indexOf(classification) > -1) ? classification : null
		context.commit('setClassification', { task, classification })
		context.dispatch('scheduleTaskUpdate', task)
	},

	/**
	 * Sets the status of a task
	 *
	 * @param {Object} context The store context
	 * @param {Task} task The task to update
	 */
	async setStatus(context, { task, status }) {
		// check status to comply with RFC5545 values
		status = (['NEEDS-ACTION', 'COMPLETED', 'IN-PROCESS', 'CANCELLED'].indexOf(status) > -1) ? status : null
		context.commit('setStatus', { task, status })
		context.dispatch('scheduleTaskUpdate', task)
	},

	/**
	 * Sets the sort order of a task
	 *
	 * @param {Object} context The store context
	 * @param {Task} task The task to update
	 * @param {Integer} order The sort order
	 */
	async setSortOrder(context, { task, order }) {
		if (task.sortOrder === order) {
			return
		}
		context.commit('setSortOrder', { task, order })
		context.dispatch('scheduleTaskUpdate', task)
	},

	/**
	 * Sets the due date of a task
	 *
	 * @param {Object} context The store context
	 * @param {Task} task The task to update
	 */
	async setDue(context, { task, due, allDay }) {
		context.commit('setDue', { task, due, allDay })
		context.dispatch('scheduleTaskUpdate', task)
	},

	/**
	 * Sets the start date of a task
	 *
	 * @param {Object} context The store context
	 * @param {Task} task The task to update
	 */
	async setStart(context, { task, start, allDay }) {
		context.commit('setStart', { task, start, allDay })
		context.dispatch('scheduleTaskUpdate', task)
	},

	/**
	 * Sets the start or due date to the given day
	 *
	 * @param {Object} context The store context
	 * @param {Task} task The task to update
	 * @param {Integer} day The day to set
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
				context.dispatch('scheduleTaskUpdate', task)
			}
		// Adjust due date
		} else if (due.isValid()) {
			diff = due.diff(moment().startOf('day'), 'days')
			diff = diff < 0 ? 0 : diff
			if (diff !== day) {
				const newDue = task.dueMoment.year(day.year()).month(day.month()).date(day.date())
				context.commit('setDue', { task, due: newDue })
				context.dispatch('scheduleTaskUpdate', task)
			}
		// Set the due date to appropriate value
		} else {
			context.commit('setDue', { task, due: day })
			context.dispatch('scheduleTaskUpdate', task)
		}
	},

	/**
	 * Toggles if due and start date of a task are all-day
	 *
	 * @param {Object} context The store context
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
		context.dispatch('scheduleTaskUpdate', task)
	},

	/**
	 * Fetch the full vObject from the dav server
	 *
	 * @param {Object} context The store mutations
	 * @param {Object} data Destructuring object
	 * @param {Task} data.task The task to fetch
	 * @param {string} data.etag The task etag to override in case of conflict
	 * @returns {Promise}
	 */
	async fetchFullTask(context, { task }) {
		if (task.conflict !== '') {
			await context.commit('updateTaskEtag', { task })
		}
		return task.dav.fetchCompleteData()
			.then((response) => {
				const newTask = new Task(task.dav.data, task.calendar)
				task.syncstatus = new TaskStatus('success', OCA.Tasks.$t('tasks', 'Successfully updated the task.'))
				task.conflict = false
				context.commit('updateTask', newTask)
			})
			.catch((error) => { throw error })
	},

	/**
	 * Moves a task to a new parent task
	 *
	 * @param {Object} context The store mutations
	 * @param {Object} data Destructuring object
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
			Vue.set(task, 'related', parentId)
			// Add task to new parents subtask list
			if (parent) {
				Vue.set(parent.subTasks, task.uid, task)
				// If the parent is completed, we complete the task
				if (parent.completed) {
					await context.dispatch('setPercentComplete', { task, complete: 100 })
				}
			}
			// We have to send an update.
			await context.dispatch('scheduleTaskUpdate', task)
		}
	},

	/**
	 * Moves a task to a new calendar or parent task
	 *
	 * @param {Object} context The store mutations
	 * @param {Object} data Destructuring object
	 * @param {Task} data.task The task to move
	 * @param {Calendar} data.calendar The calendar to move the task to
	 * @param {Task} data.parent The new parent task
	 * @returns {Task} The moved task
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
			await Promise.all(Object.values(task.subTasks).map(async(subTask) => {
				await context.dispatch('moveTask', { task: subTask, calendar, parent: task })
			}))

			await task.dav.move(calendar.dav)
				.then((response) => {
					context.commit('deleteTaskFromCalendar', task)
					// Update the calendar of the task
					context.commit('setTaskCalendar', { task, calendar })
					// Remove the task from the calendar, add it to the new one
					context.commit('addTaskToCalendar', task)
					task.syncstatus = new TaskStatus('success', OCA.Tasks.$t('tasks', 'Task successfully moved to new calendar.'))
				})
				.catch((error) => {
					console.error(error)
					showError(OCA.Tasks.$t('tasks', 'An error occurred'))
				})
		}

		// Set the new parent
		await context.dispatch('setTaskParent', { task, parent })

		return task
	},
}

export default { state, getters, mutations, actions }

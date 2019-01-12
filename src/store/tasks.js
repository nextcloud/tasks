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
'use strict'

import Vue from 'vue'
import Vuex from 'vuex'
import Task from '../models/task'
import { isParentInList } from './storeHelper'
import ICAL from 'ical.js'

Vue.use(Vuex)

const state = {
	tasks: {}
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
		var calendar = getters.getCalendarById(calendarId)
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
		var tasks = []
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
			var calendar = getters.getCalendarById(rootState.route.params.calendarId)
			if (!calendar) {
				return null
			}
			return Object.values(calendar.tasks).find(task => {
				return task.uri === rootState.route.params.taskId
			})
		}
		// Else, we have to search all calendars
		var task
		for (let calendar of rootState.calendars.calendars) {
			task = Object.values(calendar.tasks).find(task => {
				return task.uri === rootState.route.params.taskId
			})
			if (task) return task
		}
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
		let tasks = task.calendar.tasks
		return Object.values(tasks).find(search => search.uid === task.related) || null
	}
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
	 * @param {Task} task The task to delete
	 */
	deleteTaskFromParent(state, task) {
		if (task instanceof Task) {
			// Remove task from parents subTask list if necessary
			if (task.related) {
				let tasks = task.calendar.tasks
				let parent = Object.values(tasks).find(search => search.uid === task.related)
				if (parent) {
					Vue.delete(parent.subTasks, task.uid)
				}
			}
		}
	},

	/**
	 * Adds a task to parent task as subtask
	 *
	 * @param {Object} state The store data
	 * @param {Task} task The task to add
	 */
	addTaskToParent(state, task) {
		if (task.related) {
			let tasks = task.calendar.tasks
			let parent = Object.values(tasks).find(search => search.uid === task.related)
			if (parent) {
				Vue.set(parent.subTasks, task.uid, task)
			}
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
		var categories = task.categories
		categories.push(category)
		Vue.set(task, 'categories', categories)
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
	 * Deletes the due date of a task
	 *
	 * @param {Object} state The store data
	 * @param {Task} task The task
	 */
	deleteDueDate(state, task) {
		console.debug('Deletes the due date of task ' + task)
	},

	/**
	 * Deletes the start date of a task
	 *
	 * @param {Object} state The store data
	 * @param {Task} task The task
	 */
	deleteStartDate(state, task) {
		console.debug('Deletes the start date of task ' + task)
	},

	/**
	 * Toggles if the start and due dates of a task are all day
	 *
	 * @param {Object} state The store data
	 * @param {Task} task The task
	 */
	toggleAllDay(state, task) {
		console.debug('Toggles the allday state of task ' + task)
	}
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

		let task = new Task('BEGIN:VCALENDAR\nVERSION:2.0\nEND:VCALENDAR', taskData.calendar)

		task.created = ICAL.Time.now()
		task.summary = taskData.summary
		task.hidesubtasks = 0
		if (taskData.priority) {
			task.priority = taskData.priority
		}
		if (taskData.complete) {
			task.complete = taskData.complete
		}
		if (taskData.related) {
			task.related = taskData.related
			// Check that parent task is not completed, uncomplete if necessary.
			if (task.complete !== 100) {
				let parent = context.getters.getParentTask(task)
				if (parent && parent.completed) {
					await context.dispatch('setPercentComplete', { task: parent, complete: 0 })
				}
			}
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

		let vData = ICAL.stringify(task.jCal)

		if (!task.dav) {
			await task.calendar.dav.createVObject(vData)
				.then((response) => {
					Vue.set(task, 'dav', response)
					context.commit('appendTask', task)
					context.commit('addTaskToCalendar', task)
					context.commit('addTaskToParent', task)
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
		// delete all subtasks first
		await Promise.all(Object.values(task.subTasks).map(async(subTask) => {
			await context.dispatch('deleteTask', { task: subTask, dav: true })
		}))
		// only local delete if the task doesn't exists on the server
		if (task.dav && dav) {
			await task.dav.delete()
				.catch((error) => {
					console.debug(error)
					OC.Notification.showTemporary(t('tasks', 'Could not delete the task.'))
				})
		}
		context.commit('deleteTask', task)
		context.commit('deleteTaskFromParent', task)
		context.commit('deleteTaskFromCalendar', task)
	},

	/**
	 * Updates a task
	 *
	 * @param {Object} context The store context
	 * @param {Task} task The task to update
	 * @returns {Promise}
	 */
	async updateTask(context, task) {
		let vCalendar = ICAL.stringify(task.jCal)

		if (!task.conflict) {
			task.dav.data = vCalendar
			return task.dav.update()
				.catch((error) => {
					OC.Notification.showTemporary(t('tasks', 'Could not update the task.'))
					// Wrong etag, we most likely have a conflict
					if (error && error.status === 412) {
						// Saving the new etag so that the user can manually
						// trigger a fetchCompleteData without any further errors
						task.conflict = error.xhr.getResponseHeader('etag')
					}
				})
		} else {
			console.error('This task is outdated, refusing to push', task)
			OC.Notification.showTemporary(t('tasks', 'This task is outdated, refusing to push.'))
		}
	},

	/**
	 * Toggles the completed state of a task
	 *
	 * @param {Object} context The store context
	 * @param {Task} task The task to update
	 */
	async toggleCompleted(context, task) {
		if (task.completed) {
			await context.dispatch('setPercentComplete', { task: task, complete: 0 })
		} else {
			await context.dispatch('setPercentComplete', { task: task, complete: 100 })
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
			let parent = context.getters.getParentTask(task)
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
		context.commit('setComplete', { task: task, complete: complete })
		context.dispatch('updateTask', task)
	},

	/**
	 * Toggles the visibility of a tasks subtasks
	 *
	 * @param {Object} context The store context
	 * @param {Task} task The task to update
	 */
	async toggleSubtasksVisibility(context, task) {
		context.commit('toggleSubtasksVisibility', task)
		context.dispatch('updateTask', task)
	},

	/**
	 * Toggles the visibility of a tasks completed subtasks
	 *
	 * @param {Object} context The store context
	 * @param {Task} task The task to update
	 */
	async toggleCompletedSubtasksVisibility(context, task) {
		context.commit('toggleCompletedSubtasksVisibility', task)
		context.dispatch('updateTask', task)
	},

	/**
	 * Toggles the starred state of a task
	 *
	 * @param {Object} context The store context
	 * @param {Task} task The task to update
	 */
	async toggleStarred(context, task) {
		context.commit('toggleStarred', task)
		context.dispatch('updateTask', task)
	},

	/**
	 * Sets the summary of a task
	 *
	 * @param {Object} context The store context
	 * @param {Task} task The task to update
	 */
	async setSummary(context, { task, summary }) {
		context.commit('setSummary', { task: task, summary: summary })
		context.dispatch('updateTask', task)
	},

	/**
	 * Sets the note of a task
	 *
	 * @param {Object} context The store context
	 * @param {Task} task The task to update
	 */
	async setNote(context, { task, note }) {
		context.commit('setNote', { task: task, note: note })
		context.dispatch('updateTask', task)
	},

	/**
	 * Sets the categories of a task
	 *
	 * @param {Object} context The store context
	 * @param {Task} task The task to update
	 */
	async setCategories(context, { task, categories }) {
		context.commit('setCategories', { task: task, categories: categories })
		context.dispatch('updateTask', task)
	},

	/**
	 * Adds a category to a task
	 *
	 * @param {Object} context The store context
	 * @param {Task} task The task to update
	 */
	async addCategory(context, { task, category }) {
		context.commit('addCategory', { task: task, category: category })
		context.dispatch('updateTask', task)
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
		context.commit('setPriority', { task: task, priority: priority })
		context.dispatch('updateTask', task)
	},

	/**
	 * Deletes the due date of a task
	 *
	 * @param {Object} context The store context
	 * @param {Task} task The task to update
	 */
	async deleteDueDate(context, task) {
		context.commit('deleteDueDate', task)
		context.dispatch('updateTask', task)
	},

	/**
	 * Deletes the start date of a task
	 *
	 * @param {Object} context The store context
	 * @param {Task} task The task to update
	 */
	async deleteStartDate(context, task) {
		context.commit('deleteStartDate', task)
		context.dispatch('updateTask', task)
	},

	/**
	 * Toggles if due and start date of a task are all-day
	 *
	 * @param {Object} context The store context
	 * @param {Task} task The task to update
	 */
	async toggleAllDay(context, task) {
		context.commit('toggleAllDay', task)
		context.dispatch('updateTask', task)
	}
}

export default { state, getters, mutations, actions }

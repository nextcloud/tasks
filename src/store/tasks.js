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
	 * @param {Object} state the store data
	 * @param {Object} getters the store getters
	 * @param {Object} rootState the store root state
	 * @param {String} calendarId the Id of the calendar in question
	 * @returns {Array} the tasks
	 */
	getTasksByCalendarId: (state, getters, rootState) => (calendarId) => {
		var calendar = getters.getCalendarById(calendarId)
		return Object.values(calendar.tasks)
	},

	/**
	 * Returns all tasks corresponding to current route value
	 *
	 * @param {Object} state the store data
	 * @param {Object} getters the store getters
	 * @param {Object} rootState the store root state
	 * @returns {Array} the tasks
	 */
	getTasksByRoute: (state, getters, rootState) => {
		return getters.getTasksByCalendarId(rootState.route.params.calendarId)
	},

	/**
	 * Returns all tasks which are direct children of the current task
	 *
	 * @param {Object} state the store data
	 * @param {Object} getters the store getters
	 * @param {Object} rootState the store root state
	 * @param {Object} parent the parent task
	 * @returns {Array} the sub-tasks of the current task
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
	 * @param {Object} state the store data
	 * @param {Object} getters the store getters
	 * @param {Object} rootState the store root state
	 * @returns {Array} all tasks in store
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
	 * @param {Object} state the store data
	 * @param {Object} getters the store getters
	 * @param {Object} rootState the store root state
	 * @returns {Object} the task
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
	 * @param {Object} tasks the tasks to search in
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
	 * @param {Object} tasks the tasks to search in
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
	 * @param {Object} tasks the tasks to search in
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
	 * @param {string} task The task of which to find the parent
	 * @returns {Task} the parent task
	 */
	getParentTask: () => (task) => {
		let tasks = task.calendar.tasks
		return Object.values(tasks).find(search => search.uid === task.related) || null
	}
}

const mutations = {

	/**
	 * Store tasks into state
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
	 * Store task into state
	 *
	 * @param {Object} state Default state
	 * @param {Task} task The task to append
	 */
	appendTask(state, task) {
		Vue.set(state.tasks, task.key, task)
	},

	/**
	 * Store task into state
	 *
	 * @param {Object} state Default state
	 * @param {Task} task The task to append
	 */
	deleteTask(state, task) {
		if (state.tasks[task.key] && task instanceof Task) {
			Vue.delete(state.tasks, task.key)
		}
	},

	/**
	 * Delete a task from the store
	 *
	 * @param {Object} state the store data
	 * @param {string} task The task to delete
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
	 * Add a task to parent task as subtask
	 *
	 * @param {Object} state the store data
	 * @param {Task} task the task to add
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
	 * @param {Object} state the store data
	 * @param {string} task The task
	 */
	toggleCompleted(state, task) {
		if (task.completed) {
			task.complete = 0
		} else {
			task.complete = 100
		}
		// TODO: set completed state of parent and child tasks
	},

	/**
	 * Toggles the starred state of a task
	 *
	 * @param {Object} state the store data
	 * @param {string} taskId The task id
	 */
	toggleStarred(state, taskId) {
		console.debug('Toggle starred state of task with uri ' + taskId)
	},

	/**
	 * Deletes the due date of a task
	 *
	 * @param {Object} state the store data
	 * @param {string} taskId The task id
	 */
	deleteDueDate(state, taskId) {
		console.debug('Deletes the due date of task with uri ' + taskId)
	},

	/**
	 * Deletes the start date of a task
	 *
	 * @param {Object} state the store data
	 * @param {string} taskId The task id
	 */
	deleteStartDate(state, taskId) {
		console.debug('Deletes the start date of task with uri ' + taskId)
	},

	/**
	 * Toggles if the start and due dates of a task are all day
	 *
	 * @param {Object} state the store data
	 * @param {string} taskId The task id
	 */
	toggleAllDay(state, taskId) {
		console.debug('Toggles the allday state of task with uri ' + taskId)
	}
}

const actions = {

	/**
	 * Create a new task
	 *
	 * @param {Object} context the store mutations
	 * @param {Object} taskData the data of the new task
	 * @returns {Promise}
	 */
	async createTask(context, taskData) {
		if (!taskData.calendar) {
			taskData.calendar = context.getters.getDefaultCalendar
		}

		let task = new Task('BEGIN:VCALENDAR\nVERSION:2.0\nEND:VCALENDAR', taskData.calendar)

		task.vtodo.updatePropertyWithValue('created', ICAL.Time.now())
		task.vtodo.updatePropertyWithValue('dtstamp', ICAL.Time.now())
		task.vtodo.updatePropertyWithValue('last-modified', ICAL.Time.now())
		task.vtodo.updatePropertyWithValue('summary', taskData.summary)
		task.vtodo.updatePropertyWithValue('x-oc-hidesubtasks', 0)
		if (taskData.priority) {
			task.vtodo.updatePropertyWithValue('priority', taskData.priority)
		}
		if (taskData.complete) {
			task.vtodo.updatePropertyWithValue('percent-complete', taskData.complete)
		}
		if (taskData.related) {
			task.vtodo.updatePropertyWithValue('related-to', taskData.related)
			// Check that parent task is not completed, uncomplete if necessary.
			if (taskData.complete !== 100) {
				let parent = context.getters.getParentTask(task)
				if (parent && parent.completed) {
					await context.dispatch('setPercentComplete', { task: parent, complete: 0 })
				}
			}
		}
		if (taskData.note) {
			task.vtodo.updatePropertyWithValue('description', taskData.note)
		}
		if (taskData.due) {
			task.vtodo.updatePropertyWithValue('due', taskData.due)
		}
		if (taskData.start) {
			task.vtodo.updatePropertyWithValue('dtstart', taskData.start)
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
	 * Delete a task
	 *
	 * @param {Object} context the store mutations
	 * @param {Object} data destructuring object
	 * @param {Task} data.task the task to delete
	 * @param {boolean} [data.dav = true] trigger a dav deletion
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
	 * Update a task
	 *
	 * @param {Object} context the store context
	 * @param {Task} task the task to update
	 * @returns {Promise}
	 */
	async updateTask(context, task) {
		let vCalendar = ICAL.stringify(task.jCal)

		if (!task.conflict) {
			task.dav.data = vCalendar
			return task.dav.update()
				.catch((error) => {
					OC.Notification.showTemporary(t('tasks', 'Could not update the task.'))
					// wrong etag, we most likely have a conflict
					if (error && error.status === 412) {
						// saving the new etag so that the user can manually
						// trigger a fetchCompleteData without any further errors
						task.conflict = error.xhr.getResponseHeader('etag')
					}
				})
		} else {
			console.error('This task is outdated, refusing to push', task)
			OC.Notification.showTemporary(t('tasks', 'This task is outdated, refusing to push.'))
		}
	},

	async toggleCompleted(context, task) {
		if (task.completed) {
			await context.dispatch('setPercentComplete', { task: task, complete: 0 })
		} else {
			await context.dispatch('setPercentComplete', { task: task, complete: 100 })
		}
	},

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
		task.complete = complete
		context.dispatch('updateTask', task)
	},
	toggleStarred(context, task) {
		context.commit('toggleStarred', task)
	},
	deleteDueDate(context, task) {
		context.commit('deleteDueDate', task)
	},
	deleteStartDate(context, task) {
		context.commit('deleteStartDate', task)
	},
	toggleAllDay(context, task) {
		context.commit('toggleAllDay', task)
	}
}

export default { state, getters, mutations, actions }

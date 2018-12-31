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
	 * Deletes a task
	 *
	 * @param {Object} state the store data
	 * @param {string} taskId The task id
	 */
	deleteTask(state, taskId) {
		console.debug('Delete task with uri ' + taskId)
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
				parent.subTasks.push(task)
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
					context.commit('addTaskToCalendar', task)
					context.commit('addTaskToParent', task)
				})
				.catch((error) => { throw error })
		}
	},

	deleteTask(context, taskId) {
		context.commit('deleteTask', taskId)
	},
	toggleCompleted(context, taskId) {
		context.commit('toggleCompleted', taskId)
	},
	toggleStarred(context, taskId) {
		context.commit('toggleStarred', taskId)
	},
	deleteDueDate(context, taskId) {
		context.commit('deleteDueDate', taskId)
	},
	deleteStartDate(context, taskId) {
		context.commit('deleteStartDate', taskId)
	},
	toggleAllDay(context, taskId) {
		context.commit('toggleAllDay', taskId)
	}
}

export default { state, getters, mutations, actions }

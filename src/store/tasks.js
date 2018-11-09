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

Vue.use(Vuex)

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
			tasks.concat(calendar.tasks)
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
			return calendar.tasks.find(task => {
				return task.uri === rootState.route.params.taskId
			})
		}
		// Else, we have to search all calendars
		var task
		for (let calendar of rootState.calendars.calendars) {
			task = calendar.tasks.find(task => {
				return task.uri === rootState.route.params.taskId
			})
			if (task) return task
		}
	}
}

const mutations = {
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

export default { getters, mutations, actions }

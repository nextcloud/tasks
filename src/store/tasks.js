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
	 * @param {String} calendarId the Id of the calendar in question
	 */
	getTasksByCalendarId: (state, getters, rootState) => (calendarId) => {
		return Object.values(rootState.calendars.calendars[calendarId].tasks)
	},

	/**
	 * Returns all tasks corresponding to current route value
	 */
	getTasksByRoute: (state, getters, rootState) => {
		return getters.getTasksByCalendarId(rootState.route.params.calendarId)
	},

	/**
	 * Returns all tasks of all calendars
	 */
	getAllTasks: (state, getters, rootState) => {
		var tasks = []
		Object.values(rootState.calendars.calendars).forEach(calendar => {
			tasks.concat(calendar.tasks)
		})
		return tasks
	},

	/**
	 * Returns the task currently opened by route
	 */
	getTaskByRoute: (state, getters, rootState) => {
		// If a calendar is given, only search in that calendar.
		if (rootState.route.params.calendarId) {
			return rootState.calendars.calendars[rootState.route.params.calendarId].tasks.find(task => {
				return task.uri === rootState.route.params.taskId
			})
		}
		// Else, we have to search all calendars
		var task
		for (let calendar of Object.values(rootState.calendars.calendars)) {
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
	 * @param {Object} state
	 * @param {string} taskId The task id
	 */
	deleteTask(state, taskId) {
		console.log('Delete task with uri ' + taskId)
	},

	/**
	 * Toggles the completed state of a task
	 *
	 * @param {Object} state
	 * @param {string} taskId The task id
	 */
	toggleCompleted(state, taskId) {
		console.log('Toggle completed state of task with uri ' + taskId)
	},

	/**
	 * Toggles the starred state of a task
	 *
	 * @param {Object} state
	 * @param {string} taskId The task id
	 */
	toggleStarred(state, taskId) {
		console.log('Toggle starred state of task with uri ' + taskId)
	},

	/**
	 * Deletes the due date of a task
	 *
	 * @param {Object} state
	 * @param {string} taskId The task id
	 */
	deleteDueDate(state, taskId) {
		console.log('Deletes the due date of task with uri ' + taskId)
	},

	/**
	 * Deletes the start date of a task
	 *
	 * @param {Object} state
	 * @param {string} taskId The task id
	 */
	deleteStartDate(state, taskId) {
		console.log('Deletes the start date of task with uri ' + taskId)
	},

	/**
	 * Toggles if the start and due dates of a task are all day
	 *
	 * @param {Object} state
	 * @param {string} taskId The task id
	 */
	toggleAllDay(state, taskId) {
		console.log('Toggles the allday state of task with uri ' + taskId)
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

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
import Requests from './services/requests'
import DummyCalendars from './dummyCalendars'

import { isTaskInList } from './storeHelper'

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		collections: [
		],
		calendars: DummyCalendars.calendars,
		settings: {}
	},
	getters: {

		/**
		 * Returns the count of tasks in a colllection
		 *
		 * Tasks have to
		 *	- belong to a collection
		 *	- be a root task
		 *	- be uncompleted
		 *
		 * @param {String} collectionId the Id of the collection in question
		 */
		getCollectionCount: state => (collectionId) => {
			var count = 0
			Object.values(state.calendars).forEach(calendar => {
				count += calendar.tasks.filter(task => {
					return isTaskInList(task, collectionId) && !task.related
				}).length
			})
			return count
		},

		/**
		 * Returns the count of tasks in a calendar
		 *
		 * Tasks have to be
		 *	- a root task
		 *	- uncompleted
		 *
		 * @param {String} calendarId the Id of the calendar in question
		 */
		getCalendarCount: state => (calendarId) => {
			return Object.values(state.calendars[calendarId].tasks)
				.filter(task => {
					return task.completed === false && !task.related
				}).length
		},

		/**
		 * Returns the count of tasks in a calendar belonging to a collection
		 *
		 * Tasks have to be
		 *	- belong to the collection with collectionId
		 *	- a root task
		 *	- uncompleted
		 *
		 * @param {String} calendarId the Id of the calendar in question
		 * @param {String} collectionId the Id of the collection in question
		 */
		getCalendarCountByCollectionId: state => (calendarId, collectionId) => {
			var calendar = state.calendars[calendarId]
			var count = calendar.tasks.filter(task => {
				return isTaskInList(task, collectionId) && !task.related
			}).length
			return count
		},

		/**
		 * Returns the count of tasks in a calendar
		 *
		 * Tasks have to be
		 *	- a root task
		 *	- completed
		 *
		 * @param {String} calendarId the Id of the calendar in question
		 */
		getCalendarCountCompleted: state => (calendarId) => {
			return Object.values(state.calendars[calendarId].tasks)
				.filter(task => {
					return task.completed === true && !task.related
				}).length
		},

		/**
		 * Returns if a calendar name is already used by an other calendar
		 *
		 * @param {String} name the name to check
		 * @param {String} uri the uri of the calendar to exclude
		 */
		isCalendarNameUsed: state => (name, uri) => {
			var calendars = Object.values(state.calendars)
			return calendars.some(calendar => {
				return (calendar.displayname === name && calendar.uri !== uri)
			})
		},

		/**
		 * Returns all tasks corresponding to the calendar
		 *
		 * @param {String} calendarId the Id of the calendar in question
		 */
		getTasksByCalendarId: state => (calendarId) => {
			return Object.values(state.calendars[calendarId].tasks)
		},

		/**
		 * Returns all tasks corresponding to current route value
		 */
		getTasksByRoute: (state, getters) => {
			return getters.getTasksByCalendarId(state.route.params.calendarId)
		},

		/**
		 * Returns all tasks of all calendars
		 */
		getAllTasks: (state) => {
			var tasks = []
			Object.values(state.calendars).forEach(calendar => {
				tasks.concat(calendar.tasks)
			})
			return tasks
		},

		/**
		 * Returns the task currently opened by route
		 */
		getTaskByRoute: (state) => {
			// If a calendar is given, only search in that calendar.
			if (state.route.params.calendarId) {
				return state.calendars[state.route.params.calendarId].tasks.find(task => {
					return task.uri === state.route.params.taskId
				})
			}
			// Else, we have to search all calendars
			var task
			for (let calendar of Object.values(state.calendars)) {
				task = calendar.tasks.find(task => {
					return task.uri === state.route.params.taskId
				})
				if (task) return task
			}
		},

		/**
		 * Returns the current calendar
		 */
		getCalendarByRoute: (state) => {
			return state.calendars[state.route.params.calendarId]
		},

		/**
		 * Returns the default calendar
		 *
		 * For now, this is the first calendar in the list.
		 * Calendar order might change randomly.
		 */
		getDefaultCalendar: (state) => {
			return Object.values(state.calendars)[0]
		}
	},
	mutations: {
		setCollections(state, payload) {
			state.collections = payload.collections
		},
		setSettings(state, payload) {
			state.settings = payload.settings
		},
		setSetting(state, payload) {
			state.settings[payload.type] = payload.value
		},

		/**
		 * Sets the visibility of a collection
		 *
		 * @param {Object} state
		 * @param {Collection} newCollection the collection to update
		 */
		setVisibility(state, newCollection) {
			let collection = state.collections.find(search => search.id === newCollection.id)
			Vue.set(collection, 'show', newCollection.show)
		},

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
	},
	actions: {
		loadCollections({ commit }) {
			return new Promise(function(resolve) {
				Requests.get(OC.generateUrl('apps/tasks/collections'))
					.then(response => {
						commit('setCollections', {
							collections: response.data.data.collections
						})
						resolve()
					})
			})
		},
		setSetting(context, payload) {
			context.commit('setSetting', payload)
			return new Promise(function() {
				Requests.post(OC.generateUrl('apps/tasks/settings/{type}/{value}', payload), {})
			})
		},
		setVisibility(context, collection) {
			context.commit('setVisibility', collection)
			return new Promise(function() {
				Requests.post(OC.generateUrl('apps/tasks/collection/{id}/visibility/{show}', collection), {})
			})
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
		},
		loadSettings({ commit }) {
			return new Promise(function(resolve) {
				Requests.get(OC.generateUrl('apps/tasks/settings'))
					.then(response => {
						commit('setSettings', {
							settings: response.data.data.settings
						})
						resolve()
					})
			})
		}
	}
})

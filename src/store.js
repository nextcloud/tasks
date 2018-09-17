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
		settings: {},
		dayOfMonth: 23
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
		 * @param {String} collectionID the id of the collection in question
		 */
		getCollectionCount: state => (collectionID) => {
			var count = 0
			Object.values(state.calendars).forEach(calendar => {
				count += calendar.tasks.filter(task => {
					return isTaskInList(task, collectionID) && !task.related
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
		 * @param {String} calendarID the id of the calendar in question
		 */
		getCalendarCount: state => (calendarID) => {
			return Object.values(state.calendars[calendarID].tasks)
				.filter(task => {
					return task.completed === false && !task.related
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
		 * Returns all tasks corresponding to current route value
		 */
		getTasks: state => {
			return Object.values(state.calendars[state.route.params.calendarId].tasks)
		},

		/**
		 * Returns all tasks corresponding to current route value
		 */
		getTasksByParentId: state => (parentId) => {
			return []
			// return Object.values(state.calendars[state.route.params.calendarId].tasks)
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

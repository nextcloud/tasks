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

import Requests from '../services/requests.js'
import { isTaskInList, searchSubTasks } from './storeHelper.js'

import { generateUrl } from '@nextcloud/router'

import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
	collections: [],
}

const getters = {

	/**
	 * Returns the count of tasks in a colllection
	 *
	 * Tasks have to
	 * - belong to a collection
	 * - be uncompleted
	 *
	 * @param {Object} state The store data
	 * @param {Object} getters The store getters
	 * @param {Object} rootState The store root state
	 * @param {String} collectionId The id of the collection in question
	 * @returns {Integer} Count of tasks in the collection
	 */
	getCollectionCount: (state, getters, rootState) => (collectionId) => {
		let count = 0
		rootState.calendars.calendars.forEach(calendar => {
			let tasks = Object.values(calendar.tasks).filter(task => {
				return isTaskInList(task, collectionId, false)
			})
			if (rootState.tasks.searchQuery) {
				tasks = tasks.filter(task => {
					if (task.matches(rootState.tasks.searchQuery)) {
						return true
					}
					// We also have to show tasks for which one sub(sub...)task matches.
					return searchSubTasks(task, rootState.tasks.searchQuery)
				})
			}
			count += tasks.length
		})
		return count
	},
}

const mutations = {
	/**
	 * Stores all available collections in the state
	 *
	 * @param {Object} state The store data
	 * @param {Object} payload The collections payload
	 */
	setCollections(state, payload) {
		state.collections = payload.collections
	},

	/**
	 * Sets the visibility of a collection
	 *
	 * @param {Object} state The store data
	 * @param {Collection} newCollection The collection to update
	 */
	setVisibility(state, newCollection) {
		const collection = state.collections.find(search => search.id === newCollection.id)
		Vue.set(collection, 'show', newCollection.show)
	},
}

const actions = {
	/**
	 * Requests all collections from the server
	 *
	 * @param {Object} commit The store mutations
	 * @returns {Promise}
	 */
	loadCollections({ commit }) {
		return new Promise(function(resolve) {
			Requests.get(generateUrl('apps/tasks/collections'))
				.then(response => {
					commit('setCollections', {
						collections: response.data.data.collections,
					})
					resolve()
				})
		})
	},

	/**
	 * Writes the visibility of a collection to the server
	 *
	 * @param {Object} context The store mutations
	 * @param {Collection} collection The collection to change
	 * @returns {Promise}
	 */
	setVisibility(context, collection) {
		context.commit('setVisibility', collection)
		return new Promise(function() {
			Requests.post(generateUrl('apps/tasks/collection/{id}/visibility/{show}', collection), {})
		})
	},
}

export default { state, getters, mutations, actions }

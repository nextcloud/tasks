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
import Requests from '../services/requests'

import { isTaskInList } from './storeHelper'

Vue.use(Vuex)

const state = {
	collections: []
}

const getters = {

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
	getCollectionCount: (state, getters, rootState) => (collectionId) => {
		var count = 0
		Object.values(rootState.calendars.calendars).forEach(calendar => {
			count += calendar.tasks.filter(task => {
				return isTaskInList(task, collectionId) && !task.related
			}).length
		})
		return count
	}
}

const mutations = {
	setCollections(state, payload) {
		state.collections = payload.collections
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
}

const actions = {
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
	setVisibility(context, collection) {
		context.commit('setVisibility', collection)
		return new Promise(function() {
			Requests.post(OC.generateUrl('apps/tasks/collection/{id}/visibility/{show}', collection), {})
		})
	}
}

export default { state, getters, mutations, actions }

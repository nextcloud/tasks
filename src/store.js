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

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		tasks: [],
		collections: [
		],
		calendars: [
			{
				uri: 'test-1',
				displayname: 'Test 1',
				color: '#eef',
				writable: true,
				tasks: [
					{
						calendar: {
							writable: true
						},
						summary: 'Test 1 - Task 1',
						complete: 1,
						completed: true,
						priority: 1,
						cats: [],
						note: 'Migrate this app to vue.'
					},
					{
						calendar: {
							writable: true
						},
						summary: 'Test 1 - Task 2',
						complete: 3,
						completed: false,
						priority: 5,
						cats: [],
						note: 'Migrate this app to vue.'
					},
					{
						calendar: {
							writable: true
						},
						summary: 'Test 1 - Task 3',
						complete: 6,
						completed: false,
						priority: 7,
						cats: [],
						note: 'Migrate this app to vue.'
					}
				]
			},
			{
				uri: 'test-2',
				displayname: 'Test 2',
				color: '#eef',
				writable: false,
				tasks: [
					{
						calendar: {
							writable: true
						},
						summary: 'Test 2 - Task 1',
						complete: 1,
						completed: true,
						priority: 1,
						cats: [],
						note: 'Migrate this app to vue.'
					},
					{
						calendar: {
							writable: true
						},
						summary: 'Test 2 - Task 2',
						complete: 3,
						completed: false,
						priority: 5,
						cats: [],
						note: 'Migrate this app to vue.'
					},
					{
						calendar: {
							writable: true
						},
						summary: 'Test 2 - Task 3',
						complete: 6,
						completed: true,
						priority: 7,
						cats: [],
						note: 'Migrate this app to vue.'
					},
					{
						calendar: {
							writable: true
						},
						summary: 'Test 2 - Task 4',
						complete: 6,
						completed: false,
						priority: 7,
						cats: [],
						note: 'Migrate this app to vue.'
					},
					{
						calendar: {
							writable: true
						},
						summary: 'Test 2 - Task 5',
						complete: 6,
						completed: false,
						priority: 7,
						cats: [],
						note: 'Migrate this app to vue.'
					}
				]
			},
			{
				uri: 'test-3',
				displayname: 'Test 3',
				color: '#112233',
				writable: true,
				tasks: [

					{
						calendar: {
							writable: true
						},
						summary: 'Test 3 - Task 1',
						complete: 1,
						completed: false,
						priority: 1,
						cats: [],
						note: 'Migrate this app to vue.'
					},
					{
						calendar: {
							writable: true
						},
						summary: 'Test 3 - Task 2',
						complete: 3,
						completed: true,
						priority: 5,
						cats: [],
						note: 'Migrate this app to vue.'
					},
					{
						calendar: {
							writable: true
						},
						summary: 'Test 3 - Task 3',
						complete: 6,
						completed: false,
						priority: 7,
						cats: [],
						note: 'Migrate this app to vue.'
					},
					{
						calendar: {
							writable: true
						},
						summary: 'Test 3 - Task 4',
						complete: 6,
						completed: false,
						priority: 7,
						cats: [],
						note: 'Migrate this app to vue.'
					}
				]
			}
		],
		settings: {},
		dayOfMonth: 23
	},
	getters: {
		getCollectionCount: state => (collectionID) => {
			// todo
			return 12
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

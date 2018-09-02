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
				writable: true
			},
			{
				uri: 'test-2',
				displayname: 'Test 2',
				color: '#eef',
				writable: false
			},
			{
				uri: 'test-3',
				displayname: 'Test 3',
				color: '#112233',
				writable: true
			}
		],
		settings: {},
		dayOfMonth: 23
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
				Requests.post(OC.generateUrl('apps/tasks/settings/' + payload.type + '/' + payload.value), {})
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

/**
 * Nextcloud - Tasks
 *
 * @author Raimund Schlüßler
 * @copyright 2018 Raimund Schlüßler <raimund.schluessler@mailbox.org>
 * @copyright 2018 Vadim Nicolai <contact@vadimnicolai.com>
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
import { generateUrl } from '@nextcloud/router'

Vue.use(Vuex)

const state = {
	settings: {},
}

const getters = {
	/**
	 * Returns the sort order how to sort tasks
	 *
	 * @param {Object} state The store data
	 * @returns {String} The sort order
	 */
	sortOrder: (state) => state.settings.sortOrder,

	/**
	 * Returns the sort direction how to sort tasks
	 *
	 * @param {Object} state The store data
	 * @returns {String} The sort direction
	 */
	sortDirection: (state) => state.settings.sortDirection,

	/**
	 * Returns if all-day is default
	 *
	 * @param {Object} state The store data
	 * @returns {String} Whether all-day is default
	 */
	allDay: (state) => state.settings.allDay,
}

const mutations = {
	/**
	 * Sets all settings
	 *
	 * @param {Object} state Default state
	 * @param {Object} payload The settings object
	 */
	setSettings(state, payload) {
		state.settings = payload.settings
	},

	/**
	 * Sets a setting value
	 *
	 * @param {Object} state Default state
	 * @param {Object} payload The setting object
	 */
	setSetting(state, payload) {
		state.settings[payload.type] = payload.value
	},
}

const actions = {
	/**
	 * Writes a setting to the server
	 *
	 * @param {Object} context The store context
	 * @param {Object} payload The setting to save
	 * @returns {Promise}
	 */
	setSetting(context, payload) {
		context.commit('setSetting', payload)
		return new Promise(function() {
			Requests.post(generateUrl('apps/tasks/settings/{type}/{value}', payload), {})
		})
	},

	/**
	 * Requests all app settings from the server
	 *
	 * @param {Object} commit The store mutations
	 * @returns {Promise}
	 */
	loadSettings({ commit }) {
		return new Promise(function(resolve) {
			Requests.get(generateUrl('apps/tasks/settings'))
				.then(response => {
					commit('setSettings', {
						settings: response.data.data.settings,
					})
					resolve()
				})
		})
	},
}

export default { state, getters, mutations, actions }

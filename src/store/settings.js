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

import Requests from '../services/requests.js'

import { loadState } from '@nextcloud/initial-state'
import { generateUrl } from '@nextcloud/router'

import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
	settings: {
		sortOrder: 'default',
		sortDirection: false,
	},
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

	/**
	 * Returns the initial route
	 *
	 * @param {Object} state The store data
	 * @returns {String} Whether all-day is default
	 */
	initialRoute: (state) => state.settings.initialRoute,
}

const mutations = {
	/**
	 * Sets all settings
	 *
	 * @param {Object} state Default state
	 * @param {Object} settings The settings object
	 */
	setSettings(state, settings) {
		state.settings = settings
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
			Requests.post(generateUrl('apps/tasks/settings/{type}', payload), { value: payload.value })
		})
	},

	/**
	 * Requests all app settings from the server
	 *
	 * @param {Object} commit The store mutations
	 */
	loadSettings({ commit }) {
		commit('setSettings', {
			defaultCalendarId: loadState('tasks', 'defaultCalendarId'),
			showHidden: loadState('tasks', 'showHidden'),
			sortOrder: loadState('tasks', 'sortOrder'),
			sortDirection: loadState('tasks', 'sortDirection'),
			allDay: loadState('tasks', 'allDay'),
			initialRoute: loadState('tasks', 'initialRoute'),
		})
	},
}

export default { state, getters, mutations, actions }

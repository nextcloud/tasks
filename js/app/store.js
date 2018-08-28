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
'use strict';

import Vue from 'vue';
import Vuex from 'vuex';
import Axios from 'axios';
Axios.defaults.headers.common.requesttoken = OC.requestToken;

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		tasks: []
	},
	mutations: {
		setTasks(state, payload) {
			state.tasks = payload.tasks;
		}
	},
	actions: {
		loadTasks({commit}) {
			return new Promise(function(resolve) {
				// Axios.get(OC.generateUrl('apps/tasks/tasks'))
				// .then(function (response) {
				// 	commit('setTasks' , {
				// 		tasks: response.data.data.tasks
				// 	});
				// 	resolve();
				// })
				// .catch(function (error) {
				// 	console.log(error);
				// });
			});
		}
	}
});

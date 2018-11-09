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

import App from './app'

import router from './components/TheRouter'
import store from './store/store'
import { sync } from 'vuex-router-sync'
import VTooltip from 'v-tooltip'

// Disable on production
Vue.config.devtools = true
Vue.config.performance = true

// CSP config for webpack dynamic chunk loading
// eslint-disable-next-line
__webpack_nonce__ = btoa(OC.requestToken)

// Correct the root of the app for chunk loading
// OC.linkTo matches the apps folders
// OC.generateUrl ensure the index.php (or not)
// We do not want the index.php since we're loading files
// eslint-disable-next-line
__webpack_public_path__ = OC.linkTo('tasks', 'js/')

sync(store, router)

Vue.use(VTooltip)

if (!OCA.Tasks) {
	/**
	 * @namespace OCA.Tasks
	 */
	OCA.Tasks = {}
}

Vue.prototype.t = t
Vue.prototype.n = n
Vue.prototype.OC = OC
Vue.prototype.OCA = OCA

OCA.Tasks.App = new Vue({
	el: '.app-tasks',
	router,
	store,
	data: function() {
		return {
			searchString: ''
		}
	},
	mounted: function() {
		var version = OC.config.version.split('.')

		if (version[0] >= 14) {
			OC.Search = new OCA.Search(this.filter, this.cleanSearch)
		} else {
			OCA.Tasks.Search = {
				attach: function(search) {
					search.setFilter('tasks', this.filter)
				}
			}

			OC.Plugins.register('OCA.Search', OCA.Tasks.Search)
		}
	},
	beforeMount() {
		// Configure the locale of moment.js
		moment.locale(OC.getLocale().replace('_', '-').toLowerCase())
		this.$store.dispatch('loadCollections')
		this.$store.dispatch('loadSettings')
	},
	methods: {
		filter(query) {
			this.searchString = query
		},
		cleanSearch() {
			this.searchString = ''
		}
	},
	render: h => h(App)
})

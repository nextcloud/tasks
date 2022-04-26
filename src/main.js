/**
 * Nextcloud - Tasks
 *
 * @author Raimund Schlüßler
 *
 * @copyright 2018 Raimund Schlüßler <raimund.schluessler@mailbox.org>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library. If not, see <http://www.gnu.org/licenses/>.
 *
 */
'use strict'

import App from './App.vue'
import router from './router.js'
import store from './store/store.js'

import { subscribe, unsubscribe } from '@nextcloud/event-bus'
import { linkTo } from '@nextcloud/router'

import AlertBoxOutline from 'vue-material-design-icons/AlertBoxOutline'
import CalendarRemove from 'vue-material-design-icons/CalendarRemove'
import Cancel from 'vue-material-design-icons/Cancel'
import Check from 'vue-material-design-icons/Check'
import Delete from 'vue-material-design-icons/Delete'
import Eye from 'vue-material-design-icons/Eye'
import EyeOff from 'vue-material-design-icons/EyeOff'
import Pulse from 'vue-material-design-icons/Pulse'
import Tag from 'vue-material-design-icons/Tag'
import TrendingUp from 'vue-material-design-icons/TrendingUp'

import Vue from 'vue'
import { sync } from 'vuex-router-sync'
// eslint-disable-next-line import/no-named-as-default
import VueClipboard from 'vue-clipboard2'

// Disable on production
Vue.config.devtools = true
Vue.config.performance = true

// CSP config for webpack dynamic chunk loading
// eslint-disable-next-line
__webpack_nonce__ = btoa(OC.requestToken)

// Correct the root of the app for chunk loading
// linkTo matches the apps folders
// generateUrl ensure the index.php (or not)
// We do not want the index.php since we're loading files
// eslint-disable-next-line
__webpack_public_path__ = linkTo('tasks', 'js/')

sync(store, router)

Vue.use(VueClipboard)

/**
 * We have to globally register these material design icons
 * so we can use them dynamically via `<component :is="icon" />`
 * in the MultiselectOption component.
 */
// eslint-disable-next-line vue/match-component-file-name
Vue.component('IconAlertBoxOutline', AlertBoxOutline)
// eslint-disable-next-line vue/match-component-file-name
Vue.component('IconCalendarRemove', CalendarRemove)
// eslint-disable-next-line vue/match-component-file-name
Vue.component('IconCancel', Cancel)
// eslint-disable-next-line vue/match-component-file-name
Vue.component('IconCheck', Check)
// eslint-disable-next-line vue/match-component-file-name
Vue.component('IconDelete', Delete)
// eslint-disable-next-line vue/match-component-file-name
Vue.component('IconEye', Eye)
// eslint-disable-next-line vue/match-component-file-name
Vue.component('IconEyeOff', EyeOff)
// eslint-disable-next-line vue/match-component-file-name
Vue.component('IconPulse', Pulse)
// eslint-disable-next-line vue/match-component-file-name
Vue.component('IconTag', Tag)
// eslint-disable-next-line vue/match-component-file-name
Vue.component('IconTrendingUp', TrendingUp)

if (!OCA.Tasks) {
	/**
	 * @namespace OCA.Tasks
	 */
	OCA.Tasks = {}
}

Vue.prototype.$OC = OC
Vue.prototype.$OCA = OCA
Vue.prototype.$appVersion = appVersion

OCA.Tasks.App = new Vue({
	el: '.app-tasks',
	router,
	store,
	data() {
		return {
			searchString: '',
		}
	},
	mounted() {
		subscribe('nextcloud:unified-search.search', this.filterProxy)
		subscribe('nextcloud:unified-search.reset', this.cleanSearch)
	},
	beforeMount() {
		this.$store.dispatch('loadCollections')
		this.$store.dispatch('loadSettings')
	},
	beforeDestroy() {
		unsubscribe('nextcloud:unified-search.search', this.filterProxy)
		unsubscribe('nextcloud:unified-search.reset', this.cleanSearch)
	},
	methods: {
		filterProxy({ query }) {
			this.filter(query)
		},
		filter(query) {
			this.$store.commit('setSearchQuery', query)
		},
		cleanSearch() {
			this.$store.commit('setSearchQuery', '')
		},
	},
	render: h => h(App),
})

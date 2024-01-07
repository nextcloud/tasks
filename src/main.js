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
import TaskBody from './components/TaskBody.vue'

import AlertBoxOutline from 'vue-material-design-icons/AlertBoxOutline.vue'
import CalendarRemove from 'vue-material-design-icons/CalendarRemove.vue'
import Cancel from 'vue-material-design-icons/Cancel.vue'
import Check from 'vue-material-design-icons/Check.vue'
import Delete from 'vue-material-design-icons/Delete.vue'
import Eye from 'vue-material-design-icons/Eye.vue'
import EyeOff from 'vue-material-design-icons/EyeOff.vue'
import Pulse from 'vue-material-design-icons/Pulse.vue'
import TrendingUp from 'vue-material-design-icons/TrendingUp.vue'

import Vue from 'vue'
import { sync } from 'vuex-router-sync'

// Disable on production
Vue.config.devtools = true
Vue.config.performance = true

sync(store, router)

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
Vue.component('IconTrendingUp', TrendingUp)

/**
 * We import TaskBody here globally, because we have a circular dependency
 * between TaskDragContainer and TaskBody which otherwise cannot be resolved.
 */
// eslint-disable-next-line vue/match-component-file-name
Vue.component('TaskBody', TaskBody)

if (!OCA.Tasks) {
	/**
	 * @namespace OCA.Tasks
	 */
	OCA.Tasks = {}
}

Vue.prototype.$OC = OC
Vue.prototype.$OCA = OCA

OCA.Tasks.App = new Vue({
	el: '.app-tasks',
	router,
	store,
	render: h => h(App),
})

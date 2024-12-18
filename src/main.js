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
import Repeat from 'vue-material-design-icons/Repeat.vue'
import TrendingUp from 'vue-material-design-icons/TrendingUp.vue'

import { createApp } from 'vue'

if (!OCA.Tasks) {
	/**
	 * @namespace OCA.Tasks
	 */
	OCA.Tasks = {}
}

const Tasks = createApp(App)
	/**
	 * We import TaskBody here globally, because we have a circular dependency
	 * between TaskDragContainer and TaskBody which otherwise cannot be resolved.
	 */
	.component('TaskBody', TaskBody)
	.component('IconAlertBoxOutline', AlertBoxOutline)
	.component('IconCalendarRemove', CalendarRemove)
	.component('IconCancel', Cancel)
	.component('IconCheck', Check)
	.component('IconDelete', Delete)
	.component('IconEye', Eye)
	.component('IconEyeOff', EyeOff)
	.component('IconPulse', Pulse)
	.component('IconRepeat', Repeat)
	.component('IconTrendingUp', TrendingUp)
	.provide('$OCA', OCA)
	.provide('$appVersion', appVersion)
	.use(router)
	.use(store)
	.mount('.app-tasks')

OCA.Tasks.App = Tasks

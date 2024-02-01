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

import { getInitialRoute } from './utils/router.js'
import AppSidebar from './views/AppSidebar.vue'
import Calendar from './views/AppContent/Calendar.vue'
import Collections from './views/AppContent/Collections.vue'

import { h } from 'vue'
import { createWebHashHistory, createRouter, RouterView } from 'vue-router'

const routes = [
	{ path: '/', redirect: getInitialRoute() },
	{
		path: '/collections/:collectionId',
		components: {
			default: { render: () => h(RouterView, { name: 'default' }) },
			AppSidebar: { render: () => h(RouterView, { name: 'AppSidebar' }) },
		},
		children: [
			{
				name: 'collections',
				path: '/collections/:collectionId',
				component: Collections,
				props: true,
			},
			{
				name: 'collectionsTask',
				path: '/collections/:collectionId/tasks/:taskId',
				components: { default: Collections, AppSidebar },
				props: { default: true, AppSidebar: true },
			},
			{
				name: 'collectionsParamTask',
				path: '/collections/:collectionId/:collectionParam/tasks/:taskId',
				components: { default: Collections, AppSidebar },
				props: { default: true, AppSidebar: true },
			},
		],
	},
	{
		path: '/calendars/:calendarId',
		components: {
			default: { render: () => h(RouterView, { name: 'default' }) },
			AppSidebar: { render: () => h(RouterView, { name: 'AppSidebar' }) },
		},
		children: [
			{
				name: 'calendars',
				path: '/calendars/:calendarId',
				component: Calendar,
				props: true,
			},
			{
				name: 'calendarsTask',
				path: '/calendars/:calendarId/tasks/:taskId',
				components: { default: Calendar, AppSidebar },
				props: { default: true, AppSidebar: true },
			},
		],
	},
]

const router = createRouter({
	history: createWebHashHistory(),
	routes,
})

export { routes }

export default router

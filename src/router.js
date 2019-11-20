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

import Vue from 'vue'
import VueRouter from 'vue-router'

import Collections from './components/TheCollections/Collections'
import Calendar from './components/TheCollections/Calendar'
import TheDetails from './components/TheDetails'

const routes = [
	// using
	// { path: '/collections/all', component: CollectionGeneral, alias: '/' },
	// instead of
	{ path: '/', redirect: '/collections/all' },
	// would also be an option, but it currently does not work
	// reliably with router-link due to
	// https://github.com/vuejs/vue-router/issues/419
	{ name: 'collections', path: '/collections/:collectionId', component: Collections, props: true },
	{
		name: 'collectionsTask',
		path: '/collections/:collectionId/tasks/:taskId',
		components: { default: Collections, details: TheDetails },
		props: { default: true }
	},
	{
		name: 'collectionsParamTask',
		path: '/collections/:collectionId/:collectionParam/tasks/:taskId',
		components: { default: Collections, details: TheDetails },
		props: { default: true }
	},
	{ name: 'calendars', path: '/calendars/:calendarId', component: Calendar, props: true },
	{ name: 'calendarsTask', path: '/calendars/:calendarId/tasks/:taskId', components: { default: Calendar, details: TheDetails }, props: { default: true } }
]

Vue.use(VueRouter)

export default new VueRouter({
	routes // short for `routes: routes`
})

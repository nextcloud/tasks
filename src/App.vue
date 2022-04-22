<!--
Nextcloud - Tasks

@author Raimund Schlüßler
@copyright 2018 Raimund Schlüßler <raimund.schluessler@mailbox.org>

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
License as published by the Free Software Foundation; either
version 3 of the License, or any later version.

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU AFFERO GENERAL PUBLIC LICENSE for more details.

You should have received a copy of the GNU Affero General Public
License along with this library. If not, see <http://www.gnu.org/licenses/>.

-->

<template>
	<Content app-name="tasks">
		<AppNavigation @click.native="closeAppSidebar($event)" />

		<AppContent @click.native="closeAppSidebar($event)">
			<RouterView />
		</AppContent>

		<RouterView name="sidebar" />
	</Content>
</template>

<script>
import AppNavigation from './views/AppNavigation.vue'
import client from './services/cdav.js'

import { emit } from '@nextcloud/event-bus'
import { translate as t } from '@nextcloud/l10n'
import AppContent from '@nextcloud/vue/dist/Components/AppContent'
import Content from '@nextcloud/vue/dist/Components/Content'

import { mapGetters } from 'vuex'

export default {
	name: 'App',
	components: {
		AppNavigation,
		AppContent,
		Content,
	},
	computed: {
		...mapGetters({
			calendars: 'getTaskCalendars',
		}),
	},
	async beforeMount() {
		// get calendars then get tasks
		await client.connect({ enableCalDAV: true })
		await this.$store.dispatch('fetchCurrentUserPrincipal')
		let { calendars } = await this.$store.dispatch('getCalendarsAndTrashBin')
		calendars = calendars.filter(calendar => calendar.supportsTasks)
		const owners = []
		calendars.forEach((calendar) => {
			if (owners.indexOf(calendar.owner) === -1) {
				owners.push(calendar.owner)
			}
		})
		owners.forEach((owner) => {
			this.$store.dispatch('fetchPrincipalByUrl', {
				url: owner,
			})
		})
		// No calendars? Create a new one!
		if (calendars.length === 0) {
			const color = this.$OCA.Theming?.color || '#0082C9'
			await this.$store.dispatch('appendCalendar', { displayName: t('tasks', 'Tasks'), color })
			this.fetchTasks()
		// else, let's get those tasks!
		} else {
			this.fetchTasks()
		}
	},
	methods: {
		/**
		 * Fetch the tasks of each calendar
		 */
		fetchTasks() {
			// wait for all calendars to have fetch their tasks
			Promise.all(this.calendars.map(calendar =>
				this.$store.dispatch('getTasksFromCalendar', { calendar, completed: false, related: null })
			)).then(results => {
				this.loading = false
				// console.log(results)
			})
		},

		/**
		 * Close the details view
		 *
		 * @param {object} $event the event
		 */
		closeAppSidebar($event) {
			if (!($event.target.closest('.reactive') || $event.target.classList.contains('reactive')) && this.$route.params.taskId) {
				emit('tasks:close-appsidebar')
			}
		},
	},
}
</script>

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
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU AFFERO GENERAL PUBLIC LICENSE for more details.

You should have received a copy of the GNU Affero General Public
License along with this library.  If not, see <http://www.gnu.org/licenses/>.

-->

<template>
	<Content app-name="tasks" @click.native="closeDetails($event)">
		<AppNavigation />

		<AppContent>
			<RouterView />
		</AppContent>

		<RouterView name="sidebar" />
	</Content>
</template>

<script>
import AppNavigation from './views/AppNavigation.vue'
import client from './services/cdav.js'

import AppContent from '@nextcloud/vue/dist/Components/AppContent'
import Content from '@nextcloud/vue/dist/Components/Content'

import { mapState } from 'vuex'

export default {
	name: 'App',
	components: {
		AppNavigation,
		AppContent,
		Content,
	},
	computed: {
		...mapState({
			calendars: state => state.calendars.calendars,
		}),
	},
	async beforeMount() {
		// get calendars then get tasks
		await client.connect({ enableCalDAV: true })
		await this.$store.dispatch('fetchCurrentUserPrincipal')
		const calendars = await this.$store.dispatch('getCalendars')
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
			let color = '#0082C9'
			if (this.$OCA.Theming) {
				color = this.$OCA.Theming.color
			}
			await this.$store.dispatch('appendCalendar', { displayName: this.$t('tasks', 'Tasks'), color })
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
		 * @param {Object} $event the event
		 */
		closeDetails($event) {
			if (!($event.target.closest('.reactive') || $event.target.classList.contains('reactive')
			|| $event.target.classList.contains('mx-btn') // For some reason the click-outside handlers fire for the datepicker month and year buttons!?
			)
			&& !$event.target.closest('.app-sidebar') && this.$route.params.taskId) {
				if (this.$route.params.calendarId) {
					this.$router.push({ name: 'calendars', params: { calendarId: this.$route.params.calendarId } })
				} else {
					this.$router.push({ name: 'collections', params: { collectionId: this.$route.params.collectionId } })
				}
			}
		},
	},
}
</script>

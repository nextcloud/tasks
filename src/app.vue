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
	<div id="content" class="app-tasks" @click="closeDetails($event)">
		<div id="app-navigation">
			<TheList />
			<TheSettings />
		</div>

		<div id="app-content">
			<div class="content-wrapper">
				<RouterView />
			</div>
		</div>

		<div id="app-sidebar" :class="{disappear: $route.params.taskId === undefined}">
			<RouterView name="details" />
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import TheList from './components/TheList'
import TheSettings from './components/TheSettings'
import client from './services/cdav.js'

export default {
	name: 'App',
	components: {
		'TheSettings': TheSettings,
		'TheList': TheList
	},
	computed: {
		...mapState({
			calendars: state => state.calendars.calendars
		})
	},
	beforeMount() {
		// get calendars then get tasks
		client.connect({ enableCalDAV: true }).then(() => {
			this.$store.dispatch('getCalendars')
				.then((calendars) => {
					// No calendars? Create a new one!
					if (calendars.length === 0) {
						this.$store.dispatch('appendCalendar', { displayName: t('tasks', 'Tasks') })
							.then(() => {
								this.fetchTasks()
							})
					// else, let's get those tasks!
					} else {
						this.fetchTasks()
					}
				})
		})
	},
	methods: {
		/**
		 * Fetch the tasks of each calendar
		 */
		fetchTasks() {
			// wait for all calendars to have fetch their tasks
			Promise.all(this.calendars.map(calendar =>
				this.$store.dispatch('getTasksFromCalendar', { calendar: calendar, completed: false, related: null })
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
			if (!($event.target.closest('.reactive') || $event.target.classList.contains('reactive')) && !$event.target.closest('#app-sidebar')) {
				if (this.$route.params.calendarId) {
					this.$router.push({ path: `/calendars/${this.$route.params.calendarId}` })
				} else {
					this.$router.push({ path: `/collections/${this.$route.params.collectionId}` })
				}
			}
		}
	}
}
</script>

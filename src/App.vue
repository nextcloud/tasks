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
	<NcContent app-name="tasks">
		<AppNavigation />

		<NcAppContent @click="closeAppNavigation">
			<RouterView />
		</NcAppContent>

		<RouterView name="AppSidebar" />
	</NcContent>
</template>

<script>
import AppNavigation from './views/AppNavigation.vue'
import client from './services/cdav.js'

import { emit, subscribe, unsubscribe } from '@nextcloud/event-bus'
import { translate as t } from '@nextcloud/l10n'
import NcAppContent from '@nextcloud/vue/components/NcAppContent'
import NcContent from '@nextcloud/vue/components/NcContent'

import { mapGetters } from 'vuex'
import { useIsMobile } from '@nextcloud/vue'

export default {
	name: 'App',
	components: {
		AppNavigation,
		NcAppContent,
		NcContent,
	},
	inject: ['$OCA'],
	setup() {
		const isMobile = useIsMobile()
		return {
			isMobile,
		}
	},
	data() {
		return {
			searchString: '',
		}
	},
	computed: {
		...mapGetters({
			calendars: 'getTaskCalendars',
		}),
	},
	mounted() {
		subscribe('nextcloud:unified-search.search', this.filterProxy)
		subscribe('nextcloud:unified-search.reset', this.cleanSearch)
	},
	beforeUnmount() {
		unsubscribe('nextcloud:unified-search.search', this.filterProxy)
		unsubscribe('nextcloud:unified-search.reset', this.cleanSearch)
	},
	async beforeMount() {
		this.$store.dispatch('loadCollections')
		this.$store.dispatch('loadSettings')
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
			// wait for all calendars to have fetched their tasks
			Promise.all(this.calendars.map(calendar =>
				this.$store.dispatch('getTasksFromCalendar', { calendar, completed: false, related: null }),
			)).then(() => {
				this.loading = false
			})
		},

		/**
		 * Close the app navigation on mobile devices
		 */
		closeAppNavigation() {
			if (this.isMobile) {
				emit('toggle-navigation', { open: false })
			}
		},
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
}
</script>

<style lang="scss">
/**
 * Since CSS variables can't be used in media queries (yet, see e.g.
 * https://stackoverflow.com/questions/40722882/css-native-variables-not-working-in-media-queries),
 * and var(--breakpoint-mobile) can be used with server v25 upwards only anyway,
 * we have to redefine the value here.
 */
$breakpoint-mobile: 1024px;

// Hack for https://github.com/nextcloud/nextcloud-vue/issues/1384
body {
	min-height: 100%;
	height: auto;
	// Adjustment necessary to use nc/vue@6 with NC25
	position: initial;
}

</style>

<style lang="scss" scoped>
// Adjustment necessary to use nc/vue@6 with NC25
#content-vue {
	max-height: 100vh;
}

.app-content {
	// Adjustment necessary to use nc/vue@6 with NC25
	overflow-y: scroll;
	background-color: var(--color-background-dark) !important;

	> div {
		box-sizing: border-box;
		padding-bottom: 75px;
	}
}
</style>

<!--
@copyright Copyright (c) 2018 Team Popcorn <teampopcornberlin@gmail.com>

@author Team Popcorn <teampopcornberlin@gmail.com>
@author Raimund Schlüßler <raimund.schluessler@mailbox.org>

@license GNU AGPL version 3 or any later version

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.

-->

<template>
	<div class="calendar-shares">
		<ul>
			<li class="app-navigation-entry__multiselect">
				<Multiselect
					id="users-groups-search"
					:options="usersOrGroups"
					:searchable="true"
					:internal-search="false"
					:max-height="600"
					:show-no-results="true"
					:placeholder="placeholder"
					:class="{ 'showContent': inputGiven, 'icon-loading': isLoading }"
					:user-select="true"
					open-direction="bottom"
					track-by="user"
					label="user"
					@search-change="findSharee"
					@input="shareCalendar" />
			</li>
			<!-- list of user or groups calendar is shared with -->
			<CalendarSharee v-for="sharee in calendar.shares"
				:key="sharee.uri"
				:sharee="sharee"
				:calendar="calendar" />
		</ul>
	</div>
</template>

<script>
import client from '../../services/cdav'
import Multiselect from '@nextcloud/vue/dist/Components/Multiselect'

import CalendarSharee from './CalendarSharee'
// import debounce from 'debounce'

export default {
	name: 'CalendarShare',
	components: {
		CalendarSharee,
		Multiselect,
	},
	props: {
		calendar: {
			type: Object,
			default() {
				return {}
			},
		},
	},
	data() {
		return {
			isLoading: false,
			inputGiven: false,
			usersOrGroups: [],
		}
	},
	computed: {
		placeholder() {
			return this.$t('tasks', 'Share with users or groups')
		},
		noResult() {
			return this.$t('tasks', 'No users or groups')
		},
	},
	mounted() {
		// This ensures that the multiselect input is in focus as soon as the user clicks share
		document.getElementById('users-groups-search').focus()
	},
	methods: {
		/**
		 * Share calendar
		 *
		 * @param {Object} data destructuring object
		 * @param {string} data.user the userId
		 * @param {string} data.displayName the displayName
		 * @param {string} data.uri the sharing principalScheme uri
		 * @param {boolean} data.isGroup is this a group ?
		 */
		shareCalendar({ user, displayName, uri, isGroup }) {
			const calendar = this.calendar
			uri = decodeURI(uri)
			user = decodeURI(user)
			this.$store.dispatch('shareCalendar', { calendar, user, displayName, uri, isGroup })
		},

		/**
		 * Use the cdav client call to find matches to the query from the existing Users & Groups
		 *
		 * @param {string} query The query string
		 */
		async findSharee(query) {
			this.isLoading = true
			this.usersOrGroups = []
			if (query.length > 0) {
				const results = await client.principalPropertySearchByDisplayname(query)
				this.usersOrGroups = results.reduce((list, result) => {
					if (['GROUP', 'INDIVIDUAL'].indexOf(result.calendarUserType) > -1
					&& !this.calendar.shares.some((share) => share.uri === result.principalScheme)) {
						const isGroup = result.calendarUserType === 'GROUP'
						list.push({
							user: result[isGroup ? 'groupId' : 'userId'],
							displayName: result.displayname,
							icon: isGroup ? 'icon-group' : 'icon-user',
							uri: result.principalScheme,
							isGroup,
						})
					}
					return list
				}, [])
				this.isLoading = false
				this.inputGiven = true
			} else {
				this.inputGiven = false
				this.isLoading = false
			}
		},
	},
}
</script>

<!--
@copyright Copyright (c) 2018 Team Popcorn <teampopcornberlin@gmail.com>
@copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
@copyright Copyright (c) 2019 Jakob Röhrl <jakob.roehrl@web.de>
@copyright Copyright (c) 2020 Raimund Schlüßler <raimund.schluessler@mailbox.org>

@author Team Popcorn <teampopcornberlin@gmail.com>
@author Georg Ehrke <oc.list@georgehrke.com>
@author Jakob Röhrl <jakob.roehrl@web.de>
@author Raimund Schlüßler <raimund.schluessler@mailbox.org>

@license GNU Affero General Public License v3.0 or later

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
			<li class="app-navigation-entry__select">
				<NcSelect ref="select"
					:options="usersOrGroups"
					:placeholder="placeholder"
					:user-select="true"
					@search="findSharee"
					@option:selected="shareCalendar">
					<template #no-options>
						<span>{{ noResult }}</span>
					</template>
				</NcSelect>
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
import CalendarSharee from './CalendarSharee.vue'
import client from '../../services/cdav.js'
import { urldecode } from '../../utils/url.js'

import Axios from '@nextcloud/axios'
import { translate as t } from '@nextcloud/l10n'
import { generateOcsUrl } from '@nextcloud/router'
import NcSelect from '@nextcloud/vue/dist/Components/NcSelect.js'

import debounce from 'debounce'

export default {
	name: 'CalendarShare',
	components: {
		CalendarSharee,
		NcSelect,
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
			usersOrGroups: [],
		}
	},
	computed: {
		placeholder() {
			return t('tasks', 'Share with users or groups')
		},
		noResult() {
			return t('tasks', 'No users or groups')
		},
	},
	mounted() {
		// This ensures that the select input is in focus as soon as the user clicks share
		this.$refs.select?.focus?.()
	},
	methods: {
		/**
		 * Share calendar
		 *
		 * @param {object} data destructuring object
		 * @param {string} data.user the userId
		 * @param {string} data.displayName the displayName
		 * @param {string} data.uri the sharing principalScheme uri
		 * @param {boolean} data.isGroup is this a group ?
		 * @param {boolean} data.isCircle is this a circle?
		 */
		shareCalendar({ user, displayName, uri, isGroup, isCircle }) {
			this.$store.dispatch('shareCalendar', { calendar: this.calendar, user, displayName, uri, isGroup, isCircle })
		},

		/**
		 * Use the cdav client call to find matches to the query from the existing Users & Groups
		 *
		 * @param {string} search
		 */
		findSharee: debounce(async function(search, loading) {
			const hiddenPrincipalSchemes = []
			const hiddenUrls = []
			this.calendar.shares.forEach((share) => {
				hiddenPrincipalSchemes.push(share.uri)
			})
			if (this.$store.getters.getCurrentUserPrincipal) {
				hiddenUrls.push(this.$store.getters.getCurrentUserPrincipal.url)
			}
			if (this.calendar.owner) {
				hiddenUrls.push(this.calendar.owner)
			}

			this.usersOrGroups = []

			if (search.length > 0) {
				loading(true)
				const davPromise = this.findShareesFromDav(search, hiddenPrincipalSchemes, hiddenUrls)
				const ocsPromise = this.findShareesFromCircles(search, hiddenPrincipalSchemes, hiddenUrls)

				const [davResults, ocsResults] = await Promise.all([davPromise, ocsPromise])
				this.usersOrGroups = [
					...davResults,
					...ocsResults,
				]
				loading(false)
			}
		}, 500),
		/**
		 *
		 * @param {string} query The search query
		 * @param {string[]} hiddenPrincipals A list of principals to exclude from search results
		 * @param {string[]} hiddenUrls A list of urls to exclude from search results
		 * @return {Promise<object[]>}
		 */
		async findShareesFromDav(query, hiddenPrincipals, hiddenUrls) {
			let results
			try {
				results = await client.principalPropertySearchByDisplayname(query)
			} catch (error) {
				return []
			}

			return results.reduce((list, result) => {
				if (['ROOM', 'RESOURCE'].includes(result.calendarUserType)) {
					return list
				}

				const isGroup = result.calendarUserType === 'GROUP'

				// TODO: Why do we have to decode those two values?
				const user = urldecode(result[isGroup ? 'groupId' : 'userId'])
				const decodedPrincipalScheme = urldecode(result.principalScheme)

				if (hiddenPrincipals.includes(decodedPrincipalScheme)) {
					return list
				}
				if (hiddenUrls.includes(result.url)) {
					return list
				}

				// Don't show resources and rooms
				if (!['GROUP', 'INDIVIDUAL'].includes(result.calendarUserType)) {
					return list
				}

				list.push({
					user,
					displayName: result.displayname,
					icon: isGroup ? 'icon-group' : 'icon-user',
					uri: decodedPrincipalScheme,
					isGroup,
					isCircle: false,
					isNoUser: isGroup,
					search: query,
				})
				return list
			}, [])
		},
		/**
		 *
		 * @param {string} query The search query
		 * @param {string[]} hiddenPrincipals A list of principals to exclude from search results
		 * @param {string[]} hiddenUrls A list of urls to exclude from search results
		 * @return {Promise<object[]>}
		 */
		async findShareesFromCircles(query, hiddenPrincipals, hiddenUrls) {
			let results
			try {
				results = await Axios.get(generateOcsUrl('apps/files_sharing/api/v1/') + 'sharees', {
					params: {
						format: 'json',
						search: query,
						perPage: 200,
						itemType: 'principals',
					},
				})
			} catch (error) {
				return []
			}

			if (results.data.ocs.meta.status === 'failure') {
				return []
			}
			let circles = []
			if (Array.isArray(results.data.ocs.data.circles)) {
				circles = circles.concat(results.data.ocs.data.circles)
			}
			if (Array.isArray(results.data.ocs.data.exact.circles)) {
				circles = circles.concat(results.data.ocs.data.exact.circles)
			}

			if (circles.length === 0) {
				return []
			}

			return circles.filter((circle) => {
				return !hiddenPrincipals.includes('principal:principals/circles/' + circle.value.shareWith)
			}).map(circle => ({
				user: circle.label,
				displayName: circle.label,
				icon: 'icon-circle',
				uri: 'principal:principals/circles/' + circle.value.shareWith,
				isGroup: false,
				isCircle: true,
				isNoUser: true,
				search: query,
			}))
		},
	},
}
</script>

<style lang="scss" scoped>
.calendar-shares .app-navigation-entry {

	&-wrapper::v-deep {
		.app-navigation-entry {
			padding-left: 0 !important;

			&__utils {
				.action-checkbox__label {
					padding-right: 0 !important;
				}

				.action-checkbox__label::before {
					margin: 4px 4px 0 !important;
				}
			}
		}
	}

	&__select::v-deep .v-select {
		width: 100%;
	}
}
</style>

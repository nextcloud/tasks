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
	<AppNavigationSettings>
		<div class="reactive">
			<ul>
				<li>
					<label for="defaultCalendar">
						{{ $t('tasks', 'Default list') }}
					</label>
					<select id="defaultCalendar" v-model="defaultCalendarId">
						<option v-for="calendar in calendars"
							:key="calendar.id"
							:value="calendar.id">
							{{ calendar.displayName }}
						</option>
					</select>
				</li>
				<li class="headline">
					{{ $t('tasks', 'Visibility of Smart Collections') }}
				</li>
				<li v-for="collection in collections"
					:key="collection.id"
					class="collection">
					<div :class="collection.icon" class="icon" />
					<span class="label-container">
						<label :for="'visibilityCollection-' + collection.id" class="title">
							{{ collection.displayName }}
						</label>
					</span>
					<select :id="'visibilityCollection-' + collection.id"
						:value="collection.show"
						@change="setVisibility({ id: collection.id, show: +$event.target.value })">
						<option v-for="collectionOption in collectionOptions"
							:key="collectionOption.id"
							:value="collectionOption.id">
							{{ collectionOption.name }}
						</option>
					</select>
				</li>
			</ul>
		</div>
	</AppNavigationSettings>
</template>

<script>
import moment from '@nextcloud/moment'
import AppNavigationSettings from '@nextcloud/vue/dist/Components/AppNavigationSettings'

import { mapState, mapGetters, mapActions } from 'vuex'

export default {
	components: {
		AppNavigationSettings,
	},
	data() {
		return {
			collectionOptions: [
				{
					id: 0,
					name: this.$t('tasks', 'Hidden'),
				},
				{
					id: 1,
					name: this.$t('tasks', 'Visible'),
				},
				{
					id: 2,
					name: this.$t('tasks', 'Automatic'),
				},
			],
			dayOfMonth: moment().date(),
		}
	},
	computed: {
		defaultCalendarId: {
			get() {
				const cal = this.$store.getters.getDefaultCalendar
				return cal ? cal.id : ''
			},
			set(value) {
				this.$store.dispatch('setSetting', { type: 'defaultCalendarId', value })
			},
		},
		...mapState({
			collections: state => state.collections.collections,
		}),
		...mapGetters({
			calendars: 'getSortedWritableCalendars',
		}),
	},
	methods:
		mapActions([
			'setVisibility',
		]),
}
</script>

<style lang="scss" scoped>
li {
	display: flex;
	align-items: center;
	height: 44px;

	&.headline {
		font-weight: bold;
	}

	&.collection {
		.icon {
			display: flex;
			align-items: center;
			flex: 0 0 44px;
			justify-content: center;
			width: 44px;
			height: 44px;
			background-size: 16px 16px;
			background-image: unset;
			margin-left: -10px;

			&::before {
				content: '';
				width: 16px;
				height: 16px;
				background: var(--icon-tasks-sprt-bw-000) no-repeat;
				background-position: inherit;
			}
		}

		.label-container {
			white-space: nowrap;
			text-overflow: ellipsis;
			overflow: hidden;
			display: flex;
			align-items: center;
		}
	}

	select {
		min-width: 105px;
		text-overflow: ellipsis;
		margin-left: auto;
	}

	label {
		white-space: nowrap;
		padding-right: 10px;
	}
}
</style>

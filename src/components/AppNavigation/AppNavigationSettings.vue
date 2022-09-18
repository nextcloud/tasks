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
	<NcAppNavigationSettings :title="appNavigationSettingsTitle">
		<div class="reactive">
			<ul>
				<li>
					<label for="defaultCalendar">
						{{ t('tasks', 'Default list') }}
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
					{{ t('tasks', 'Visibility of Smart Collections') }}
				</li>
				<li v-for="collection in collections"
					:key="collection.id"
					class="collection">
					<component :is="collection.icon" :size="20" />
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
	</NcAppNavigationSettings>
</template>

<script>
import { translate as t } from '@nextcloud/l10n'
import moment from '@nextcloud/moment'
import NcAppNavigationSettings from '@nextcloud/vue/dist/Components/NcAppNavigationSettings.js'

import CalendarToday from 'vue-material-design-icons/CalendarToday.vue'
import CalendarWeek from 'vue-material-design-icons/CalendarWeek.vue'
import CircleOutline from 'vue-material-design-icons/CircleOutline.vue'
import Check from 'vue-material-design-icons/Check.vue'
import Star from 'vue-material-design-icons/Star.vue'
import TrendingUp from 'vue-material-design-icons/TrendingUp.vue'

import { mapState, mapGetters, mapActions } from 'vuex'

export default {
	components: {
		NcAppNavigationSettings,
		CalendarToday,
		CalendarWeek,
		CircleOutline,
		Check,
		Star,
		TrendingUp,
	},
	data() {
		return {
			collectionOptions: [
				{
					id: 0,
					name: t('tasks', 'Hidden'),
				},
				{
					id: 1,
					name: t('tasks', 'Visible'),
				},
				{
					id: 2,
					name: t('tasks', 'Automatic'),
				},
			],
			dayOfMonth: moment().date(),
		}
	},
	computed: {
		appNavigationSettingsTitle() {
			return t('tasks', 'Tasks settings')
		},

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
	methods: {
		t,

		...mapActions([
			'setVisibility',
		]),
	},
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
		.material-design-icon {
			margin-right: 16px;
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

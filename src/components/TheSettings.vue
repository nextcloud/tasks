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
	<div id="app-settings" ng-controller="SettingsController">
		<div id="app-settings-header">
			<button class="settings-button" data-apps-slide-toggle="#app-settings-content">
				<span>{{ t('tasks', 'Settings') }}</span>
			</button>
		</div>
		<div id="app-settings-content">
			<ul>
				<li>
					<label for="startOfWeek">{{ t('tasks', 'Start of week') }}</label>
					<select id="startOfWeek" v-model="startOfWeek">
						<option v-for="startOfWeekOption in startOfWeekOptions"
							:value="startOfWeekOption.id"
							:key="startOfWeekOption.id">
							{{ startOfWeekOption.name }}
						</option>
					</select>
				</li>
				<li class="headline">
					{{ t('tasks', 'Visibility of Smart Collections') }}
				</li>
				<li v-for="collection in collections"
					:key="collection.id">
					<div class="label-container">
						<span :class="collection.icon" class="icon">
							<text v-if="collection.id=='today'">{{ dayOfMonth }}</text>
						</span>
						<label :for="'visibilityCollection-' + collection.id" class="title">{{ collection.displayname }}</label>
					</div>
					<select :id="'visibilityCollection-' + collection.id"
						v-model="collection.show"
						@change="setVisibility(collection)">
						<option v-for="collectionOption in collectionOptions"
							:value="collectionOption.id"
							:key="collectionOption.id">
							{{ collectionOption.name }}
						</option>
					</select>
				</li>
			</ul>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'

export default {
	components: {
	},
	data: function() {
		return {
			collectionOptions: [
				{
					id: 0,
					name: t('tasks', 'Hidden')
				},
				{
					id: 1,
					name: t('tasks', 'Visible')
				},
				{
					id: 2,
					name: t('tasks', 'Automatic')
				}
			],
			startOfWeekOptions: [
				{
					id: 0,
					name: t('tasks', 'Sunday')
				},
				{
					id: 1,
					name: t('tasks', 'Monday')
				},
				{
					id: 2,
					name: t('tasks', 'Tuesday')
				},
				{
					id: 3,
					name: t('tasks', 'Wednesday')
				},
				{
					id: 4,
					name: t('tasks', 'Thursday')
				},
				{
					id: 5,
					name: t('tasks', 'Friday')
				},
				{
					id: 6,
					name: t('tasks', 'Saturday')
				}
			]
		}
	},
	computed: Object.assign({
		startOfWeek: {
			get() {
				return this.$store.state.settings.startOfWeek
			},
			set(value) {
				this.$store.dispatch('setSetting', { type: 'startOfWeek', value: value })
			}
		}
	},
	mapState({
		collections: state => state.collections,
		calendars: state => state.calendars,
		dayOfMonth: state => state.dayOfMonth
	})
	),
	methods: {
		setVisibility: function(collection) {
		}
	}
}
</script>

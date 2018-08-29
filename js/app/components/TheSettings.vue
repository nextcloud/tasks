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
					<select id="startOfWeek"
						ng-change="setStartOfWeek()"
						ng-model="settingsmodel.getById('various').startOfWeek"
						ng-options="startOfWeekOption.id as startOfWeekOption.name for startOfWeekOption in startOfWeekOptions">
					</select>
				</li>
				<li class="headline">
					{{ t('tasks', 'Visibility of Smart Collections') }}
				</li>
				<li v-for="collection in collections"
					:key="collection.id">
					<div class="label-container">
						<span class="icon" :class="collection.icon">
							<text ng-show="collection.id=='today'">{{ dayOfMonth }}</text>
						</span>
						<label :for="'visibilityCollection-' + collection.id" class="title">{{ collection.displayname }}</label>
					</div>
					<select :id="'visibilityCollection-' + collection.id"
						ng-change="setVisibility(collection.id)"
						ng-model="collection.show"
						ng-options="collectionOption.id as collectionOption.name for collectionOption in collectionOptions">
					</select>
				</li>
			</ul>
		</div>
	</div>
</template>

<script>
	import { mapState } from 'vuex';

	export default {
		computed: Object.assign({},
			mapState({
				collections: state => state.collections,
				calendars: state => state.calendars,
				dayOfMonth: state => state.dayOfMonth
			})
		),
		components: {
		}
	}
</script>

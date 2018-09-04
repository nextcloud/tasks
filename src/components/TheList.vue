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
	<ul id="collections">
		<router-link
			v-for="collection in collections"
			:id="'collection_' + collection.id"
			:collection-id="collection.id"
			:to="'/collections/' + collection.id"
			:key="collection.id"
			:class="[collection.icon, {'animate-up': hideCollection(collection) }]"
			tag="li" class="collection reactive"
			active-class="active"
			dnd-list="draggedTasks"
			dnd-drop="dropCollection(event, index, item)"
			dnd-dragover="dragoverCollection(event, index)">
			<a class="sprite">
				<span v-if="collection.id=='today'" class="date">{{ dayOfMonth }}</span>
				<span class="title">{{ collection.displayname }}</span>
			</a>
			<div v-if="collection.id!='completed'" class="app-navigation-entry-utils">
				<ul>
					<li class="app-navigation-entry-utils-counter">{{ getCollectionCount(collection.id) | counterFormatter }}</li>
				</ul>
			</div>
		</router-link>
		<router-link
			v-for="calendar in calendars"
			:id="'list_' + calendar.uri"
			:calendar-id="calendar.uri"
			:to="'/calendars/' + calendar.uri"
			:key="calendar.uri"
			tag="li"
			class="list with-menu handler editing"
			active-class="active"
			ng-class="edit:route.listparameter == 'name' && route.calendarID == calendar.uri,
						caldav: route.listparameter == 'caldav' && route.calendarID == calendar.uri}"
			dnd-list="draggedTasks"
			dnd-drop="dropList(event, index, item)"
			dnd-dragover="dragoverList(event, index)">
			<div :style="{'background-color': calendar.color}" class="app-navigation-entry-bullet" />
			<a ng-dblclick="startRename(calendar)">
				<span class="title">{{ calendar.displayname }}</span>
			</a>
			<div class="app-navigation-entry-utils">
				<ul>
					<li class="app-navigation-entry-utils-counter">{{ getCalendarCount(calendar.uri) | counterFormatter }}</li>
					<popover v-show="calendar.writable" tag="li" class="app-navigation-entry-utils-menu-button">
						<ul>
							<li>
								<a ng-click="startEdit(calendar)">
									<span class="icon-rename" />
									<span>{{ t('tasks', 'Edit') }}</span>
								</a>
							</li>
							<li>
								<a ng-click="showCalDAVUrl(calendar)">
									<span class="icon-public" />
									<span>{{ t('tasks', 'Link') }}</span>
								</a>
							</li>
							<li>
								<a :href="exportUrl(calendar)" :download="calendar.uri + '.ics'">
									<span class="icon-download" />
									<span>{{ t('tasks', 'Download') }}</span>
								</a>
							</li>
							<li confirmation="delete(calendar)" confirmation-message="deleteMessage(calendar)" />
						</ul>
					</popover>
				</ul>
			</div>
			<div class="app-navigation-entry-edit name" ng-class="{error: nameError}">
				<form>
					<input ng-model="calendar.displayname"
						class="edit hasTooltip"
						type="text"
						ng-keyup="checkEdit($event,calendar)"
						autofocus-on-insert>
					<input :title="t('tasks', 'Cancel')"
						type="cancel"
						value=""
						class="action icon-close"
						ng-click="cancelEdit(calendar)">
					<input :title="t('tasks', 'Save')"
						type="submit"
						value=""
						class="action icon-checkmark"
						ng-click="saveEdit(calendar)">
				</form>
				<colorpicker class="colorpicker" selected="calendar.color" />
			</div>
			<div class="app-navigation-entry-edit caldav">
				<form>
					<input class="caldav"
						ng-value="calendar.caldav"
						readonly
						type="text">
					<input :title="t('tasks', 'Cancel')"
						type="cancel"
						value=""
						class="action icon-close"
						ng-click="hideCalDAVUrl()">
				</form>
			</div>
		</router-link>
		<li class="newList handler icon-add reactive editing" ng-class="{edit: status.addingList}">
			<a class="addlist icon sprite"
				ng-click="startCreate()"
				oc-click-focus="{selector: '#newList', timeout: 0}">
				<span class="title">{{ t('tasks', 'Add List...') }}</span>
			</a>
			<div class="app-navigation-entry-edit name" ng-class="{error: nameError}">
				<form ng-disabled="isAddingList">
					<input id="newList"
						:placeholder="t('tasks', 'New List')"
						ng-model="status.newListName"
						class="edit hasTooltip"
						type="text"
						autofocus-on-insert
						ng-keyup="checkNew($event,status.newListName)">
					<input :title="t('tasks', 'Cancel')"
						type="cancel"
						value=""
						class="action icon-close"
						ng-click="cancelCreate()">
					<input :title="t('tasks', 'Save')"
						type="submit"
						value=""
						class="action icon-checkmark"
						ng-click="create($event)">
				</form>
				<colorpicker class="colorpicker" selected="color" />
			</div>
		</li>
	</ul>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import Colorpicker from './Colorpicker'
import PopoverMenu from './PopoverMenu'

export default {
	components: {
		'colorpicker': Colorpicker,
		'popover': PopoverMenu
	},
	filters: {
		counterFormatter: function(count) {
			switch (false) {
			case count !== 0:
				return ''
			case count < 999:
				return '999+'
			default:
				return count
			}
		}
	},
	computed: Object.assign({},
		mapState({
			collections: state => state.collections,
			calendars: state => state.calendars,
			dayOfMonth: state => state.dayOfMonth
		}),
		mapGetters([
			'getCollectionCount',
			'getCalendarCount'
		])
	),
	methods: {
		hideCollection: function(collection) {
			switch (collection.show) {
			case 0:
				return true
			case 1:
				return false
			case 2:
				return this.getCollectionCount(collection.id) < 1
			}
		},
		exportUrl(calendar) {
			var url = calendar.url
			// cut off last slash to have a fancy name for the ics
			if (url.slice(url.length - 1) === '/') {
				url = url.slice(0, url.length - 1)
			}
			url += '?export'
			return url
		}
	}
}
</script>

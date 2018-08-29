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
			tag="li"
			v-bind:id="'collection_' + collection.id"
			v-bind:collectionID="collection.id"
			:to="'/collections/' + collection.id"
			:key="collection.id"
			class="collection reactive" :class="collection.icon"
			active-class="active"
			ng-class="{'animate-up': hideCollection(collection.id)}"
			dnd-list="draggedTasks"
			dnd-drop="dropCollection(event, index, item)"
			dnd-dragover="dragoverCollection(event, index)">
			<a class="sprite">
				<span class="date" v-if="collection.id=='today'">{{ dayOfMonth }}</span>
				<span class="title">{{ collection.displayname }}</span>
			</a>
			<div class="app-navigation-entry-utils">
				<ul>
					<!-- <li class="app-navigation-entry-utils-counter">{{ getCollectionString(collection.id) | counterFormatter }}</li> -->
				</ul>
			</div>
		</router-link>
		<router-link
			v-for="calendar in calendars"
			tag="li"
			v-bind:id="'list_' + calendar.uri"
			v-bind:calendarID="calendar.uri"
			:to="'/calendars/' + calendar.uri"
			:key="calendar.uri"
			class="list with-menu handler editing"
			active-class="active"
			ng-class="edit:route.listparameter == 'name' && route.calendarID == calendar.uri,
						caldav: route.listparameter == 'caldav' && route.calendarID == calendar.uri}"
			dnd-list="draggedTasks"
			dnd-drop="dropList(event, index, item)"
			dnd-dragover="dragoverList(event, index)">
			<div class="app-navigation-entry-bullet" :style="'background-color: ' + calendar.color + ';'"></div>
			<a ng-dblclick="startRename(calendar)">
				<span class="title">{{ calendar.displayname }}</span>
			</a>
			<div class="app-navigation-entry-utils">
				<ul>
					<!-- <li class="app-navigation-entry-utils-counter">{{ getListCount(calendar.uri,'all') | counterFormatter }}</li> -->
					<li class="app-navigation-entry-utils-menu-button" v-show="calendar.writable"><button></button></li>
				</ul>
			</div>
			<div class="app-navigation-entry-menu" v-show="calendar.writable">
				<ul>
					<li>
						<a ng-click="startEdit(calendar)">
							<span class="icon-rename"></span>
							<span>{{ t('tasks', 'Edit') }}</span>
						</a>
					</li>
					<li>
						<a ng-click="showCalDAVUrl(calendar)">
							<span class="icon-public"></span>
							<span>{{ t('tasks', 'Link') }}</span>
						</a>
					</li>
					<li>
						<a :href="calendar.exportUrl" :download="calendar.uri + '.ics'">
							<span class="icon-download"></span>
							<span>{{ t('tasks', 'Download') }}</span>
						</a>
					</li>
					<li confirmation="delete(calendar)" confirmation-message="deleteMessage(calendar)">
					</li>
				</ul>
			</div>
			<div class="app-navigation-entry-edit name" ng-class="{error: nameError}">
				<form>
					<input ng-model="calendar.displayname"
						class="edit hasTooltip"
						type="text"
						ng-keyup="checkEdit($event,calendar)"
						autofocus-on-insert>
					<input type="cancel"
						value=""
						class="action icon-close"
						ng-click="cancelEdit(calendar)"
						v-bind:title="t('tasks', 'Cancel')">
					<input type="submit"
						value=""
						class="action icon-checkmark"
						ng-click="saveEdit(calendar)"
						v-bind:title="t('tasks', 'Save')">
				</form>
				<colorpicker class="colorpicker" selected="calendar.color"/>
			</div>
			<div class="app-navigation-entry-edit caldav">
				<form>
					<input class="caldav"
						ng-value="calendar.caldav"
						readonly
						type="text"/>
					<input type="cancel"
						value=""
						class="action icon-close"
						ng-click="hideCalDAVUrl()"
						v-bind:title="t('tasks', 'Cancel')">
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
						ng-model="status.newListName"
						class="edit hasTooltip"
						type="text"
						autofocus-on-insert
						v-bind:placeholder="t('tasks', 'New List')"
						ng-keyup="checkNew($event,status.newListName)">
					<input type="cancel"
						value=""
						class="action icon-close"
						ng-click="cancelCreate()"
						v-bind:title="t('tasks', 'Cancel')">
					<input type="submit"
						value=""
						class="action icon-checkmark"
						ng-click="create($event)"
						v-bind:title="t('tasks', 'Save')">
				</form>
				<colorpicker class="colorpicker" selected="color"/>
			</div>
		</li>
	</ul>
</template>

<script>
	import { mapState } from 'vuex';
	import Colorpicker from './Colorpicker.vue';

	export default {
		computed: Object.assign({},
			mapState({
				collections: state => state.collections,
				calendars: state => state.calendars,
				dayOfMonth: state => state.dayOfMonth
			})
		),
		components: {
			'colorpicker': Colorpicker,
		}
	}
</script>

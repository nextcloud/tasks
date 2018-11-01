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
				<span class="title">{{ collection.displayName }}</span>
			</a>
			<div v-if="collection.id!='completed'" class="app-navigation-entry-utils">
				<ul>
					<li class="app-navigation-entry-utils-counter">{{ collectionCount(collection.id) | counterFormatter }}</li>
				</ul>
			</div>
		</router-link>
		<router-link
			v-click-outside="() => resetView(calendar)"
			v-for="calendar in calendars"
			:id="'list_' + calendar.id"
			:calendar-id="calendar.id"
			:to="'/calendars/' + calendar.id"
			:key="calendar.id"
			:class="{edit: editing == calendar.id, caldav: caldav == calendar.id}"
			tag="li"
			class="list with-menu editing"
			active-class="active"
			dnd-list="draggedTasks"
			dnd-drop="dropList(event, index, item)"
			dnd-dragover="dragoverList(event, index)">
			<div :style="{'background-color': calendar.color}" class="app-navigation-entry-bullet" />
			<a>
				<span class="title">{{ calendar.displayName }}</span>
			</a>
			<div class="app-navigation-entry-utils">
				<ul>
					<li class="app-navigation-entry-utils-counter">{{ calendarCount(calendar.id) | counterFormatter }}</li>
					<popover v-show="!calendar.readOnly" tag="li" class="app-navigation-entry-utils-menu-button">
						<ul>
							<li>
								<a @click="edit(calendar)">
									<span class="icon-rename" />
									<span>{{ t('tasks', 'Edit') }}</span>
								</a>
							</li>
							<li>
								<a @click="showCalDAVUrl(calendar)">
									<span class="icon-public" />
									<span>{{ t('tasks', 'Link') }}</span>
								</a>
							</li>
							<li>
								<a :href="exportUrl(calendar)" :download="calendar.id + '.ics'">
									<span class="icon-download" />
									<span>{{ t('tasks', 'Download') }}</span>
								</a>
							</li>
							<confirmation :message="deleteMessage(calendar.displayName)" @delete-calendar="deleteCalendar(calendar, ...arguments)" />
						</ul>
					</popover>
				</ul>
			</div>
			<div :class="{error: nameError}" class="app-navigation-entry-edit name">
				<form>
					<input v-tooltip="{
							content: tooltipMessage,
							show: showTooltip(calendar.id),
							trigger: 'manual'
						}"
						v-model="newCalendarName"
						class="edit"
						type="text"
						autofocus-on-insert
						@keyup="checkName($event, calendar.id)">
					<input :title="t('tasks', 'Cancel')"
						type="cancel"
						value=""
						class="action icon-close"
						@click="resetView(calendar)">
					<input :title="t('tasks', 'Save')"
						type="submit"
						value=""
						class="action icon-checkmark"
						@click="save(calendar)">
				</form>
				<colorpicker :selected-color="selectedColor" @color-selected="setColor(...arguments)" />
			</div>
			<div class="app-navigation-entry-edit caldav">
				<form>
					<input :value="calendar.caldav"
						class="caldav"
						readonly
						type="text">
					<input :title="t('tasks', 'Cancel')"
						type="cancel"
						value=""
						class="action icon-close"
						@click="resetView(calendar)">
				</form>
			</div>
		</router-link>
		<li v-click-outside="cancelCreate" :class="{edit: creating}" class="newList icon-add reactive editing">
			<a class="addlist icon sprite"
				oc-click-focus="{selector: '#newList', timeout: 0}"
				@click="startCreate($event)">
				<span class="title">{{ t('tasks', 'Add List...') }}</span>
			</a>
			<div :class="{error: nameError}" class="app-navigation-entry-edit name">
				<form>
					<input v-tooltip="{
							content: tooltipMessage,
							show: showTooltip('new'),
							trigger: 'manual'
						}"
						id="newList"
						:placeholder="t('tasks', 'New List')"
						v-model="newCalendarName"
						class="edit"
						type="text"
						autofocus-on-insert
						@keyup="checkName($event, 'new')">
					<input :title="t('tasks', 'Cancel')"
						type="cancel"
						value=""
						class="action icon-close"
						@click="cancelCreate">
					<input :title="t('tasks', 'Save')"
						type="submit"
						value=""
						class="action icon-checkmark"
						@click="create($event)">
				</form>
				<colorpicker :selected-color="selectedColor" @color-selected="setColor(...arguments)" />
			</div>
		</li>
	</ul>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import Colorpicker from './Colorpicker'
import PopoverMenu from './PopoverMenu'
import Confirmation from './Confirmation'

import clickOutside from 'vue-click-outside'

export default {
	components: {
		'colorpicker': Colorpicker,
		'popover': PopoverMenu,
		'confirmation': Confirmation,
		clickOutside
	},
	directives: {
		clickOutside
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
	data() {
		return {
			editing: '',
			caldav: '',
			creating: false,
			nameError: false,
			newCalendarName: '',
			selectedColor: '',
			tooltipMessage: '',
			tooltipTarget: '',
			dayOfMonth: moment().date()
		}
	},
	computed: Object.assign({},
		mapState({
			collections: state => state.collections.collections
		}),
		mapGetters({
			calendars: 'getSortedCalendars',
			collectionCount: 'getCollectionCount',
			calendarCount: 'getCalendarCount',
			isCalendarNameUsed: 'isCalendarNameUsed'
		})
	),
	methods: Object.assign(
		mapActions([
			'changeCalendar'
		]),
		{
			hideCollection: function(collection) {
				switch (collection.show) {
				case 0:
					return true
				case 1:
					return false
				case 2:
					return this.collectionCount(collection.id) < 1
				}
			},
			showTooltip: function(target) {
				return this.tooltipTarget === target
			},
			edit: function(calendar) {
				this.editing = calendar.id
				this.newCalendarName = calendar.displayName
				this.selectedColor = calendar.color
				this.nameError = false
				this.tooltipTarget = ''
			},
			resetView: function(calendar) {
				if (this.editing === calendar.id) {
					this.editing = ''
				}
				if (this.caldav === calendar.id) {
					this.caldav = ''
				}
				this.tooltipTarget = ''
			},
			showCalDAVUrl: function(calendar) {
				this.caldav = calendar.id
			},
			exportUrl(calendar) {
				var url = calendar.url
				// cut off last slash to have a fancy name for the ics
				if (url.slice(url.length - 1) === '/') {
					url = url.slice(0, url.length - 1)
				}
				url += '?export'
				return url
			},
			setColor: function(color) {
				this.selectedColor = color
			},
			startCreate: function(e) {
				if (OCA.Theming) {
					this.selectedColor = OCA.Theming.color
				} else {
					this.selectedColor = '#0082C9'
				}
				this.newCalendarName = ''
				this.creating = true
				e.stopPropagation()
			},
			cancelCreate: function() {
				this.creating = false
			},
			create: function() {
				// TODO: Call correct methods of store
				console.log('Create new calendar with name ' + this.newCalendarName + ' and color ' + this.selectedColor)
				this.creating = false
			},
			save: function(calendar) {
				this.changeCalendar({ calendar: calendar, newName: this.newCalendarName, newColor: this.selectedColor })
				this.editing = false
			},
			checkName: function(event, id) {
				var check = this.isNameAllowed(this.newCalendarName, id)
				this.tooltipMessage = check.msg
				if (!check.allowed) {
					this.tooltipTarget = id
					this.nameError = true
				} else {
					this.tooltipTarget = ''
					this.nameError = false
				}
				if (event.keyCode === 27) {
					event.preventDefault()
					this.tooltipTarget = ''
					this.creating = false
					this.editing = false
					this.nameError = false
				}
			},
			isNameAllowed: function(name, id) {
				var check = {
					allowed:	false,
					msg:	''
				}
				if (this.isCalendarNameUsed(name, id)) {
					check.msg = t('tasks', 'The name "%s" is already used.').replace('%s', name)
				} else if (!name) {
					check.msg = t('tasks', 'An empty name is not allowed.')
				} else {
					check.allowed = true
				}
				return check
			},
			deleteMessage: function(name) {
				return t('tasks', 'This will delete the calendar "%s" and all corresponding events and tasks.').replace('%s', name)
			},
			deleteCalendar: function(calendar) {
				console.log('Delete calendar ' + calendar.id)
			}
		}
	)
}
</script>

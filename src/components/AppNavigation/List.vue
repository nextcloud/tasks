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
		<AppNavigationItem
			v-for="collection in collections"
			v-show="!hideCollection(collection)"
			:id="'collection_' + collection.id"
			:key="collection.id"
			:collection-id="collection.id"
			:icon="collection.icon"
			:to="{ name: 'collections', params: { collectionId: collection.id } }"
			:title="collection.displayName"
			class="collection reactive"
			@add="dropTaskOnCollection(...arguments, collection)">
			<AppNavigationCounter slot="counter">
				{{ collectionCount(collection.id) | counterFormatter }}
			</AppNavigationCounter>
		</AppNavigationItem>
		<ListItemCalendar
			v-for="calendar in calendars"
			:key="calendar.id"
			:calendar="calendar" />
		<AppNavigationItem v-click-outside="cancelCreate"
			:title="$t('tasks', 'Add List…')"
			icon="icon-add"
			:class="{edit: creating}"
			class="collection reactive"
			@click="startCreate($event)">
			<div :class="{error: nameError}" class="app-navigation-entry-edit">
				<form>
					<input id="newListInput"
						v-model="newCalendarName"
						v-tooltip="{
							content: tooltipMessage,
							show: showTooltip('list_'),
							trigger: 'manual'
						}"
						:placeholder="$t('tasks', 'New List')"
						class="edit"
						type="text"
						@keyup="checkName($event, null, create)">
					<input :title="$t('tasks', 'Cancel')"
						type="cancel"
						value=""
						class="action icon-close"
						@click="cancelCreate">
					<input :title="$t('tasks', 'Save')"
						type="button"
						value=""
						class="action icon-checkmark"
						@click="create($event)">
				</form>
				<Colorpicker :selected-color="selectedColor" @color-selected="setColor(...arguments)" />
			</div>
		</AppNavigationItem>
	</ul>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import ListItemCalendar from './ListItemCalendar'
import Colorpicker from './Colorpicker'

import ClickOutside from 'vue-click-outside'
import AppNavigationItem from '@nextcloud/vue/dist/Components/AppNavigationItem'
import AppNavigationCounter from '@nextcloud/vue/dist/Components/AppNavigationCounter'

export default {
	components: {
		ListItemCalendar,
		Colorpicker,
		AppNavigationItem,
		AppNavigationCounter,
	},
	directives: {
		ClickOutside,
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
		},
	},
	data() {
		return {
			editing: '',
			shareOpen: '',
			copySuccess: false,
			copied: false,
			creating: false,
			nameError: false,
			newCalendarName: '',
			selectedColor: '',
			tooltipMessage: '',
			tooltipTarget: '',
		}
	},
	computed: {
		...mapState({
			collections: state => state.collections.collections,
		}),
		...mapGetters({
			calendars: 'getSortedCalendars',
			collectionCount: 'getCollectionCount',
			calendarCount: 'getCalendarCount',
			isCalendarNameUsed: 'isCalendarNameUsed',
			getTask: 'getTaskByUri',
		}),
	},
	methods: {
		...mapActions([
			'appendCalendar',
			'setPriority',
			'setPercentComplete',
			'setDate',
		]),
		dropTaskOnCollection: function($event, collection) {
			let task
			const taskAttribute = $event.item.attributes['task-id']
			if (taskAttribute) {
				task = this.getTask(taskAttribute.value)
				switch (collection.id) {
				case 'starred':
					this.setPriority({ task: task, priority: 1 })
					break
				case 'completed':
					this.setPercentComplete({ task: task, complete: 100 })
					break
				case 'today':
					this.setDate({ task: task, day: 0 })
					break
				case 'week':
					this.setDate({ task: task, day: 6 })
					break
				}
			}
		},
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
		startCreate: function(e) {
			if (this.$OCA.Theming) {
				this.selectedColor = this.$OCA.Theming.color
			} else {
				this.selectedColor = '#0082C9'
			}
			this.newCalendarName = ''
			this.creating = true
			this.$nextTick(
				() => document.getElementById('newListInput').focus()
			)
			e.stopPropagation()
		},
		cancelCreate: function() {
			this.creating = false
		},
		create: function() {
			if (!this.isNameAllowed(this.newCalendarName, 'new').allowed) {
				return
			}
			this.appendCalendar({ displayName: this.newCalendarName, color: this.selectedColor })
			this.creating = false
		},
		checkName: function(event, calendar, callback) {
			const calendarId = calendar ? calendar.id : ''
			const check = this.isNameAllowed(this.newCalendarName, calendarId)
			this.tooltipMessage = check.msg
			if (!check.allowed) {
				this.tooltipTarget = 'list_' + calendarId
				this.nameError = true
			} else {
				this.tooltipTarget = ''
				this.nameError = false
			}
			if (event.keyCode === 13) {
				callback(calendar)
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
			const check = {
				allowed: false,
				msg: '',
			}
			if (this.isCalendarNameUsed(name, id)) {
				check.msg = this.$t('tasks', 'The name "{calendar}" is already used.', { calendar: name })
			} else if (!name) {
				check.msg = this.$t('tasks', 'An empty name is not allowed.')
			} else {
				check.allowed = true
			}
			return check
		},
		setColor: function(color) {
			this.selectedColor = color
		},
	},
}
</script>

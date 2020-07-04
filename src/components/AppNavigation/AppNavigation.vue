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
	<AppNavigation>
		<template #list>
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
				draggable="false"
				@dragstart.native="dragStart"
				@drop.native="dropTaskOnCollection(...arguments, collection)"
				@dragover.native="dragOver"
				@dragenter.native="dragEnter(...arguments, collection)"
				@dragleave.native="dragLeave"
				@click="setInitialRoute(`/collections/${collection.id}`)">
				<AppNavigationCounter slot="counter">
					{{ collectionCount(collection.id) | counterFormatter }}
				</AppNavigationCounter>
			</AppNavigationItem>
			<ListItemCalendar
				v-for="calendar in calendars"
				:key="calendar.id"
				:calendar="calendar"
				@click.native="setInitialRoute(`/calendars/${calendar.id}`)" />
			<AppNavigationItem v-click-outside="cancelCreate"
				:title="$t('tasks', 'Add List…')"
				icon="sprt-add"
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
		</template>
		<template #footer>
			<AppNavigationSettings>
				<TheSettings />
			</AppNavigationSettings>
		</template>
	</AppNavigation>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import ListItemCalendar from './ListItemCalendar'
import Colorpicker from './Colorpicker'
import TheSettings from './TheSettings'

import AppNavigation from '@nextcloud/vue/dist/Components/AppNavigation'
import AppNavigationSettings from '@nextcloud/vue/dist/Components/AppNavigationSettings'
import ClickOutside from 'vue-click-outside'
import AppNavigationItem from '@nextcloud/vue/dist/Components/AppNavigationItem'
import AppNavigationCounter from '@nextcloud/vue/dist/Components/AppNavigationCounter'

export default {
	components: {
		ListItemCalendar,
		Colorpicker,
		TheSettings,
		AppNavigation,
		AppNavigationItem,
		AppNavigationCounter,
		AppNavigationSettings,
	},
	directives: {
		ClickOutside,
	},
	filters: {
		counterFormatter(count) {
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
			initialRoute: 'initialRoute',
		}),
	},
	methods: {
		...mapActions([
			'appendCalendar',
			'setPriority',
			'setPercentComplete',
			'setDate',
			'setSetting',
		]),

		/**
		 * Handle the drag start
		 *
		 * @param {Object} e The event object
		 * @returns {Boolean}
		 */
		dragStart(e) {
			e.stopPropagation()
			e.preventDefault()
			return false
		},
		/**
		 * Handle the drag over
		 *
		 * @param {Object} e The event object
		 * @returns {Boolean}
		 */
		dragOver(e) {
			if (e.preventDefault) {
				e.preventDefault()
			}
			return false
		},
		/**
		 * Set the appropriate class on hovering
		 *
		 * @param {Object} e The event object
		 * @param {Object} collection The collection on which the task was dropped
		 */
		dragEnter(e, collection) {
			// Check if dropping here is allowed
			if (!['starred', 'completed', 'today', 'week'].includes(collection.id)) {
				return
			}
			// Get the correct element, in case we hover a child.
			if (e.target.closest) {
				const target = e.target.closest('li.collection')
				if (target) {
					const collections = document.querySelectorAll('li.collection')
					collections.forEach((f) => { f.classList.remove('dnd-hover') })
					target.classList.add('dnd-hover')
				}
			}
		},
		/**
		 * Remove the hovering class after leaving
		 *
		 * @param {Object} e The event object
		 */
		dragLeave(e) {
			// Don't do anything if we leave towards a child element.
			if (e.target.contains(e.relatedTarget)) {
				return
			}
			// Get the correct element, in case we leave directly from a child.
			if (e.target.closest) {
				const target = e.target.closest('li.collection')
				if (!target || target.contains(e.relatedTarget)) {
					return
				}
				target.classList.remove('dnd-hover')
			}
		},
		/**
		 * Drop a task on a collection
		 *
		 * @param {Object} e The event object
		 * @param {Object} collection The collection
		 */
		dropTaskOnCollection(e, collection) {
			// Remove all hover classes
			const collections = document.querySelectorAll('li.collection')
			collections.forEach((f) => { f.classList.remove('dnd-hover') })
			// Check if dropping here is allowed
			if (!['starred', 'completed', 'today', 'week'].includes(collection.id)) {
				return
			}
			const taskUri = e.dataTransfer.getData('text/plain')
			if (taskUri) {
				const task = this.getTask(taskUri)
				switch (collection.id) {
				case 'starred':
					this.setPriority({ task, priority: 1 })
					break
				case 'completed':
					this.setPercentComplete({ task, complete: 100 })
					break
				case 'today':
					this.setDate({ task, day: 0 })
					break
				case 'week':
					this.setDate({ task, day: 6 })
					break
				}
			}
		},
		hideCollection(collection) {
			switch (collection.show) {
			case 0:
				return true
			case 1:
				return false
			case 2:
				return this.collectionCount(collection.id) < 1
			}
		},
		showTooltip(target) {
			return this.tooltipTarget === target
		},
		startCreate(e) {
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
		cancelCreate() {
			this.creating = false
		},
		create() {
			if (!this.isNameAllowed(this.newCalendarName, 'new').allowed) {
				return
			}
			this.appendCalendar({ displayName: this.newCalendarName, color: this.selectedColor })
			this.creating = false
		},
		checkName(event, calendar, callback) {
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
		isNameAllowed(name, id) {
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
		setColor(color) {
			this.selectedColor = color
		},
		/**
		 * Saves the current route as new initial route
		 *
		 * @param {String} route The new initial route
		 */
		setInitialRoute(route) {
			if (route === this.initialRoute) {
				return
			}
			this.setSetting({ type: 'initialRoute', value: route })
		},
	},
}
</script>

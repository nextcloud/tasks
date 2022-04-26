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
	<AppNavigation>
		<template #list>
			<AppNavigationItem v-for="collection in collections"
				v-show="!hideCollection(collection)"
				:id="'collection_' + collection.id"
				:key="collection.id"
				:collection-id="collection.id"
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
				<template #icon>
					<component :is="collection.icon"
						:size="20" />
				</template>
				<template #counter>
					<AppNavigationCounter v-show="collectionCount(collection.id)">
						{{ counterFormatter(collectionCount(collection.id)) }}
					</AppNavigationCounter>
				</template>
			</AppNavigationItem>
			<draggable class="draggable-container"
				:set-data="setData"
				v-bind="{swapThreshold: 0.30, delay: 500, delayOnTouchOnly: true, touchStartThreshold: 3}"
				@update="update">
				<ListItemCalendar v-for="calendar in calendars"
					:key="calendar.id"
					:calendar="calendar"
					@click.native="setInitialRoute(`/calendars/${calendar.id}`)" />
			</draggable>
			<AppNavigationItem v-click-outside="cancelCreate"
				:title="t('tasks', 'Add List…')"
				:class="{'collection--edit': creating}"
				class="collection reactive"
				@click="startCreate($event)">
				<template #icon>
					<Plus :size="20" />
				</template>
				<div :class="{error: nameError}" class="app-navigation-entry-edit">
					<form>
						<input id="newListInput"
							v-model="newCalendarName"
							v-tooltip="{
								content: tooltipMessage,
								show: showTooltip('list_'),
								trigger: 'manual'
							}"
							:placeholder="t('tasks', 'New List')"
							class="edit"
							type="text"
							@keyup="checkName($event, null, create)">
						<input :title="t('tasks', 'Cancel')"
							type="cancel"
							value=""
							class="action icon-close"
							@click="cancelCreate">
						<input :title="t('tasks', 'Save')"
							type="button"
							value=""
							class="action icon-checkmark"
							@click="create($event)">
					</form>
					<Colorpicker :selected-color="selectedColor" @color-selected="setColor(...arguments)" />
				</div>
			</AppNavigationItem>
			<Trashbin v-if="hasTrashBin" />
		</template>
		<template #footer>
			<AppNavigationSettings />
		</template>
	</AppNavigation>
</template>

<script>
import ListItemCalendar from '../components/AppNavigation/ListItemCalendar.vue'
import Colorpicker from '../components/AppNavigation/Colorpicker.vue'
import AppNavigationSettings from '../components/AppNavigation/AppNavigationSettings.vue'
import Trashbin from '../components/AppNavigation/Trashbin.vue'

import { translate as t } from '@nextcloud/l10n'
import AppNavigation from '@nextcloud/vue/dist/Components/AppNavigation'
import AppNavigationCounter from '@nextcloud/vue/dist/Components/AppNavigationCounter'
import AppNavigationItem from '@nextcloud/vue/dist/Components/AppNavigationItem'
import Tooltip from '@nextcloud/vue/dist/Directives/Tooltip'

import CalendarToday from 'vue-material-design-icons/CalendarToday'
import CalendarWeek from 'vue-material-design-icons/CalendarWeek'
import Check from 'vue-material-design-icons/Check'
import CircleOutline from 'vue-material-design-icons/CircleOutline'
import Plus from 'vue-material-design-icons/Plus'
import Star from 'vue-material-design-icons/Star'
import TrendingUp from 'vue-material-design-icons/TrendingUp'

import draggable from 'vuedraggable'
import ClickOutside from 'v-click-outside'
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
	components: {
		ListItemCalendar,
		Colorpicker,
		Trashbin,
		AppNavigation,
		AppNavigationItem,
		AppNavigationCounter,
		AppNavigationSettings,
		draggable,
		CalendarToday,
		CalendarWeek,
		Check,
		CircleOutline,
		Plus,
		TrendingUp,
		Star,
	},
	directives: {
		clickOutside: ClickOutside.directive,
		Tooltip,
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
			hasTrashBin: 'hasTrashBin',
		}),
	},
	methods: {
		t,

		...mapActions([
			'appendCalendar',
			'setPriority',
			'setPercentComplete',
			'setDate',
			'setSetting',
			'setCalendarOrder',
		]),

		/**
		 * Format the task counter
		 *
		 * @param {number} count The number of tasks
		 */
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

		/**
		 * Indicate that we drag a calendar item
		 *
		 * @param {object} dataTransfer The dataTransfer object
		 */
		setData(dataTransfer) {
			dataTransfer.setData('text/plain', 'calendar')
		},

		/**
		 * Called when the calendar list order is changed.
		 *
		 * @param {object} $event The event which caused the sorting
		 */
		update($event) {
			const newIndex = $event.newIndex
			const oldIndex = $event.oldIndex

			// If the calendars array has no entry, we don't need to sort.
			if (this.calendars.length === 0) {
				return
			}
			// If the calendar is inserted at its current position, don't sort.
			if (newIndex === oldIndex) {
				return
			}

			// Get a copy of the sorted calendars array
			const calendars = [...this.calendars]

			// In case the task to move is already in the array, move it to the new position
			if (oldIndex > -1) {
				calendars.splice(newIndex, 0, calendars.splice(oldIndex, 1)[0])
			} else {
				return
			}

			// Get the new sort order for the moved calendar and apply it.
			// We just do that to minimize the number of other calendars to be changed.
			let newSortOrder
			if (newIndex + 1 < calendars.length
				&& (newIndex < 1 || calendars[newIndex + 1].order - 1 > calendars[newIndex - 1].order)) {
				newSortOrder = calendars[newIndex + 1].order - 1
			} else {
				newSortOrder = calendars[newIndex - 1].order + 1
			}
			if (newSortOrder < 0) {
				newSortOrder = 0
			}
			// Apply the new sort order for the moved calendar
			this.setCalendarOrder({ calendar: calendars[newIndex], order: newSortOrder })

			// Check the sort orders to be strictly monotonous
			let currentIndex = 1
			while (currentIndex < calendars.length) {
				if (calendars[currentIndex].order <= calendars[currentIndex - 1].order) {
					const order = { calendar: calendars[currentIndex], order: calendars[currentIndex - 1].order + 1 }
					this.setCalendarOrder(order)
				}
				currentIndex++
			}
		},

		/**
		 * Handle the drag start
		 *
		 * @param {object} e The event object
		 * @return {boolean}
		 */
		dragStart(e) {
			e.stopPropagation()
			e.preventDefault()
			return false
		},
		/**
		 * Handle the drag over
		 *
		 * @param {object} e The event object
		 * @return {boolean}
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
		 * @param {object} e The event object
		 * @param {object} collection The collection on which the task was dropped
		 */
		dragEnter(e, collection) {
			// Check if dropping here is allowed
			if (!['starred', 'completed', 'today', 'week'].includes(collection.id)) {
				return
			}
			// Dragging calendars has no effect
			if (e.dataTransfer.getData('text/plain') === 'calendar') {
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
		 * @param {object} e The event object
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
		 * @param {object} e The event object
		 * @param {object} collection The collection
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
				check.msg = t('tasks', 'The name "{calendar}" is already used.', { calendar: name }, undefined, { sanitize: false, escape: false })
			} else if (!name) {
				check.msg = t('tasks', 'An empty name is not allowed.')
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
		 * @param {string} route The new initial route
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

<style lang="scss" scoped>
$color-error: #e9322d;

.collection::v-deep {
	&.collection--edit {
		.app-navigation-entry-link {
			display: none;
		}

		.app-navigation-entry-edit {
			display: inline-block;
		}
	}

	.app-navigation-entry-edit {
		padding-left: 5px !important;
		display: none;
		position: relative;

		&.error input.edit {
			color: var(--color-error);
			border-color: var(--color-error) !important;
			box-shadow: 0 0 6px transparentize( $color-error, .7 );
		}

		form {
			display: flex;

			input {
				margin-right: 0;

				&[type='text'] {
					flex-grow: 1;
				}

				&.action {
					background-color: var(--color-background-dark);
					width: 36px;
					border-left: 0 none;
					background-position: center;
					cursor: pointer;

					&:hover {
						border-left: 1px solid;
						margin-left: -1px;
						width: 37px;
					}
				}
			}
		}
	}
}
</style>

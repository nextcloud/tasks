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
	<draggable tag="ol"
		:list="['']"
		v-bind="{group: 'tasks', swapThreshold: 0.30, delay: 500, delayOnTouchOnly: true, touchStartThreshold: 3, disabled: disabled, filter: '.readOnly'}"
		@add="onAdd"
	>
		<slot />
	</draggable>
</template>

<script>
import draggable from 'vuedraggable'
import { mapGetters, mapActions } from 'vuex'

export default {
	components: {
		draggable,
	},
	props: {
		disabled: {
			type: Boolean,
			default: false,
		}
	},
	computed: {
		...mapGetters({
			getCalendar: 'getCalendarById',
			getTask: 'getTaskByUri',
		}),
	},
	methods: {
		...mapActions([
			'moveTask',
			'setPriority',
			'setPercentComplete',
			'setDate',
		]),

		/**
		 * Called when a task is dropped.
		 *
		 * @param {Object} $event The event which caused the drop
		 */
		onAdd: function($event) {
			var task
			// The task to move
			var taskAttribute = $event.item.attributes['task-id']
			if (taskAttribute) {
				task = this.getTask(taskAttribute.value)
			}
			// Move the task to a new calendar or parent.
			this.prepareMoving(task, $event)
			this.prepareCollecting(task, $event)
			$event.stopPropagation()
		},

		/**
		 * Function to move a task to a new calendar or parent
		 *
		 * @param {Task} task The task to change
		 * @param {Object} $event The event which caused the move
		 */
		prepareMoving: function(task, $event) {
			var parent, calendar
			// The new calendar --> make the moved task a root task
			var calendarAttribute = $event.to.attributes['calendar-id']
			if (calendarAttribute) {
				calendar = this.getCalendar(calendarAttribute.value)
			}
			// The new parent task --> make the moved task a subtask
			var parentAttribute = $event.to.attributes['task-id']
			if (parentAttribute) {
				parent = this.getTask(parentAttribute.value)
				// If we move to a parent task, the calendar has to be the parents calendar.
				calendar = parent.calendar
			}
			// If no calendar is given (e.g. in week collection), the calendar is unchanged.
			if (!calendar) {
				calendar = task.calendar
			}
			// Move the task to the appropriate calendar and parent.
			this.moveTask({ task: task, calendar: calendar, parent: parent })
		},

		/**
		 * Function to add a task to a collection.
		 *
		 * @param {Task} task The task to change
		 * @param {Object} $event The event which caused the change
		 */
		prepareCollecting: function(task, $event) {
			// The new collection --> make the moved task a member of this collection
			// This is necessary for the collections {starred, today, completed, uncompleted and week}
			var collectionAttribute = $event.to.attributes['collection-id']
			if (collectionAttribute) {
				var collectionId = collectionAttribute.value
				// Split the collectionId in case we deal with 'week-x'
				collectionId = collectionId.split('-')
				switch (collectionId[0]) {
				case 'starred':
					this.setPriority({ task: task, priority: 1 })
					break
				case 'completed':
					this.setPercentComplete({ task: task, complete: 100 })
					break
				case 'uncompleted':
					if (task.completed) {
						this.setPercentComplete({ task: task, complete: 0 })
					}
					break
				case 'today':
					this.setDate({ task: task, day: 0 })
					break
				case 'week':
					this.setDate({ task: task, day: collectionId[1] })
					break
				}
			}
		},
	},
}
</script>

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
	<draggable tag="ol"
		:list="['']"
		:set-data="setDragData"
		v-bind="{group: 'tasks', swapThreshold: 0.30, delay: 500, delayOnTouchOnly: true, touchStartThreshold: 3, disabled: disabled, filter: '.readOnly'}"
		:move="onMove"
		@add="onAdd"
		@end="onEnd">
		<TaskBody v-for="task in sortedTasks"
			:key="task.key"
			:task="task"
			:collection-string="collectionString" />
	</draggable>
</template>

<script>
import Task from '../models/task.js'
import { sort } from '../store/storeHelper.js'

import draggable from 'vuedraggable'
import { mapGetters, mapActions, mapMutations } from 'vuex'

export default {
	name: 'TaskDragContainer',
	components: {
		/**
		 * We asynchronously import here, because we have a circular dependency
		 * between TaskDragContainer and TaskBody which otherwise cannot be resolved.
		 * See https://vuejs.org/v2/guide/components-edge-cases.html#Circular-References-Between-Components
		 *
		 * We load it "eager", because the TaskBody will always be required.
		 *
		 * @return {object} The TaskBody component
		 */
		TaskBody: () => import(/* webpackMode: "eager" */ './TaskBody.vue'),
		draggable,
	},
	props: {
		tasks: {
			type: Array,
			default: () => [],
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		collectionString: {
			type: String,
			default: null,
		},
	},
	computed: {
		...mapGetters({
			getCalendar: 'getCalendarById',
			getTask: 'getTaskByUri',
			sortOrder: 'sortOrder',
			sortDirection: 'sortDirection',
		}),

		sortedTasks() {
			return sort([...this.tasks], this.sortOrder, this.sortDirection)
		},
	},
	methods: {
		...mapActions([
			'moveTask',
			'setPriority',
			'setPercentComplete',
			'setDate',
			'setSortOrder',
		]),

		...mapMutations({
			commitSortOrder: 'setSortOrder',
		}),

		setDragData: (dataTransfer) => {
			// We do nothing here, this just prevents
			// vue.draggable from setting data on the
			// dataTransfer object.
		},

		adjustSortOrder(task, newIndex, oldIndex = -1) {
			// Only change the sort order if we sort manually
			if (this.sortOrder !== 'manual') {
				return
			}
			// If the tasks array has no entry, we don't need to sort.
			if (this.sortedTasks.length === 0) {
				return
			}
			// If the task is inserted at its current position, don't sort.
			if (newIndex === oldIndex) {
				return
			}

			// Get a copy of the sorted tasks array
			const sortedTasks = [...this.sortedTasks]

			// In case the task to move is already in the array, move it to the new position
			if (oldIndex > -1) {
				sortedTasks.splice(newIndex, 0, sortedTasks.splice(oldIndex, 1)[0])
			// Otherwise insert it
			} else {
				sortedTasks.splice(newIndex, 0, task)
			}
			// Make sure we sort in the correct direction
			if (this.sortDirection) {
				sortedTasks.reverse()
				newIndex = sortedTasks.length - newIndex - 1
			}
			// Get the new sort order for the moved task and apply it.
			// We just do that to minimize the number of other tasks to be changed.
			let newSortOrder
			if (newIndex + 1 < sortedTasks.length
				&& (newIndex < 1 || sortedTasks[newIndex + 1].sortOrder - 1 > sortedTasks[newIndex - 1].sortOrder)) {
				newSortOrder = sortedTasks[newIndex + 1].sortOrder - 1
			} else {
				newSortOrder = sortedTasks[newIndex - 1].sortOrder + 1
			}
			if (newSortOrder < 0) {
				newSortOrder = 0
			}
			// If we moved the task from a different list, don't schedule a request to the server,
			// this will be done afterwards.
			const newOrder = { task: sortedTasks[newIndex], order: newSortOrder }
			if (oldIndex > -1) {
				this.setSortOrder(newOrder)
			} else {
				this.commitSortOrder(newOrder)
			}

			// Check the sort orders to be strictly monotonous
			let currentIndex = 1
			while (currentIndex < sortedTasks.length) {
				if (sortedTasks[currentIndex].sortOrder <= sortedTasks[currentIndex - 1].sortOrder) {
					const order = { task: sortedTasks[currentIndex], order: sortedTasks[currentIndex - 1].sortOrder + 1 }
					if (sortedTasks[currentIndex] === task) {
						this.commitSortOrder(order)
					} else {
						this.setSortOrder(order)
					}
				}
				currentIndex++
			}
		},

		/**
		 * Called when a task is dropped.
		 * We only handle sorting tasks here.
		 *
		 * @param {object} $event The event which caused the drop
		 */
		onEnd($event) {
			// Don't do anything if the tasks are not sorted but moved.
			if ($event.to !== $event.from) {
				return
			}
			/**
			 * We have to adjust the sortOrder property of the tasks
			 * to achieve the desired sort order.
			 */
			this.adjustSortOrder(null, $event.newIndex, $event.oldIndex)
		},

		/**
		 * Called when a task is dropped.
		 * We handle changing the parent task, calendar or collection here
		 * and also have to sort a task to the correct position
		 * in case of manual sort order.
		 *
		 * @param {object} $event The event which caused the drop
		 */
		onAdd($event) {
			let task
			// The task to move
			const taskAttribute = $event.item.attributes['task-id']
			if (taskAttribute) {
				task = this.getTask(taskAttribute.value)
			}
			/**
			 * We have to adjust the sortOrder property of the tasks
			 * to achieve the desired sort order.
			 */
			this.adjustSortOrder(task, $event.newIndex, -1)
			// Move the task to a new calendar or parent.
			this.prepareMoving(task, $event)
			this.prepareCollecting(task, $event)
			$event.stopPropagation()
		},

		/**
		 * Called when a task is moved.
		 * We check here if drop onto the target is allowed.
		 *
		 * Dropping tasks with class not PUBLIC onto calendars shared with me
		 * is forbidden.
		 *
		 * @param {object} $event The event which caused the move
		 * @return {boolean} If the drop is allowed
		 */
		onMove($event) {
			// The task to move
			const taskAttribute = $event.dragged.attributes['task-id']
			if (taskAttribute) {
				const task = this.getTask(taskAttribute.value)
				if (task.class === 'PUBLIC') {
					return true
				}
				let calendar
				const calendarAttribute = $event.to.attributes['calendar-id']
				if (calendarAttribute) {
					calendar = this.getCalendar(calendarAttribute.value)
				}
				if (!calendar) {
					const parentAttribute = $event.to.attributes['task-id']
					if (parentAttribute) {
						const parent = this.getTask(parentAttribute.value)
						// If we move to a parent task, the calendar has to be the parents calendar.
						calendar = parent.calendar
					}
				}
				if (calendar && calendar.isSharedWithMe) {
					return false
				}
			}
			return true
		},

		/**
		 * Function to move a task to a new calendar or parent
		 *
		 * @param {Task} task The task to change
		 * @param {object} $event The event which caused the move
		 */
		prepareMoving(task, $event) {
			let parent, calendar
			// The new calendar --> make the moved task a root task
			const calendarAttribute = $event.to.attributes['calendar-id']
			if (calendarAttribute) {
				calendar = this.getCalendar(calendarAttribute.value)
			}
			// The new parent task --> make the moved task a subtask
			const parentAttribute = $event.to.attributes['task-id']
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
			this.moveTask({ task, calendar, parent })
		},

		/**
		 * Function to add a task to a collection.
		 *
		 * @param {Task} task The task to change
		 * @param {object} $event The event which caused the change
		 */
		prepareCollecting(task, $event) {
			// The new collection --> make the moved task a member of this collection
			// This is necessary for the collections {starred, today, completed, uncompleted and week}
			const collectionAttribute = $event.to.attributes['collection-id']
			if (collectionAttribute) {
				let collectionId = collectionAttribute.value
				// Split the collectionId in case we deal with 'week-x'
				collectionId = collectionId.split('-')
				switch (collectionId[0]) {
				case 'starred':
					this.setPriority({ task, priority: 1 })
					break
				case 'completed':
					this.setPercentComplete({ task, complete: 100 })
					break
				case 'uncompleted':
					if (task.completed) {
						this.setPercentComplete({ task, complete: 0 })
					}
					break
				case 'today':
					this.setDate({ task, day: 0 })
					break
				case 'week':
					this.setDate({ task, day: collectionId[1] })
					break
				}
			}
		},
	},
}
</script>

<!--
Nextcloud - Tasks

@author Raimund Schlüßler
@copyright 2018 Raimund Schlüßler <raimund.schluessler@mailbox.org>
@copyright 2018 Vadim Nicolai <contact@vadimnicolai.com>

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
	<div v-if="calendar">
		<div class="header">
			<div v-if="collectionId !== 'completed' && !calendar.readOnly"
				class="add-task">
				<form name="addTaskForm" @submit.prevent="addTask">
					<input v-model="newTaskName"
						:placeholder="inputString"
						:disabled="isAddingTask"
						class="transparent reactive"
						@keyup.27="clearNewTask($event)">
				</form>
			</div>
			<SortorderDropdown />
		</div>
		<div class="task-list">
			<div v-for="calendar in filteredCalendars"
				:key="calendar.id"
				:rel="calendar.id"
				class="grouped-tasks ui-droppable">
				<h2 class="heading">
					<span class="heading__icon-bullet" :style="{'background-color': calendar.color }" />
					<span class="heading__title">{{ calendar.displayName }}</span>
				</h2>
				<TaskDragContainer
					:tasks="calendar.filteredTasks"
					:disabled="calendar.readOnly"
					:collection-string="collectionId"
					:calendar-id="calendar.id"
					:collection-id="collectionId" />
				<LoadCompletedButton v-if="collectionId === 'completed'" :calendar="calendar" />
			</div>
		</div>
	</div>
</template>

<script>
import { isTaskInList, isParentInList } from '../../store/storeHelper.js'
import LoadCompletedButton from '../../components/LoadCompletedButton.vue'
import SortorderDropdown from '../../components/SortorderDropdown.vue'
import TaskDragContainer from '../../components/TaskDragContainer.vue'

import moment from '@nextcloud/moment'

import { mapGetters, mapActions } from 'vuex'

export default {
	components: {
		SortorderDropdown,
		LoadCompletedButton,
		TaskDragContainer,
	},
	data() {
		return {
			newTaskName: '',
			isAddingTask: false,
		}
	},
	computed: {

		/**
		 * Returns the calendars which are to be shown for the current collection and
		 * adds a filteredTasks property to each calendar containing the tasks belonging to the collection.
		 *
		 * Calendars have to contain at least one task which
		 * - belongs to the collection
		 * - is a root task
		 * - is uncompleted
		 *
		 * @returns {Array} the calendars which should be shown in the collection
		 */
		filteredCalendars() {
			const filteredCalendars = []
			this.calendars.forEach(calendar => {
				calendar.filteredTasks = Object.values(calendar.tasks).filter(task => {
					return isTaskInList(task, this.collectionId) && (!task.related || !isParentInList(task, calendar.tasks))
				})
				if (calendar.filteredTasks.length) {
					filteredCalendars.push(calendar)
				}
			})
			return filteredCalendars
		},

		collectionId() {
			return this.$route.params.collectionId
		},

		inputString() {
			switch (this.collectionId) {
			case 'starred':
				return this.$t('tasks', 'Add an important task to "{calendar}"…', { calendar: this.calendar.displayName }, undefined, { sanitize: false, escape: false })
			case 'today':
				return this.$t('tasks', 'Add a task due today to "{calendar}"…', { calendar: this.calendar.displayName }, undefined, { sanitize: false, escape: false })
			case 'current':
				return this.$t('tasks', 'Add a current task to "{calendar}"…', { calendar: this.calendar.displayName }, undefined, { sanitize: false, escape: false })
			default:
				return this.$t('tasks', 'Add a task to "{calendar}"…', { calendar: this.calendar.displayName }, undefined, { sanitize: false, escape: false })
			}
		},
		...mapGetters({
			calendar: 'getDefaultCalendar',
			calendars: 'getSortedCalendars',
		}),
	},
	methods: {
		...mapActions([
			'createTask',
		]),
		clearNewTask(event) {
			event.target.blur()
			this.newTaskName = ''
		},

		addTask() {
			const task = { summary: this.newTaskName }

			// If the task is created in a collection view,
			// set the appropriate properties.
			if (this.$route.params.collectionId === 'starred') {
				task.priority = '1'
			}
			if (this.$route.params.collectionId === 'today') {
				task.due = moment().startOf('day').format('YYYY-MM-DDTHH:mm:ss')
				task.allDay = this.$store.state.settings.settings.allDay
			}
			if (this.$route.params.collectionId === 'current') {
				task.start = moment().format('YYYY-MM-DDTHH:mm:ss')
			}

			this.createTask(task)
			this.newTaskName = ''
		},
	},
}
</script>

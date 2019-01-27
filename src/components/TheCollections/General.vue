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
		<div v-if="collectionId !== 'completed' && !calendar.readOnly"
			id="add-task"
			class="add-task"
		>
			<form name="addTaskForm" @submit.prevent="addTask">
				<input v-model="newTaskName"
					:placeholder="inputString"
					:disabled="isAddingTask"
					class="transparent reactive"
					@keyup.27="clearNewTask($event)"
				>
			</form>
		</div>
		<SortorderDropdown />
		<div class="task-list">
			<div v-for="calendar in filteredCalendars"
				:key="calendar.id"
				:rel="calendar.id"
				class="grouped-tasks ui-droppable"
			>
				<h2 class="heading">
					{{ calendar.displayName }}
				</h2>
				<task-drag-container
					:calendar-id="calendar.id"
					:collection-id="collectionId"
					class="tasks"
					type="list"
				>
					<TaskBody v-for="task in sort(calendar.filteredTasks, sortOrder, sortDirection)"
						:key="task.id"
						:task="task"
					/>
				</task-drag-container>
				<LoadCompletedButton v-if="collectionId === 'completed'" :calendar="calendar" />
			</div>
		</div>
	</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { sort, isTaskInList, isParentInList } from '../../store/storeHelper'
import SortorderDropdown from '../SortorderDropdown'
import LoadCompletedButton from '../LoadCompletedButton'
import TaskBody from '../Task'
import TaskDragContainer from '../TaskDragContainer'

export default {
	components: {
		'TaskBody': TaskBody,
		'SortorderDropdown': SortorderDropdown,
		'LoadCompletedButton': LoadCompletedButton,
		TaskDragContainer,
	},
	data() {
		return {
			newTaskName: '',
			isAddingTask: false
		}
	},
	computed: {

		/**
		 * Returns the calendars which are to be shown for the current collection and
		 * adds a filteredTasks property to each calendar containing the tasks belonging to the collection.
		 *
		 * Calendars have to contain at least one task which
		 *	- belongs to the collection
		 *	- is a root task
		 *	- is uncompleted
		 *
		 * @returns {Array} the calendars which should be shown in the collection
		 */
		filteredCalendars: function() {
			var filteredCalendars = []
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

		collectionId: function() {
			return this.$route.params.collectionId
		},

		inputString: function() {
			switch (this.collectionId) {
			case 'starred':
				return t('tasks', 'Add an important task to "{calendar}"...', { calendar: this.calendar.displayName })
			case 'today':
				return t('tasks', 'Add a task due today to "{calendar}"...', { calendar: this.calendar.displayName })
			case 'current':
				return t('tasks', 'Add a current task to "{calendar}"...', { calendar: this.calendar.displayName })
			default:
				return t('tasks', 'Add a task to "{calendar}"...', { calendar: this.calendar.displayName })
			}
		},
		...mapGetters({
			calendar: 'getDefaultCalendar',
			calendars: 'getSortedCalendars',
			sortOrder: 'sortOrder',
			sortDirection: 'sortDirection'
		})
	},
	methods: {
		...mapActions([
			'createTask'
		]),
		sort,
		clearNewTask: function(event) {
			event.target.blur()
			this.newTaskName = ''
		},

		addTask: function() {
			var task = { summary: this.newTaskName }

			// If the task is created in a collection view,
			// set the appropriate properties.
			if (this.$route.params.collectionId === 'starred') {
				task.priority = '1'
			}
			if (this.$route.params.collectionId === 'today') {
				task.due = moment().startOf('day').format('YYYY-MM-DDTHH:mm:ss')
			}
			if (this.$route.params.collectionId === 'current') {
				task.start = moment().format('YYYY-MM-DDTHH:mm:ss')
			}

			this.createTask(task)
			this.newTaskName = ''
		}
	}
}
</script>

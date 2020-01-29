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
	<div>
		<div class="header">
			<div v-if="calendar && !calendar.readOnly"
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
		</div>
		<div class="task-list">
			<div v-for="day in days" :key="day.diff" :day="day.diff"
				class="grouped-tasks ui-droppable"
			>
				<h2 class="heading">
					{{ dayString(day.diff) }}
				</h2>
				<task-drag-container
					:collection-id="'week-' + day.diff"
					class="tasks"
					type="list"
				>
					<Task v-for="task in sort(day.tasks, sortOrder, sortDirection)"
						:key="task.key"
						:task="task"
						:collection-string="'week-' + day.diff"
					/>
				</task-drag-container>
			</div>
		</div>
	</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { sort, isTaskInList } from '../../store/storeHelper'
import SortorderDropdown from '../SortorderDropdown'
import Task from '../Task'
import TaskDragContainer from '../TaskDragContainer'

export default {
	components: {
		Task,
		SortorderDropdown,
		TaskDragContainer,
	},
	data() {
		return {
			newTaskName: '',
			isAddingTask: false
		}
	},
	computed: {
		...mapGetters({
			calendar: 'getDefaultCalendar',
			tasks: 'getAllTasks',
			uncompletedRootTasks: 'findUncompletedRootTasks',
			sortOrder: 'sortOrder',
			sortDirection: 'sortDirection'
		}),

		/**
		 * Returns an array with an entry for every day which has tasks for this day.
		 *
		 * @returns {Array} the array with the days
		 */
		days: function() {
			// Get all uncompleted root tasks
			var tasks = this.uncompletedRootTasks(this.tasks)

			// Construct array with days for the current week.
			var days = []
			for (var day = 0; day < 8; day++) {
				days.push({ diff: day, tasks: [] })

				tasks.forEach(task => {
					// Add the task to the respective day if it is within the next week.
					if (isTaskInList(task, `week-${day}`)) {
						days[day].tasks.push(task)
					}
				})
			}

			// Remove all days without tasks.
			return days.filter(day => day.tasks.length)
		},

		inputString: function() {
			return this.$t('tasks', 'Add a task due today to "{calendar}"…', { calendar: this.calendar.displayName })
		},
	},
	methods: {
		...mapActions([
			'createTask'
		]),

		sort,

		dayString: function(day) {
			var date = moment().add(day, 'day')
			var dayString
			if (day === 0) {
				dayString = this.$t('tasks', 'Today')
			} else if (day === 1) {
				dayString = this.$t('tasks', 'Tomorrow')
			} else {
				dayString = date.format('dddd')
			}
			return dayString + ', ' + date.format('LL')
		},

		clearNewTask: function(event) {
			event.target.blur()
			this.newTaskName = ''
		},

		addTask: function() {
			var task = { summary: this.newTaskName }

			task.due = moment().startOf('day').format('YYYY-MM-DDTHH:mm:ss')
			task.allDay = this.$store.state.settings.settings.allDay

			this.createTask(task)
			this.newTaskName = ''
		}
	}
}
</script>

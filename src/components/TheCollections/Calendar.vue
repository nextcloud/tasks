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
		<div v-if="!calendar.readOnly"
			id="add-task"
			class="add-task"
		>
			<form name="addTaskForm" @submit.prevent="addTask">
				<input id="target"
					v-model="newTaskName"
					:placeholder="inputString"
					:disabled="isAddingTask"
					class="transparent reactive"
					@keyup.27="clearNewTask($event)"
				>
			</form>
		</div>
		<SortorderDropdown />
		<div class="task-list">
			<div class="grouped-tasks">
				<task-drag-container
					:calendar-id="calendarId"
					class="tasks"
					collection-id="uncompleted"
					type="list"
				>
					<Task v-for="task in sort(uncompletedRootTasks(calendar.tasks), sortOrder, sortDirection)"
						:key="task.id"
						:task="task"
					/>
				</task-drag-container>
				<h2 v-show="completedCount(calendarId)" class="heading-hiddentasks icon-triangle-s reactive" @click="toggleHidden">
					{{ completedCountString }}
				</h2>
				<task-drag-container v-if="showHidden"
					:calendar-id="calendarId"
					class="completed-tasks"
					collection-id="completed"
					type="list"
				>
					<Task v-for="task in sort(completedRootTasks(calendar.tasks), sortOrder, sortDirection)"
						:key="task.id"
						:task="task"
					/>
				</task-drag-container>
				<LoadCompletedButton :calendar="calendar" />
			</div>
		</div>
	</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { sort } from '../../store/storeHelper'
import SortorderDropdown from '../SortorderDropdown'
import LoadCompletedButton from '../LoadCompletedButton'
import Task from '../Task'
import TaskDragContainer from '../TaskDragContainer'

export default {
	components: {
		'Task': Task,
		'SortorderDropdown': SortorderDropdown,
		'LoadCompletedButton': LoadCompletedButton,
		TaskDragContainer,
	},
	props: {
		calendarId: {
			type: String,
			default: ''
		},
		taskId: {
			type: String,
			default: ''
		}
	},
	data() {
		return {
			newTaskName: '',
			isAddingTask: false
		}
	},
	computed: {
		showHidden: {
			get() {
				return this.$store.state.settings.settings.showHidden
			},
			set(value) {
				this.$store.dispatch('setSetting', { type: 'showHidden', value: value })
			}
		},

		inputString: function() {
			return t('tasks', 'Add a task to "{calendar}"...', { calendar: this.calendar.displayName })
		},

		/**
		 * Returns the string for completed tasks
		 *
	 	 * @returns {String} The string to show for the completed tasks count
		 */
		completedCountString: function() {
			return n('tasks', '%n Completed Task', '%n Completed Tasks', this.completedCount(this.calendarId))
		},
		...mapGetters({
			completedCount: 'getCalendarCountCompleted',
			calendar: 'getCalendarByRoute',
			uncompletedRootTasks: 'findUncompletedRootTasks',
			completedRootTasks: 'findCompletedRootTasks',
			sortOrder: 'sortOrder',
			sortDirection: 'sortDirection'
		})
	},
	methods: {
		...mapActions([
			'createTask'
		]),
		sort,
		toggleHidden: function() {
			this.showHidden = +!this.showHidden
		},

		clearNewTask: function(event) {
			event.target.blur()
			this.newTaskName = ''
		},

		addTask: function() {
			this.createTask({ summary: this.newTaskName, calendar: this.calendar })
			this.newTaskName = ''
		},

		onMove: function($event, $originalEvent) {
			console.debug($event)
			console.debug($event.target)
			console.debug($event.to)
			// console.debug('target: ' + $event.target.attributes['task-id'].value)
			// console.debug('to: ' + $event.to.attributes['task-id'].value)
		},
	}
}
</script>

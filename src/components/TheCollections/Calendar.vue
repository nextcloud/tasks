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
			<form name="addTaskForm" @submit="addTask">
				<input id="target"
					v-model="newTaskName"
					:placeholder="inputString"
					:disabled="isAddingTask"
					class="transparent"
					@keyup.27="clearNewTask($event)"
				>
			</form>
		</div>
		<SortorderDropdown />
		<div class="task-list">
			<div class="grouped-tasks">
				<ol :calendarId="calendarId"
					class="tasks"
					collectionId="uncompleted"
					type="list"
				>
					<Task v-for="task in sort(uncompletedRootTasks(calendar.tasks), sortOrder, sortDirection)"
						:key="task.id"
						:task="task"
					/>
				</ol>
				<h2 v-show="completedCount(calendarId)" class="heading-hiddentasks icon-triangle-s" @click="toggleHidden">
					{{ completedCountString }}
				</h2>
				<ol v-if="showHidden"
					:calendarId="calendarId"
					class="completed-tasks"
					collectionId="completed"
					type="list"
				>
					<Task v-for="task in sort(completedRootTasks(calendar.tasks), sortOrder, sortDirection)"
						:key="task.id"
						:task="task"
					/>
				</ol>
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

export default {
	components: {
		'Task': Task,
		'SortorderDropdown': SortorderDropdown,
		'LoadCompletedButton': LoadCompletedButton
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
		}
	}
}
</script>

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
	<div v-if="calendar">
		<div v-show="!calendar.readOnly"
			id="add-task"
			class="add-task">
			<form name="addTaskForm" @submit="addTask">
				<input id="target"
					v-model="newTaskName"
					:placeholder="inputString"
					:disabled="isAddingTask"
					class="transparent"
					@keyup.27="clearNewTask($event)">
			</form>
		</div>
		<sortorderDropdown />
		<div class="task-list">
			<div :class="{'completed-hidden': showHidden}"
				class="grouped-tasks">
				<ol :calendarId="calendarId"
					class="tasks"
					collectionId="uncompleted"
					type="list"
					dnd-list="draggedTasks"
					dnd-drop="dropAsRootTask(event, item, index)"
					dnd-dragover="dragover(event, index)">
					<task v-for="task in tasks"
						:key="task.id"
						:task="task" :base-url="'/calendars/' + calendarId" />
						<!-- ng-repeat="task in filtered = filteredTasks() | filter:hasNoParent(task) | filter:filterTasks(task,route.calendarID) | filter:{'completed':'false'} | orderBy:getSortOrder():settingsmodel.getById('various').sortDirection"> -->
						<!-- dnd-effect-allowed="{{ allow(task) }}"> -->
				</ol>
				<h2 v-show="completedCount(calendarId)" class="heading-hiddentasks icon-triangle-s" @click="toggleHidden">
					{{ completedCountString }}
				</h2>
				<ol :calendarId="calendarId"
					class="completed-tasks"
					collectionId="completed"
					type="list"
					dnd-list="draggedTasks"
					dnd-drop="dropAsRootTask(event, item, index)"
					dnd-dragover="dragover(event, index)">
					<task v-for="task in tasks"
						:key="task.id"
						:task="task" :base-url="'/calendars/' + calendarId" />
						<!-- ng-repeat="task in filtered = filteredTasks() | filter:hasNoParent(task) | filter:filterTasks(task,route.calendarID) | filter:{'completed':true} | orderBy:'completed_date':true"> -->
						<!-- dnd-effect-allowed="{{ allow(task) }}"> -->
				</ol>
				<loadCompletedButton :calendar="calendar" />
			</div>
		</div>
	</div>
</template>

<script>
import { mapGetters } from 'vuex'
import SortorderDropdown from '../SortorderDropdown'
import LoadCompletedButton from '../LoadCompletedButton'
import Task from '../Task'

export default {
	components: {
		'task': Task,
		'sortorderDropdown': SortorderDropdown,
		'loadCompletedButton': LoadCompletedButton
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
	computed: Object.assign({
		showHidden: {
			get() {
				return this.$store.state.settings.showHidden
			},
			set(value) {
				this.$store.dispatch('setSetting', { type: 'showHidden', value: value })
			}
		},

		tasks: function() {
			return Object.values(this.calendar.tasks)
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
		} },
	mapGetters({
		completedCount: 'getCalendarCountCompleted',
		calendar: 'getCalendarByRoute'
	})
	),
	methods: {
		toggleHidden: function() {
			this.showHidden = +!this.showHidden
		},

		clearNewTask: function(event) {
			event.target.blur()
			this.newTaskName = ''
		},

		addTask: function() {
			console.debug('Add task with name ' + this.newTaskName + ' to calendar ' + this.calendar.displayName)
			this.newTaskName = ''
		}
	}
}
</script>

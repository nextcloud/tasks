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
		<div v-if="collectionId !== 'completed' && !calendar.readOnly"
			id="add-task"
			class="add-task">
			<form name="addTaskForm" @submit="addTask">
				<input v-model="newTaskName"
					:placeholder="inputString"
					:disabled="isAddingTask"
					class="transparent"
					@keyup.27="clearNewTask($event)">
			</form>
		</div>
		<sortorderDropdown />
		<div class="task-list">
			<div v-for="calendar in filteredCalendars"
				:key="calendar.id"
				:rel="calendar.id"
				class="grouped-tasks ui-droppable">
				<h2 class="heading">{{ calendar.displayName }}</h2>
				<ol :calendarID="calendar.id"
					:collectionID="collectionId"
					class="tasks"
					type="list">
					<task-body v-for="task in rootTasks(calendar.tasks)"
						:key="task.id"
						:task="task" :base-url="'/collections/' + collectionId" />
						<!-- ng-repeat="task in filtered = filteredTasks() | filter:hasNoParent(task) | filter:filterTasks(task,calendar.uri) | filter:filterTasks(task,route.collectionID) | orderBy:getSortOrder():settingsmodel.getById('various').sortDirection"> -->
				</ol>
				<loadCompletedButton v-if="collectionId == 'completed'" :calendar="calendar" />
			</div>
		</div>
	</div>
</template>

<script>
import { mapGetters } from 'vuex'
import SortorderDropdown from '../SortorderDropdown'
import LoadCompletedButton from '../LoadCompletedButton'
import TaskBody from '../Task'

export default {
	components: {
		'task-body': TaskBody,
		'sortorderDropdown': SortorderDropdown,
		'loadCompletedButton': LoadCompletedButton
	},
	props: {
		collectionId: {
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

		/**
		 * Returns the calendars which are to be shown for the current collection
		 *
		 * Calendars have to contain at least one task which
		 *	- belongs to the collection
		 *	- is a root task
		 *	- is uncompleted
		 *
		 * @returns {Array} the calendars which should be shown in the collection
		 */
		filteredCalendars: function() {
			return this.calendars.filter(calendar => {
				return this.calendarCount(calendar.id, this.$route.params.collectionId)
			})
		},

		inputString: function() {
			switch (this.collectionId) {
			case 'starred':
				return t('tasks', 'Add an important task to "{calendar}"...', { calendar: this.calendar.displayName })
			case 'today':
				return t('tasks', 'Add a task due today to "{calendar}"...', { calendar: this.calendar.displayName })
			case 'all':
				return t('tasks', 'Add a task to "{calendar}"...', { calendar: this.calendar.displayName })
			case 'current':
				return t('tasks', 'Add a current task to "{calendar}"...', { calendar: this.calendar.displayName })
			}
		}
	},
	mapGetters({
		rootTasks: 'findRootTasks',
		calendar: 'getDefaultCalendar',
		calendars: 'getSortedCalendars',
		calendarCount: 'getCalendarCountByCollectionId'
	})
	),
	methods: {
		clearNewTask: function(event) {
			event.target.blur()
			this.newTaskName = ''
		},

		addTask: function() {
			this.newTaskName = ''
		}
	}
}
</script>

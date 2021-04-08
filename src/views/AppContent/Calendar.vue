<!--
Nextcloud - Tasks

@author Raimund Schlüßler
@copyright 2018 Raimund Schlüßler <raimund.schluessler@mailbox.org>
@copyright 2018 Vadim Nicolai <contact@vadimnicolai.com>
@copyright 2021 cnmicha <cnmicha@bhb-networks.com>

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
			<div v-if="!calendar.readOnly"
				class="add-task">
				<form name="addTaskForm" @submit.prevent="addTask">
					<input id="target"
						v-model="newTaskName"
						:placeholder="inputString"
						:disabled="isAddingTask"
						autocomplete="off"
						class="transparent reactive"
						@keyup.27="clearNewTask($event)">
				</form>
			</div>
			<SortorderDropdown />
		</div>
		<div class="task-list">
			<div class="grouped-tasks">
				<TaskDragContainer
					:tasks="uncompletedRootTasks(calendar.tasks)"
					:calendar-id="calendarId"
					:disabled="calendar.readOnly"
					collection-id="uncompleted" />
				<h2 v-show="completedCount(calendarId)" class="heading heading--hiddentasks reactive" @click="toggleHidden">
					<span class="heading__title icon-triangle-s">{{ completedCountString }}</span>
				</h2>
				<TaskDragContainer v-if="showHidden"
					:tasks="completedRootTasks(calendar.tasks)"
					:calendar-id="calendarId"
					:disabled="calendar.readOnly"
					class="completed"
					collection-id="completed" />
				<LoadCompletedButton :calendar="calendar" />
				<DeleteCompletedModal v-if="calendar.loadedCompleted && !calendar.readOnly" :calendar="calendar" />
			</div>
		</div>
	</div>
</template>

<script>
import DeleteCompletedModal from '../../components/DeleteCompletedModal.vue'
import LoadCompletedButton from '../../components/LoadCompletedButton.vue'
import SortorderDropdown from '../../components/SortorderDropdown.vue'
import TaskDragContainer from '../../components/TaskDragContainer.vue'

import { mapGetters, mapActions } from 'vuex'

export default {
	components: {
		SortorderDropdown,
		LoadCompletedButton,
		TaskDragContainer,
		DeleteCompletedModal,
	},
	props: {
		calendarId: {
			type: String,
			default: '',
		},
		taskId: {
			type: String,
			default: '',
		},
	},
	data() {
		return {
			newTaskName: '',
			isAddingTask: false,
		}
	},
	computed: {
		showHidden: {
			get() {
				return this.$store.state.settings.settings.showHidden
			},
			set(value) {
				this.$store.dispatch('setSetting', { type: 'showHidden', value })
			},
		},

		inputString() {
			return this.$t('tasks', 'Add a task to "{task}"…', { task: this.calendar.displayName }, undefined, { sanitize: false, escape: false })
		},

		/**
		 * Returns the string for completed tasks
		 *
	 	 * @returns {String} The string to show for the completed tasks count
		 */
		completedCountString() {
			return this.$n('tasks', '%n Completed Task', '%n Completed Tasks', this.completedCount(this.calendarId))
		},
		...mapGetters({
			completedCount: 'getCalendarCountCompleted',
			calendar: 'getCalendarByRoute',
			uncompletedRootTasks: 'findUncompletedRootTasks',
			completedRootTasks: 'findCompletedRootTasks',
		}),
	},
	methods: {
		...mapActions([
			'createTask',
		]),
		toggleHidden() {
			this.showHidden = +!this.showHidden
		},

		clearNewTask(event) {
			event.target.blur()
			this.newTaskName = ''
		},

		addTask() {
			this.createTask({ summary: this.newTaskName, calendar: this.calendar })
			this.newTaskName = ''
		},
	},
}
</script>

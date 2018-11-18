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
	<li :task-id="task.uri"
		:class="{done: task.completed}"
		class="task-item">
		<div :task-id="task.uri"
			:class="{active: $route.params.taskId==task.uri}"
			class="task-body"
			type="task"
			@click="navigate($event)">
			<div v-if="task.complete > 0" class="percentbar">
				<div :style="{ width: task.complete + '%', 'background-color': task.calendar.color }"
					:aria-label="t('tasks', '{complete} % completed', {complete: task.complete})"
					class="percentdone" />
			</div>

			<span :aria-checked="task.completed"
				:aria-label="t('tasks', 'Task is completed')"
				class="task-checkbox"
				name="toggleCompleted"
				role="checkbox"
				@click="toggleCompleted(task)">
				<span :class="{'icon-checkmark': task.completed}" class="icon task-checkbox reactive no-nav" />
			</span>
			<span class="icon task-separator" />
			<span class="task-star" @click="toggleStarred(task.uri)">
				<span :class="[iconStar]" class="icon icon-task-star right large reactive no-nav" />
			</span>
			<span v-if="!task.calendar.readOnly"
				class="task-addsubtask add-subtask">
				<span :taskId="task.uri"
					:title="subtasksCreationPlaceholder" class="icon icon-add right large reactive no-nav"
					oc-click-focus="{selector: '.add-subtask input', timeout: 0}"
					@click="showSubtaskInput = true" />
			</span>
			<span v-if="task.subTasks.length" @click="toggleSubtasks(task)">
				<span :title="t('tasks', 'Toggle subtasks')"
					:class="task.hideSubtasks ? 'icon-subtasks-hidden' : 'icon-subtasks-visible'"
					class="icon right large subtasks reactive no-nav" />
			</span>
			<span v-if="hasCompletedSubtasks" @click="toggleCompletedSubtasks(task)">
				<span :title="t('tasks', 'Toggle completed subtasks')"
					:class="{'active': !task.hideCompletedSubtasks}"
					class="icon icon-toggle right large toggle-completed-subtasks reactive no-nav" />
			</span>
			<span v-if="task.note!=''">
				<span class="icon icon-note right large" />
			</span>
			<span :class="{overdue: overdue(task.due)}" class="duedate">{{ task.due | formatDate }}</span>
			<span v-if="$route.params.collectionId=='week'" class="listname">{{ task.calendar.displayName }}</span>
			<div class="task-info-wrapper">
				<div class="title">
					<span>{{ task.summary }}</span>
				</div>
				<div class="categories-list">
					<span v-for="category in task.categories" :key="category" class="category">
						<span :title="category" class="category-label">{{ category }}</span>
					</span>
				</div>
			</div>
		</div>
		<div class="subtasks-container">
			<div v-click-outside="($event) => cancelCreation($event)"
				v-if="showSubtaskInput"
				class="task-item add-subtask">
				<form name="addTaskForm" @submit="addTask">
					<input v-focus
						v-model="newTaskName"
						:placeholder="subtasksCreationPlaceholder"
						:disabled="isAddingTask"
						@keyup.27="showSubtaskInput = false">
				</form>
			</div>
			<ol v-if="!task.hideSubtasks" :calendarID="task.calendar.uri">
				<task-body-component v-for="subtask in task.subTasks"
					:key="subtask.uid"
					:task="subtask"
					class="subtask" />
					<!-- "orderBy:getSortOrder():settingsmodel.getById('various').sortDirection" -->
			</ol>
		</div>
	</li>
</template>

<script>
import { overdue, valid } from '../store/storeHelper'
import clickOutside from 'vue-click-outside'
import { mapActions } from 'vuex'
import focus from '../directives/focus'

export default {
	name: 'TaskBodyComponent',
	components: {
		clickOutside
	},
	directives: {
		clickOutside,
		focus
	},
	filters: {
		formatDate: function(date) {
			return valid(date)
				? moment(date, 'YYYYMMDDTHHmmss').calendar(null, {
					lastDay: t('tasks', '[Yesterday]'),
					sameDay: t('tasks', '[Today]'),
					nextDay: t('tasks', '[Tomorrow]'),
					lastWeek: 'L',
					nextWeek: 'L',
					sameElse: 'L'
				})
				: ''
		}
	},
	props: {
		task: {
			type: Object,
			required: true
		}
	},
	data() {
		return {
			showSubtaskInput: false,
			newTaskName: '',
			isAddingTask: false
		}
	},
	computed: {
		/**
		 * Returns the path of the task
		 *
		 * @returns {String} the route to the task
		 */
		taskRoute: function() {
			var calendarId = this.$route.params.calendarId
			var collectionId = this.$route.params.collectionId
			if (calendarId) {
				return '/calendars/' + calendarId + '/tasks/' + this.task.uri
			} else if (collectionId) {
				return '/collections/' + collectionId + '/tasks/' + this.task.uri
			}
		},

		iconStar: function() {
			if (this.task.priority > 5) {
				return 'icon-task-star-low'
			} else if (this.task.priority === 5) {
				return 'icon-task-star-medium'
			} else if (this.task.priority > 0 && this.task.priority < 5) {
				return 'icon-task-star-high'
			}
		},

		hasCompletedSubtasks: function() {
			return this.task.subTasks.some(subTask => {
				return subTask.completed
			})
		},

		/**
		 * Returns the placeholder string shown in the subtasks input field
		 *
		 * @param {String} task the name of the parent task
		 * @returns {String} the placeholder string to show
		 */
		subtasksCreationPlaceholder: function() {
			return t('tasks', 'Add a subtask to "{task}"...', {	task: this.task.summary })
		}
	},
	methods: Object.assign(
		mapActions([
			'toggleCompleted',
			'toggleStarred'
		]),
		{
			/**
			 * Checks if a date is overdue
			 */
			overdue: overdue,

			/**
			 * Navigates to a different route, but checks if navigation is desired
			 *
			 * @param {Object} $event the event that triggered navigation
			 * @param {String} route the route to navigate to
			 */
			navigate: function($event) {
				if (!$event.target.classList.contains('no-nav')) {
					this.$router.push(this.taskRoute)
				}
			},

			cancelCreation: function(e) {
				// don't cancel the task creation if the own add-subtask button is clicked
				if (e.target.getAttribute('taskId') !== this.task.uri) {
					this.showSubtaskInput = false
				}
			},

			toggleSubtasks: function(task) {
			},

			toggleCompletedSubtasks: function(task) {
			},

			addTask: function() {
				this.newTaskName = ''
			}
		}
	)
}
</script>

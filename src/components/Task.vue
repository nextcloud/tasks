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
	<li	v-show="showTask"
		:task-id="task.uri"
		:class="{done: task.completed}"
		class="task-item"
	>
		<div :task-id="task.uri"
			:class="{active: $route.params.taskId==task.uri}"
			class="task-body reactive"
			type="task"
			@click="navigate($event)"
		>
			<div v-if="task.complete > 0" class="percentbar">
				<div :style="{ width: task.complete + '%', 'background-color': task.calendar.color }"
					:aria-label="t('tasks', '{complete} % completed', {complete: task.complete})"
					class="percentdone"
				/>
			</div>

			<span :aria-checked="task.completed"
				:aria-label="t('tasks', 'Task is completed')"
				class="task-checkbox"
				name="toggleCompleted"
				role="checkbox"
				@click="toggleCompleted(task)"
			>
				<span :class="{'icon-checkmark': task.completed}" class="icon icon-bw task-checkbox reactive no-nav" />
			</span>
			<span class="icon task-separator" />
			<span class="task-star" @click="toggleStarred(task)">
				<span :class="[iconStar]" class="icon right large reactive no-nav" />
			</span>
			<span v-if="!task.calendar.readOnly"
				class="task-addsubtask add-subtask"
			>
				<span :taskId="task.uri"
					:title="subtasksCreationPlaceholder" class="icon icon-bw icon-add right large reactive no-nav"
					@click="showSubtaskInput = true"
				/>
			</span>
			<span v-if="Object.values(task.subTasks).length" @click="toggleSubtasksVisibility(task)">
				<span :title="t('tasks', 'Toggle visibility of all subtasks.')"
					:class="task.hideSubtasks ? 'icon-subtasks-hidden' : 'icon-subtasks-visible'"
					class="icon icon-bw right large subtasks reactive no-nav"
				/>
			</span>
			<span v-if="hasCompletedSubtasks" @click="toggleCompletedSubtasksVisibility(task)">
				<span :title="t('tasks', 'Toggle visibility of completed subtasks.')"
					:class="{'active': !task.hideCompletedSubtasks}"
					class="icon icon-bw icon-toggle right large toggle-completed-subtasks reactive no-nav"
				/>
			</span>
			<span v-if="task.note!=''">
				<span class="icon icon-bw icon-note right large" />
			</span>
			<span class="task-status-container">
				<TaskStatusDisplay :task="task" />
			</span>
			<span :class="{overdue: overdue(task.due)}" class="duedate">
				{{ task.due | formatDate }}
			</span>
			<span v-if="$route.params.collectionId=='week'" class="listname">
				<span :style="{'background-color': task.calendar.color}" class="calendar-indicator" />
				<span>{{ task.calendar.displayName }}</span>
			</span>
			<div class="task-info-wrapper">
				<div class="title">
					<span v-linkify="task.summary" />
				</div>
				<div class="categories-list">
					<span v-for="category in task.categories" :key="category" class="category">
						<span :title="category" class="category-label">
							{{ category }}
						</span>
					</span>
				</div>
			</div>
		</div>
		<div class="subtasks-container">
			<div v-if="showSubtaskInput"
				v-click-outside="($event) => cancelCreation($event)"
				class="task-item add-subtask"
			>
				<form name="addTaskForm" @submit="addTask">
					<input v-model="newTaskName"
						v-focus
						:placeholder="subtasksCreationPlaceholder"
						:disabled="isAddingTask"
						@keyup.27="showSubtaskInput = false"
					>
				</form>
			</div>
			<ol v-if="!task.hideSubtasks || searchQuery" :calendarID="task.calendar.uri">
				<TaskBodyComponent v-for="subtask in filteredSubtasks"
					:key="subtask.uid"
					:task="subtask"
					class="subtask"
				/>
			</ol>
		</div>
	</li>
</template>

<script>
import { overdue, valid, sort, searchSubTasks } from '../store/storeHelper'
import ClickOutside from 'vue-click-outside'
import { mapGetters, mapActions } from 'vuex'
import focus from '../directives/focus'
import { linkify } from '../directives/linkify.js'
import TaskStatusDisplay from './TaskStatusDisplay'

export default {
	name: 'TaskBodyComponent',
	directives: {
		ClickOutside,
		focus,
		linkify,
	},
	components: {
		TaskStatusDisplay,
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
		...mapGetters({
			sortOrder: 'sortOrder',
			sortDirection: 'sortDirection',
			searchQuery: 'searchQuery',
		}),
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
			return ''
		},

		iconStar: function() {
			if (+this.task.priority > 5) {
				return 'icon-color icon-task-star-low'
			} else if (+this.task.priority === 5) {
				return 'icon-color icon-task-star-medium'
			} else if (+this.task.priority > 0 && +this.task.priority < 5) {
				return 'icon-color icon-task-star-high'
			} else {
				return 'icon-bw icon-task-star'
			}
		},

		hasCompletedSubtasks: function() {
			return Object.values(this.task.subTasks).some(subTask => {
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
		},

		/**
		 * Returns the subtasks filtered by completed state if necessary
		 *
		 * @returns {Array} the array with the subtasks to show
		 */
		filteredSubtasks: function() {
			var subTasks = Object.values(this.task.subTasks)
			if (this.task.hideCompletedSubtasks) {
				subTasks = subTasks.filter(task => {
					return !task.completed
				})
			}
			return sort([...subTasks], this.sortOrder, this.sortDirection)
		},

		/**
		 * Indicates whether we show the task because it matches the search.
		 *
		 * @returns {Boolean} If the task matches
		 */
		showTask: function() {
			// If the task directly matches the search, we show it.
			if (this.task.matches(this.searchQuery)) {
				return true
			}
			// We also have to show tasks for which one sub(sub...)task matches.
			return this.searchSubTasks(this.task, this.searchQuery)
		},
	},
	methods: {
		...mapActions([
			'toggleCompleted',
			'toggleStarred',
			'createTask',
			'getTasksFromCalendar',
			'toggleSubtasksVisibility',
			'toggleCompletedSubtasksVisibility',
		]),
		sort,
		/**
		 * Checks if a date is overdue
		 */
		overdue: overdue,

		/**
		 * Checks if one of the tasks sub(sub-...)tasks matches the search query
		 *
		 * @param {Task} task The task to search in
		 * @param {String} searchQuery The string to find
		 * @returns {Boolean} If the task matches
		 */
		searchSubTasks: searchSubTasks,

		/**
		 * Navigates to a different route, but checks if navigation is desired
		 *
		 * @param {Object} $event the event that triggered navigation
		 * @param {String} route the route to navigate to
		 */
		navigate: function($event) {
			if (!$event.target.classList.contains('no-nav')) {
				if (!this.task.loadedCompleted) {
					this.getTasksFromCalendar({ calendar: this.task.calendar, completed: true, related: this.task.uid })
				}
				this.$router.push(this.taskRoute)
			}
		},

		cancelCreation: function(e) {
			// don't cancel the task creation if the own add-subtask button is clicked
			if (e.target.getAttribute('taskId') !== this.task.uri) {
				this.showSubtaskInput = false
			}
		},

		addTask: function() {
			var task = { summary: this.newTaskName, calendar: this.task.calendar, related: this.task.uid }

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

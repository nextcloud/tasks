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
	<li v-show="showTask"
		:task-id="task.uri"
		:class="{done: task.completed, readOnly: task.calendar.readOnly}"
		:data-priority="[task.priority]"
		class="task-item"
		@dragstart="dragStart($event)">
		<div :task-id="task.uri"
			:class="{active: isTaskOpen()}"
			class="task-body reactive"
			type="task"
			@click="navigate($event)">
			<!-- Checkbox with divider -->
			<div class="task-checkbox">
				<input :id="'toggleCompleted_' + task.uid"
					type="checkbox"
					class="checkbox no-nav"
					name="toggleCompleted"
					:class="{'disabled': task.calendar.readOnly}"
					:checked="task.completed"
					:aria-checked="task.completed"
					:disabled="task.calendar.readOnly"
					:aria-label="$t('tasks', 'Task is completed')"
					@click="toggleCompleted(task)">
				<label class="reactive no-nav" :for="'toggleCompleted_' + task.uid" />
			</div>
			<!-- Info: title, progress & categories -->
			<div class="task-info">
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
				<div v-if="task.complete > 0" class="percentbar">
					<div :style="{ width: task.complete + '%', 'background-color': task.calendar.color }"
						:aria-label="$t('tasks', '{complete} % completed', {complete: task.complete})"
						class="percentdone" />
				</div>
			</div>
			<!-- Icons: sync-status, calendarname, date, note, subtask-show-completed, subtask-visibility, add-subtask, starred -->
			<div class="task-body-icons">
				<div class="task-status-container">
					<TaskStatusDisplay :task="task" />
				</div>
				<div v-if="collectionId=='week'" class="calendar">
					<span :style="{'background-color': task.calendar.color}" class="calendar-indicator" />
					<span class="calendar-name">{{ task.calendar.displayName }}</span>
				</div>
				<div v-if="hasHiddenSubtasks">
					<span class="icon icon-sprt-bw sprt-subtasks-hidden" />
				</div>
				<div v-if="task.pinned">
					<span class="icon icon-sprt-bw sprt-pinned" />
				</div>
				<div v-if="task.note!=''">
					<span class="icon icon-sprt-bw sprt-note" />
				</div>
				<div v-if="task.due" :class="{overdue: overdue(task.dueMoment)}" class="duedate">
					<span>{{ dueDateString }}</span>
				</div>
				<Actions class="reactive no-nav" menu-align="right">
					<ActionButton v-if="!task.calendar.readOnly"
						:close-after-click="true"
						class="reactive no-nav"
						icon="icon-add"
						@click="openSubtaskInput">
						{{ $t('tasks', 'Add subtask') }}
					</ActionButton>
					<ActionButton v-if="Object.values(task.subTasks).length"
						class="reactive no-nav"
						:icon="task.hideSubtasks ? 'icon-subtasks-hidden' : 'icon-subtasks-visible'"
						@click="toggleSubtasksVisibility(task)">
						{{ task.hideSubtasks ? $t('tasks', 'Show subtasks') : $t('tasks', 'Hide subtasks') }}
					</ActionButton>
					<ActionButton v-if="hasCompletedSubtasks"
						class="reactive no-nav"
						icon="icon-toggle"
						@click="toggleCompletedSubtasksVisibility(task)">
						{{ task.hideCompletedSubtasks ? $t('tasks', 'Show completed subtasks') : $t('tasks', 'Hide completed subtasks') }}
					</ActionButton>
					<ActionButton v-if="!readOnly"
						class="reactive no-nav"
						icon="icon-delete"
						@click="removeTask()">
						{{ $t('tasks', 'Delete task') }}
					</ActionButton>
				</Actions>
				<button class="inline task-star reactive no-nav" @click="toggleStarred(task)">
					<span :class="[iconStar, {'disabled': task.calendar.readOnly}]" class="icon" />
				</button>
			</div>
		</div>
		<div class="subtasks-container">
			<div v-if="showSubtaskInput"
				v-click-outside="($event) => closeSubtaskInput($event)"
				class="task-item add-subtask">
				<form name="addTaskForm" @submit.prevent="addTask">
					<input ref="input"
						v-model="newTaskName"
						:placeholder="subtasksCreationPlaceholder"
						:disabled="isAddingTask"
						@keyup.27="showSubtaskInput = false">
				</form>
			</div>
			<TaskDragContainer v-if="showSubtasks"
				:task-id="task.uri"
				:calendar-id="task.calendar.uri"
				:disabled="task.calendar.readOnly">
				<TaskBody v-for="subtask in filteredSubtasks"
					:key="subtask.uid"
					:task="subtask"
					:collection-string="collectionString"
					class="subtask" />
			</TaskDragContainer>
		</div>
	</li>
</template>

<script>
import { overdue, sort, searchSubTasks, isTaskInList } from '../store/storeHelper'
import ClickOutside from 'vue-click-outside'
import { mapGetters, mapActions } from 'vuex'
import { linkify } from '../directives/linkify.js'
import TaskStatusDisplay from './TaskStatusDisplay'
import TaskDragContainer from './TaskDragContainer'

import Actions from '@nextcloud/vue/dist/Components/Actions'
import ActionButton from '@nextcloud/vue/dist/Components/ActionButton'

export default {
	name: 'TaskBody',
	directives: {
		ClickOutside,
		linkify,
	},
	components: {
		TaskStatusDisplay,
		TaskDragContainer,
		Actions,
		ActionButton,
	},
	props: {
		task: {
			type: Object,
			required: true,
		},
		collectionString: {
			type: String,
			default: null,
			required: false,
		},
	},
	data() {
		return {
			showSubtaskInput: false,
			justOpened: false,
			newTaskName: '',
			isAddingTask: false,
		}
	},
	computed: {
		...mapGetters({
			sortOrder: 'sortOrder',
			sortDirection: 'sortDirection',
			searchQuery: 'searchQuery',
		}),

		dueDateString: function() {
			return this.task.dueMoment.isValid()
				? this.task.dueMoment.calendar(null, {
					lastDay: this.$t('tasks', '[Yesterday]'),
					sameDay: this.$t('tasks', '[Today]'),
					nextDay: this.$t('tasks', '[Tomorrow]'),
					lastWeek: 'L',
					nextWeek: 'L',
					sameElse: 'L',
				})
				: ''
		},

		collectionId: function() {
			if (this.collectionString) {
				return this.collectionString.split('-')[0]
			} else {
				return null
			}
		},

		collectionParam: function() {
			try {
				return this.collectionString.split('-')[1]
			} catch {
				return undefined
			}
		},

		iconStar: function() {
			if (+this.task.priority > 5) {
				return 'sprt-color sprt-task-star-low'
			} else if (+this.task.priority === 5) {
				return 'sprt-color sprt-task-star-medium'
			} else if (+this.task.priority > 0 && +this.task.priority < 5) {
				return 'sprt-color sprt-task-star-high'
			} else {
				return 'icon-sprt-bw sprt-task-star'
			}
		},

		hasCompletedSubtasks: function() {
			return Object.values(this.task.subTasks).some(subTask => {
				return subTask.completed
			})
		},

		hasHiddenSubtasks() {
			return (this.hasCompletedSubtasks && this.task.hideCompletedSubtasks) || (this.filteredSubtasks.length && this.task.hideSubtasks)
		},

		/**
		 * Returns the placeholder string shown in the subtasks input field
		 *
		 * @param {String} task the name of the parent task
		 * @returns {String} the placeholder string to show
		 */
		subtasksCreationPlaceholder: function() {
			return this.$t('tasks', 'Add a subtask to "{task}"…', { task: this.task.summary })
		},

		/**
		 * Returns the subtasks filtered by completed state if necessary and
		 * filtered by collections (for week, today, important and current) when
		 * the task is not opened in details view.
		 *
		 * @returns {Array} the array with the subtasks to show
		 */
		filteredSubtasks: function() {
			let subTasks = Object.values(this.task.subTasks)
			if (this.task.hideCompletedSubtasks) {
				subTasks = subTasks.filter(task => {
					return !task.completed
				})
			}
			if (['today', 'week', 'starred', 'current'].indexOf(this.collectionId) > -1
				&& !this.isTaskOpen()) {
				subTasks = subTasks.filter(task => {
					return isTaskInList(task, this.collectionString) || this.isTaskOpen(task) || this.isDescendantOpen(task)
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

		/**
		 * Checks whether we show the subtasks
		 *
		 * @returns {Boolean} If we show the subtasks
		 */
		showSubtasks: function() {
			if (!this.task.hideSubtasks || this.searchQuery || this.isTaskOpen() || this.isDescendantOpen()) {
				return true
			} else {
				return false
			}
		},

		/**
		 * Whether we treat the task as read-only.
		 * We also treat tasks in shared calendars with an access class other than 'PUBLIC'
		 * as read-only.
		 *
		 * @returns {Boolean} Is the task read-only
		 */
		readOnly() {
			return this.task.calendar.readOnly || (this.task.calendar.isSharedWithMe && this.task.class !== 'PUBLIC')
		},
	},

	created() {
		if (!this.task.loadedCompleted && this.$route.params.taskId === this.task.uri) {
			this.getTasksFromCalendar({ calendar: this.task.calendar, completed: true, related: this.task.uid })
		}
	},

	methods: {
		...mapActions([
			'toggleCompleted',
			'toggleStarred',
			'createTask',
			'getTasksFromCalendar',
			'toggleSubtasksVisibility',
			'toggleCompletedSubtasksVisibility',
			'deleteTask',
		]),
		sort,
		/**
		 * Checks if a date is overdue
		 */
		overdue: overdue,

		/**
		 * Set task uri in the data transfer object
		 * so we can get it when dropped on an
		 * app-navigation-item
		 *
		 * @param {Object} e The drag event
		 */
		dragStart(e) {
			e.dataTransfer.setData('text/plain', this.task.uri)
		},

		/**
		 * Checks if one of the tasks sub(sub-...)tasks matches the search query
		 *
		 * @param {Task} task The task to search in
		 * @param {String} searchQuery The string to find
		 * @returns {Boolean} If the task matches
		 */
		searchSubTasks: searchSubTasks,

		/**
		 * Checks whether the task is currently open in the details view
		 *
		 * @param {Task} task The task to check
		 * @returns {Boolean} If it is open
		 */
		isTaskOpen: function(task = this.task) {
			return (task.uri === this.$route.params.taskId) && (this.collectionParam === this.$route.params.collectionParam)
		},

		/**
		 * Deletes the task
		 */
		removeTask() {
			// Close the details view if necessary
			if (this.isTaskOpen() || this.isDescendantOpen()) {
				if (this.$route.params.calendarId) {
					this.$router.push({ name: 'calendars', params: { calendarId: this.$route.params.calendarId } })
				} else {
					this.$router.push({ name: 'collections', params: { collectionId: this.$route.params.collectionId } })
				}
			}
			this.deleteTask({ task: this.task, dav: true })
		},

		/**
		 * Checks whether one of the tasks descendants is currently open in the details view
		 *
		 * @param {Task} task The task to check
		 * @returns {Boolean} If a descendeant is open
		 */
		isDescendantOpen: function(task = this.task) {
			if (this.collectionParam !== this.$route.params.collectionParam) {
				return false
			}
			const taskId = this.$route.params.taskId
			const checkSubtasksOpen = function subtasksOpen(tasks) {
				for (const key in tasks) {
					const task = tasks[key]
					if (task.uri === taskId) {
						return true
					}
					if (subtasksOpen(task.subTasks)) {
						return true
					}
				}
				return false
			}
			return checkSubtasksOpen(task.subTasks)
		},

		/**
		 * Navigates to a different route, but checks if navigation is desired
		 *
		 * @param {Object} $event the event that triggered navigation
		 * @param {String} route the route to navigate to
		 */
		navigate: function($event) {
			if (!$event.target.closest('.no-nav')
				&& (this.$route.params.taskId !== this.task.uri || this.$route.params.collectionParam !== this.collectionParam)) {
				if (!this.task.loadedCompleted) {
					this.getTasksFromCalendar({ calendar: this.task.calendar, completed: true, related: this.task.uid })
				}
				if (this.$route.params.calendarId) {
					this.$router.push({ name: 'calendarsTask', params: { calendarId: this.$route.params.calendarId, taskId: this.task.uri } })
				} else if (this.collectionId) {
					if (this.collectionParam) {
						this.$router.push({
							name: 'collectionsParamTask',
							params: { collectionId: this.collectionId, collectionParam: this.collectionParam, taskId: this.task.uri },
						})
					} else {
						this.$router.push({ name: 'collectionsTask', params: { collectionId: this.collectionId, taskId: this.task.uri } })
					}
				}
			}
		},

		openSubtaskInput() {
			this.showSubtaskInput = true
			this.justOpened = true
			this.$nextTick(
				() => this.$refs.input.focus()
			)
		},

		closeSubtaskInput: function(e) {
			// don't cancel the task creation if the own add-subtask button is clicked
			if (this.justOpened) {
				this.justOpened = false
				return
			}
			this.showSubtaskInput = false
		},

		addTask: function() {
			const task = { summary: this.newTaskName, calendar: this.task.calendar, related: this.task.uid }

			// If the task is created in a collection view,
			// set the appropriate properties.
			if (this.collectionId === 'starred') {
				task.priority = '1'
			}
			if (this.collectionId === 'today') {
				task.due = moment().startOf('day').format('YYYY-MM-DDTHH:mm:ss')
			}
			if (this.collectionId === 'current') {
				task.start = moment().format('YYYY-MM-DDTHH:mm:ss')
			}

			this.createTask(task)
			this.newTaskName = ''
		},
	},
}
</script>

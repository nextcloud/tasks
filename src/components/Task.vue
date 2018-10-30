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
	<div class="task-body-component">
		<div :taskId="task.uri"
			:class="{active: $route.params.taskId==task.uri, subtasks: hasSubtasks(task), completedsubtasks: hasCompletedSubtasks(task),
				subtaskshidden: task.hideSubtasks, attachment: task.note!=''}"
			class="task-body"
			type="task">

			<div v-if="task.complete > 0" class="percentbar">
				<div :style="{ width: task.complete + '%', 'background-color': task.calendar.color }"
					:aria-label="t('tasks', '{complete} % completed', {complete: task.complete})"
					class="percentdone" />
			</div>

			<a :aria-checked="task.completed"
				:aria-label="t('tasks', 'Task is completed')"
				class="task-checkbox"
				name="toggleCompleted"
				role="checkbox"
				@click="toggleCompleted(task.uri)">
				<span :class="{'icon-checkmark': task.completed}" class="icon task-checkbox reactive" />
			</a>
			<a class="icon task-separator" />
			<a class="task-star" @click="toggleStarred(task.uri)">
				<span :class="[iconStar]" class="icon icon-task-star right large reactive" />
			</a>
			<a v-show="task.calendar.writable"
				class="task-addsubtask add-subtask">
				<span :taskId="task.uri"
					:title="subtasksCreationPlaceholder(task.summary)" class="icon icon-add right large reactive"
					oc-click-focus="{selector: '.add-subtask input', timeout: 0}"
					@click="showSubtaskInput = true" />
			</a>
			<a @click="toggleSubtasks(task)">
				<span :title="t('tasks', 'Toggle subtasks')"
					:class="task.hideSubtasks ? 'icon-subtasks-hidden' : 'icon-subtasks-visible'"
					class="icon right large subtasks reactive" />
			</a>
			<a @click="toggleCompletedSubtasks(task)">
				<span :title="t('tasks', 'Toggle completed subtasks')"
					:class="{'active': !task.hideCompletedSubtasks}"
					class="icon icon-toggle right large toggle-completed-subtasks reactive" />
			</a>
			<a>
				<span class="icon icon-note right large" />
			</a>
			<a :class="{overdue: overdue(task.due)}" class="duedate">{{ task.due | formatDate }}</a>
			<a v-show="$route.params.collectionId=='week'" class="listname">{{ task.calendar.displayname }}</a>
			<div class="task-info-wrapper">
				<div class="title">
					<span>{{ task.summary }}</span>
				</div>
				<div class="categories-list">
					<span v-for="category in task.categories" :key="category.id" class="category">
						<span class="category-label" :title="category.name" >{{ category.name }}</span>
					</span>
				</div>
			</div>
		</div>
		<div :class="{subtaskshidden: hideSubtasks(task)}"
			class="subtasks-container">
			<ol :calendarID="task.calendar.uri"
				dnd-list="draggedTasks"
				dnd-drop="dropAsSubtask(event, item, index)"
				dnd-dragover="dragover(event, index)">
				<li v-click-outside="($event) => cancelCreation($event)"
					v-show="showSubtaskInput"
					class="task-item ui-draggable add-subtask">
					<form name="addTaskForm" @submit="addTask">
						<input id="target"
							v-model="newTaskName"
							:placeholder="subtasksCreationPlaceholder(task.summary)"
							:disabled="isAddingTask"
							class="transparent"
							@keyup.27="showSubtaskInput = false">
					</form>
				</li>
				<router-link v-for="subtask in getTasksByParentId(task.uid)"
					:key="subtask.uid"
					:to="getTaskRoute(subtask.uri)"
					:task-id="subtask.uri"
					:class="{done: subtask.completed}"
					tag="li"
					class="task-item ui-draggable subtask"
					dnd-draggable="task"
					dnd-dragstart="dragStart(event)"
					dnd-dragend="dragEnd(event)">
					<!-- dnd-effect-allowed="{{ allow(task) }}"> -->
					<!-- "orderBy:getSortOrder():settingsmodel.getById('various').sortDirection" -->
					<task-body-component :task="subtask" :tasks="tasks" />
				</router-link>
			</ol>
		</div>
	</div>
</template>

<script>
import { overdue, valid } from '../store/storeHelper'
import clickOutside from 'vue-click-outside'
import { mapActions } from 'vuex'

export default {
	name: 'TaskBodyComponent',
	components: {
		clickOutside
	},
	directives: {
		clickOutside
	},
	filters: {
		formatDate: function(due) {
			return valid(due) ? moment(due).calendar(null, {
				lastDay: t('tasks', '[Yesterday]'),
				sameDay: t('tasks', '[Today]'),
				nextDay: t('tasks', '[Tomorrow]'),
				lastWeek: 'L',
				nextWeek: 'L',
				sameElse: 'L'
			}) : ''
		}
	},
	props: {
		task: {
			type: Object,
			required: true
		},
		tasks: {
			type: Array,
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
		iconStar: function() {
			if (this.task.priority > 5) {
				return 'icon-task-star-low'
			} else if (this.task.priority === 5) {
				return 'icon-task-star-medium'
			} else if (this.task.priority > 0 && this.task.priority < 5) {
				return 'icon-task-star-high'
			}
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
			 * Returns the path of the task
			 *
			 * @param {String} taskId the Id of the task
			 */
			getTaskRoute: function(taskId) {
				var calendarId = this.$route.params.calendarId
				var collectionId = this.$route.params.collectionId
				if (calendarId) {
					return '/calendars/' + calendarId + '/tasks/' + taskId
				} else if (collectionId) {
					return '/collections/' + collectionId + '/tasks/' + taskId
				}
			},

			/**
			 * Returns all tasks which are direct children of the task with Id parentId
			 *
			 * @param {String} parentId the Id of the parent task
			 */
			getTasksByParentId: function(parentId) {
				return Object.values(this.tasks)
					.filter(task => {
						return task.related === parentId
					})
			},

			/**
			 * Returns the placeholder string shown in the subtasks input field
			 *
			 * @param {String} task the name of the parent task
			 */
			subtasksCreationPlaceholder: function(task) {
				return t('tasks', 'Add a subtask to "{task}"...', {	task: task })
			},

			cancelCreation: function(e) {
				// don't cancel the task creation if the own add-subtask button is clicked
				if (e.target.getAttribute('taskId') !== this.task.uri) {
					this.showSubtaskInput = false
				}
			},

			hasSubtasks: function(task) {
				return false
			},

			hasCompletedSubtasks: function(task) {
				return false
			},

			toggleSubtasks: function(task) {
			},

			toggleCompletedSubtasks: function(task) {
			},

			hideSubtasks: function(task) {
			},

			addTask: function() {
				this.newTaskName = ''
			}
		}
	)
}
</script>

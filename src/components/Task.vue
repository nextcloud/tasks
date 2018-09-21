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
		<div :taskID="task.uri"
			class="task-body"
			type="task"
			ng-class="{active: route.taskID==task.uri, subtasks: hasSubtasks(task), completedsubtasks: hasCompletedSubtasks(task),
			subtaskshidden: task.hideSubtasks, attachment: task.note!=''}">

			<div v-if="task.complete > 0" class="percentbar">
				<div :style="{ width: task.complete, 'background-color': task.calendar.color }"
					class="percentdone">
					<!-- aria-label="{{ task.complete | percentDetails}}"> -->
				</div>
			</div>

			<a :aria-checked="task.completed"
				:aria-label="t('tasks', 'Task is completed')"
				class="task-checkbox handler"
				name="toggleCompleted"
				ng-click="toggleCompleted(task)"
				role="checkbox">
				<span :class="{'icon-checkmark': task.completed}" class="icon task-checkbox reactive" />
			</a>
			<a class="icon task-separator" />
			<a class="task-star handler" ng-click="toggleStarred(task)">
				<span :class="{'icon-task-star-high':task.priority > 5, 'icon-task-star-medium':task.priority == 5,
					'icon-task-star-low':task.priority > 0 && task.priority < 5}" class="icon icon-task-star right large reactive" />
			</a>
			<a class="task-addsubtask handler add-subtask"
				ng-show="task.calendar.writable"
				ng-click="showSubtaskInput(task.uid)"
				oc-click-focus="{selector: '.add-subtask input', timeout: 0}">
				<span :title="t('tasks', 'Add a subtask to subtasks') + ' ' + task.summary" class="icon icon-add right large reactive" />
			</a>
			<a class="handler" ng-click="toggleSubtasks(task)">
				<span :title="t('tasks', 'Toggle subtasks')"
					class="icon right large subtasks reactive"
					ng-class="task.hideSubtasks ? 'icon-subtasks-hidden' : 'icon-subtasks-visible'" />
			</a>
			<a class="handler" ng-click="toggleCompletedSubtasks(task)">
				<span :title="t('tasks', 'Toggle completed subtasks')"
					class="icon icon-toggle right large toggle-completed-subtasks reactive"
					ng-class="{'active': !task.hideCompletedSubtasks}" />
			</a>
			<a>
				<span class="icon icon-note right large" />
			</a>
			<!-- <a class="duedate" ng-class="{overdue: TasksModel.overdue(task.due)}">{{ task.due | dateTaskList }}</a> -->
			<a ng-show="route.collectionID=='week'" class="listname">{{ task.calendar.displayname }}</a>
			<div class="title-wrapper">
				<span class="title">{{ task.summary }}</span>
				<span class="categories-list">
					<ul>
						<li v-for="category in task.categories" :key="category">
							<span>{{ category }}</span>
						</li>
					</ul>
				</span>
			</div>
		</div>
		<div class="subtasks-container"
			ng-class="{subtaskshidden: hideSubtasks(task)}">
			<ol :calendarID="task.calendar.uri"
				dnd-list="draggedTasks"
				dnd-drop="dropAsSubtask(event, item, index)"
				dnd-dragover="dragover(event, index)">
				<li class="task-item ui-draggable handler add-subtask"
					ng-show="status.addSubtaskTo == task.uid">
					<form ng-submit="addTask(status.subtaskName,task.uid,task.calendar,task)" name="addTaskForm">
						<input class="transparent"
							ng-disabled="isAddingTask"
							ng-click="focusInput()"
							ng-model="status.subtaskName"
							ng-keydown="checkTaskInput($event)">
							<!-- placeholder="{{ getSubAddString(task.summary) }}"/> -->
					</form>
				</li>
				<li v-for="subtask in getTasksByParentId(task.uid)"
					:key="subtask.uid"
					:taskID="task.uri"
					:class="{done: task.completed}"
					class="task-item ui-draggable handler subtask"

					ng-repeat="task in getSubTasks(filtered,task) | orderBy:getSortOrder():settingsmodel.getById('various').sortDirection"
					ng-click="openDetails(task.uri,$event)"
					dnd-draggable="task"
					dnd-dragstart="dragStart(event)"
					dnd-dragend="dragEnd(event)">
					<!-- dnd-effect-allowed="{{ allow(task) }}"> -->
					<task-body-component :task="subtask" :tasks="tasks" />
				</li>
			</ol>
		</div>
	</div>
</template>

<script>

export default {
	name: 'TaskBodyComponent',
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
	methods: {
		/**
		 * Returns all tasks which are direct children of the task with ID parentId
		 *
		 * @param {String} parentId the Id of the parent task
		 */
		getTasksByParentId: function(parentId) {
			return Object.values(this.tasks)
				.filter(task => {
					return task.related === parentId
				})
		}
	}
}
</script>

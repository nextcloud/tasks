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
	<!-- <div ng-repeat="calendar in calendars | filter:filterLists()" class="grouped-tasks ui-droppable" :rel="calendar.uri"> -->
	<div>
		<div v-for="calendar in calendars"
			:key="calendar.id"
			class="grouped-tasks ui-droppable"
			:rel="calendar.uri">
			<h2 class="heading">
				<text>{{ calendar.displayname }}</text>
			</h2>
			<ol class="tasks"
				:calendarID="calendar.uri"
				:collectionID="$route.params.collectionId"
				type="list"
				dnd-list="draggedTasks"
				dnd-drop="dropAsRootTask(event, item, index)"
				dnd-dragover="dragover(event, index)">
				<li class="task-item ui-draggable handler"
					:taskID="task.uri"
					ng-animate="'animate'"
					ng-click="openDetails(task.uri,$event)"
					ng-class="{done: task.completed}"
					dnd-draggable="task"
					dnd-dragstart="dragStart(event)"
					dnd-dragend="dragEnd(event)"
					v-for="task in tasks"
					:key="task.id">
					<!-- ng-repeat="task in filtered = filteredTasks() | filter:hasNoParent(task) | filter:filterTasks(task,calendar.uri) | filter:filterTasks(task,route.collectionID) | orderBy:getSortOrder():settingsmodel.getById('various').sortDirection"> -->
					<!-- dnd-effect-allowed="{{ allow(task) }}"> -->
					<task-body />
				</li>
			</ol>
			<div class="loadmore handler" ng-hide="loadedCompleted(calendar.uri) || route.collectionID != 'completed'">
				<span ng-click="getCompletedTasks(calendar.uri)">{{ t('tasks', 'Load remaining completed tasks.') }}</span>
			</div>
		</div>
	</div>
</template>

<script>
	import { mapState } from 'vuex';
	import TaskBody from '../Task.vue';

	export default {
		computed: Object.assign({},
			mapState({
				calendars: state => state.calendars,
				tasks: state => state.tasks
			})
		),
		components: {
			'task-body': TaskBody
		}
	}
</script>

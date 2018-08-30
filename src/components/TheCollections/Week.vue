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
	<div ng-repeat="day in days | filter:dayHasEntry(day)" class="grouped-tasks ui-droppable">
		<h2 class="heading">
			<!-- <text>{{ day | day  }}</text> -->
		</h2>
		<ol :collectionID="$route.params.collectionId"
			class="tasks"
			listID=""
			type="list"
			dnd-list="draggedTasks"
			dnd-drop="dropAsRootTask(event, item, index)"
			dnd-dragover="dragover(event, index)">
			<li v-for="task in tasks"
				:taskID="task.uri"
				:key="task.id"
				class="task-item ui-draggable handler"
				ng-animate="'animate'"
				ng-click="openDetails(task.uri,$event)"
				ng-class="{done: task.completed}"
				dnd-draggable="task"
				dnd-dragstart="dragStart(event)"
				dnd-dragend="dragEnd(event)">
				<!-- ng-repeat="task in filtered = filteredTasks() | filter:taskAtDay(task,day) | filter:hasNoParent(task) | filter:{'completed':'false'} | orderBy:getSortOrder():settingsmodel.getById('various').sortDirection"> -->
				<!-- dnd-effect-allowed="{{ allow(task) }}"> -->
				<task />
			</li>
		</ol>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import Task from '../Task'

export default {
	components: {
		'task': Task
	},
	computed: Object.assign({},
		mapState({
			tasks: state => state.tasks
		})
	)
}
</script>

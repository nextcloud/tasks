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
	<div>
		<div :class="{'completed-hidden': showHidden}"
			class="grouped-tasks">
			<ol :calendarID="$route.params.calendarId"
				class="tasks"
				collectionID="uncompleted"
				type="list"
				dnd-list="draggedTasks"
				dnd-drop="dropAsRootTask(event, item, index)"
				dnd-dragover="dragover(event, index)">
				<router-link v-for="task in tasks"
					:task-id="task.uri"
					:key="task.id"
					:to="'/calendars/' + $route.params.calendarId + '/tasks/' + task.uri"
					tag="li"
					class="task-item ui-draggable handler"
					ng-click="openDetails(task.uri,$event)"
					ng-class="{done: task.completed}"
					dnd-draggable="task"
					dnd-dragstart="dragStart(event)"
					dnd-dragend="dragEnd(event)">
					<!-- ng-repeat="task in filtered = filteredTasks() | filter:hasNoParent(task) | filter:filterTasks(task,route.calendarID) | filter:{'completed':'false'} | orderBy:getSortOrder():settingsmodel.getById('various').sortDirection"> -->
					<!-- dnd-effect-allowed="{{ allow(task) }}"> -->
					<task :task="task" :tasks="tasks" />
				</router-link>
			</ol>
			<h2 class="heading-hiddentasks icon-triangle-s handler" ng-show="getCount(route.calendarID,'completed')" @click="toggleHidden">
				<!-- {{ getCountString(route.calendarID,'completed') }} -->
			</h2>
			<ol :calendarID="$route.params.calendarId"
				class="completed-tasks"
				collectionID="completed"
				type="list"
				dnd-list="draggedTasks"
				dnd-drop="dropAsRootTask(event, item, index)"
				dnd-dragover="dragover(event, index)">
				<router-link v-for="task in tasks"
					:task-id="task.uri"
					:key="task.id"
					:to="'/calendars/' + $route.params.calendarId + '/tasks/' + task.uri"
					tag="li"
					class="task-item handler"
					ng-click="openDetails(task.uri,$event)"
					ng-class="{done: task.completed}"
					dnd-draggable="task"
					dnd-dragstart="dragStart(event)"
					dnd-dragend="dragEnd(event)">
					<!-- ng-repeat="task in filtered = filteredTasks() | filter:hasNoParent(task) | filter:filterTasks(task,route.calendarID) | filter:{'completed':true} | orderBy:'completed_date':true"> -->
					<!-- dnd-effect-allowed="{{ allow(task) }}"> -->
					<task :task="task" :tasks="tasks" />
				</router-link>
			</ol>
			<div class="loadmore handler" ng-hide="loadedCompleted(route.calendarID)">
				<span ng-click="getCompletedTasks(route.calendarID)">{{ t('tasks', 'Load remaining completed tasks.') }}</span>
			</div>
		</div>
	</div>
</template>

<script>
import { mapGetters } from 'vuex'
import Task from '../Task'

export default {
	components: {
		'task': Task
	},
	props: {
		calendarId: {
			type: String,
			default: ''
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
		} },
	mapGetters({
		tasks: 'getTasksByRoute'
	})
	),
	methods: {
		toggleHidden: function() {
			this.showHidden = +!this.showHidden
		}
	}
}
</script>

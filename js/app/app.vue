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
	<div id="content" class="app-tasks">
		<div id="app-navigation">
			<theList/>
			<theSettings/>
		</div>

		<div id="app-content"
			ng-class="{'with-app-sidebar':route.taskID}">
			<div class="content-wrapper">
				<div id="add-task"
					class="add-task handler"
					ng-show="showInput()"
					ng-class="{'focus':status.focusTaskInput}">
					<form ng-submit="addTask(status.taskName)" name="addTaskForm">
						<input id="target"
							ng-disabled="isAddingTask"
							ng-click="focusTaskInput()"
							class="transparent"
							ng-model="status.taskName"
							ng-keydown="checkTaskInput($event)"/>
							<!-- placeholder="{{ getAddString() }}"/> -->
					</form>
				</div>
				<div class="app-navigation-entry-utils">
					<div class="app-navigation-entry-utils-menu-button" title="<?php p($l->t('Change sort order')); ?>">
						<button class="sortorder-dropdown-button">
							<span class="icon" ng-class="getSortOrderIcon()"></span>
							<span class="icon sort-indicator" ng-class="{'icon-sort-up': settingsmodel.getById('various').sortDirection, 'icon-sort-down': !settingsmodel.getById('various').sortDirection}"></span>
						</button>
					</div>
				</div>
				<div class="app-navigation-entry-menu bubble sortorder-dropdown">
					<ul>
						<li ng-click="setSortOrder($event, 'default')" ng-class="{active: settingsmodel.getById('various').sortOrder == 'default'}" class="handler">
							<a>
								<span class="icon icon-list"></span>
								<span class="label">{{ t('tasks', 'Default') }}</span>
								<span class="icon sort-indicator" ng-class="{'icon-sort-up': settingsmodel.getById('various').sortDirection, 'icon-sort-down': !settingsmodel.getById('various').sortDirection}"></span>
							</a>
						</li>
						<li ng-click="setSortOrder($event, 'due')" ng-class="{active: settingsmodel.getById('various').sortOrder == 'due'}">
							<a>
								<span class="icon icon-calendar"></span>
								<span class="label">{{ t('tasks', 'Due date') }}</span>
								<span class="icon sort-indicator" ng-class="{'icon-sort-up': settingsmodel.getById('various').sortDirection, 'icon-sort-down': !settingsmodel.getById('various').sortDirection}"></span>
							</a>
						</li>
						<li ng-click="setSortOrder($event, 'start')" ng-class="{active: settingsmodel.getById('various').sortOrder == 'start'}">
							<a>
								<span class="icon icon-calendar"></span>
								<span class="label">{{ t('tasks', 'Start date') }}</span>
								<span class="icon sort-indicator" ng-class="{'icon-sort-up': settingsmodel.getById('various').sortDirection, 'icon-sort-down': !settingsmodel.getById('various').sortDirection}"></span>
							</a>
						</li>
						<li ng-click="setSortOrder($event, 'priority')" ng-class="{active: settingsmodel.getById('various').sortOrder == 'priority'}">
							<a>
								<span class="icon icon-task-star"></span>
								<span class="label">{{ t('tasks', 'Priority') }}</span>
								<span class="icon sort-indicator" ng-class="{'icon-sort-up': settingsmodel.getById('various').sortDirection, 'icon-sort-down': !settingsmodel.getById('various').sortDirection}"></span>
							</a>
						</li>
						<li ng-click="setSortOrder($event, 'alphabetically')" ng-class="{active: settingsmodel.getById('various').sortOrder == 'alphabetically'}">
							<a>
								<span class="icon icon-alphabetically"></span>
								<span class="label">{{ t('tasks', 'Alphabetically') }}</span>
								<span class="icon sort-indicator" ng-class="{'icon-sort-up': settingsmodel.getById('various').sortDirection, 'icon-sort-down': !settingsmodel.getById('various').sortDirection}"></span>
							</a>
						</li>
						<!-- <li ng-click="setSortOrder($event, 'manual')" ng-class="{active: settingsmodel.getById('various').sortOrder == 'manual'}">
							<a>
								<span class="icon icon-manual"></span>
								<span class="label">{{ t('tasks', 'Manually') }</span>
								<span class="icon sort-indicator" ng-class="{'icon-sort-up': settingsmodel.getById('various').sortDirection, 'icon-sort-down': !settingsmodel.getById('various').sortDirection}"></span>
							</a>
						</li> -->
					</ul>
				</div>
				<div class="task-list">
					<router-view />
					<div id="searchresults"></div>
					<div class="task-item template">
						<div class="task-body">
							<div class="percentdone"></div>
							<a class="task-checkbox" name="toggleCompleted" ng-click="toggleCompleted()">
								<span class="icon task-checkbox"></span>
							</a>
							<a class="icon task-separator"></a>
							<a class="task-star" ng-click="toggleStarred(task.id)">
								<span class="icon task-star faded"></span>
							</a>
							<!-- <a class="duedate" ng-class="{overdue: TasksModel.overdue(task.due)}">{{ task.due | dateTaskList }}</a> -->
							<div class="title-wrapper">
								<span class="title"></span>
								<span class="icon task-attachment"></span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div id="app-sidebar">
			<theDetails/>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex';
import TheList from './components/TheList.vue';
import TheSettings from './components/TheSettings.vue';
import TheDetails from './components/TheDetails.vue';

export default {
	name: 'app',
	components: {
		'theSettings': TheSettings,
		'theList': TheList,
		'theDetails': TheDetails
	}
}
</script>

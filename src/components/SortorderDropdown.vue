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
		<div class="app-navigation-entry-utils">
			<div class="app-navigation-entry-utils-menu-button" title="<?php p($l->t('Change sort order')); ?>">
				<button class="sortorder-dropdown-button">
					<span class="icon" ng-class="getSortOrderIcon()" />
					<span class="icon sort-indicator" ng-class="{'icon-sort-up': settingsmodel.getById('various').sortDirection, 'icon-sort-down': !settingsmodel.getById('various').sortDirection}" />
				</button>
			</div>
		</div>
		<div class="app-navigation-entry-menu bubble sortorder-dropdown">
			<ul>
				<li ng-click="setSortOrder($event, 'default')" ng-class="{active: settingsmodel.getById('various').sortOrder == 'default'}" class="handler">
					<a>
						<span class="icon icon-list" />
						<span class="label">{{ t('tasks', 'Default') }}</span>
						<span class="icon sort-indicator" ng-class="{'icon-sort-up': settingsmodel.getById('various').sortDirection, 'icon-sort-down': !settingsmodel.getById('various').sortDirection}" />
					</a>
				</li>
				<li ng-click="setSortOrder($event, 'due')" ng-class="{active: settingsmodel.getById('various').sortOrder == 'due'}">
					<a>
						<span class="icon icon-calendar" />
						<span class="label">{{ t('tasks', 'Due date') }}</span>
						<span class="icon sort-indicator" ng-class="{'icon-sort-up': settingsmodel.getById('various').sortDirection, 'icon-sort-down': !settingsmodel.getById('various').sortDirection}" />
					</a>
				</li>
				<li ng-click="setSortOrder($event, 'start')" ng-class="{active: settingsmodel.getById('various').sortOrder == 'start'}">
					<a>
						<span class="icon icon-calendar" />
						<span class="label">{{ t('tasks', 'Start date') }}</span>
						<span class="icon sort-indicator" ng-class="{'icon-sort-up': settingsmodel.getById('various').sortDirection, 'icon-sort-down': !settingsmodel.getById('various').sortDirection}" />
					</a>
				</li>
				<li ng-click="setSortOrder($event, 'priority')" ng-class="{active: settingsmodel.getById('various').sortOrder == 'priority'}">
					<a>
						<span class="icon icon-task-star" />
						<span class="label">{{ t('tasks', 'Priority') }}</span>
						<span class="icon sort-indicator" ng-class="{'icon-sort-up': settingsmodel.getById('various').sortDirection, 'icon-sort-down': !settingsmodel.getById('various').sortDirection}" />
					</a>
				</li>
				<li ng-click="setSortOrder($event, 'alphabetically')" ng-class="{active: settingsmodel.getById('various').sortOrder == 'alphabetically'}">
					<a>
						<span class="icon icon-alphabetically" />
						<span class="label">{{ t('tasks', 'Alphabetically') }}</span>
						<span class="icon sort-indicator" ng-class="{'icon-sort-up': settingsmodel.getById('various').sortDirection, 'icon-sort-down': !settingsmodel.getById('various').sortDirection}" />
					</a>
				</li>
				<!-- <li ng-click="setSortOrder($event, 'manual')" ng-class="{active: settingsmodel.getById('various').sortOrder == 'manual'}">
					<a>
						<span class="icon icon-manual" />
						<span class="label">{{ t('tasks', 'Manually') }</span>
						<span class="icon sort-indicator" ng-class="{'icon-sort-up': settingsmodel.getById('various').sortDirection, 'icon-sort-down': !settingsmodel.getById('various').sortDirection}" />
					</a>
				</li> -->
			</ul>
		</div>
	</div>
</template>

<script>
import clickOutside from 'vue-click-outside'

export default {
	name: 'SortorderDropdown',
	components: {
		clickOutside
	},
	directives: {
		clickOutside
	},
	data() {
		return {
			menuOpen: false
		}
	},
	methods: {
		closeMenu() {
			this.menuOpen = false
		},
		toggleMenu() {
			this.menuOpen = !this.menuOpen
		}
	}
}
</script>

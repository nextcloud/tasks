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
		<div v-click-outside="closeMenu" class="app-navigation-entry-utils reactive" @click="toggleMenu">
			<div :title="t('tasks', 'Change sort order')" class="app-navigation-entry-utils-menu-button">
				<button class="sortorder-dropdown-button">
					<span :class="sortOrderIcon" class="icon icon-bw" />
					<span :class="sortDirection ? 'icon-sort-up' : 'icon-sort-down'" class="icon icon-bw sort-indicator" />
				</button>
			</div>
		</div>
		<div :class="{'open': menuOpen}" class="app-navigation-entry-menu bubble sortorder-dropdown reactive">
			<ul>
				<li v-for="order in orders"
					:key="order.id"
					v-tooltip="{
						placement: 'left',
						content: order.hint,
						delay: { show: 500, hide: 0 }
					}"
					:class="{active: sortOrder == order.id}"
					@click="setSortOrder(order.id)"
				>
					<a>
						<span :class="order.icon" class="icon icon-bw" />
						<span class="label">
							{{ order.text }}
						</span>
						<span :class="sortDirection ? 'icon-sort-up' : 'icon-sort-down'" class="icon icon-bw sort-indicator" />
					</a>
				</li>
			</ul>
		</div>
	</div>
</template>

<script>
import ClickOutside from 'vue-click-outside'

export default {
	name: 'SortorderDropdown',
	directives: {
		ClickOutside
	},
	data() {
		return {
			menuOpen: false,
			orders: [
				{
					id: 'default',
					icon: 'icon-list',
					text: t('tasks', 'Default'),
					hint: t('tasks', 'Sort by completed state, due date, priority, start date and summary.')
				},
				{
					id: 'due',
					icon: 'icon-calendar',
					text: t('tasks', 'Due date'),
					hint: t('tasks', 'Sort by due date and summary.')
				},
				{
					id: 'start',
					icon: 'icon-calendar',
					text: t('tasks', 'Start date'),
					hint: t('tasks', 'Sort by start date and summary.')
				},
				{
					id: 'created',
					icon: 'icon-calendar',
					// TRANSLATORS The date at which a task was created.
					text: t('tasks', 'Created date'),
					hint: t('tasks', 'Sort by created date and summary.')
				},
				{
					id: 'modified',
					icon: 'icon-calendar',
					text: t('tasks', 'Last modified'),
					hint: t('tasks', 'Sort by last-modified date and summary.')
				},
				{
					id: 'completedDate',
					icon: 'icon-calendar',
					text: t('tasks', 'Completed date'),
					hint: t('tasks', 'Sort by completed date.')
				},
				{
					id: 'priority',
					icon: 'icon-task-star',
					text: t('tasks', 'Priority'),
					hint: t('tasks', 'Sort by priority and summary.')
				},
				// Manual sorting is not yet implemented
				// {
				// 	id: 'manual',
				// 	icon: 'icon-manual',
				// 	text: t('tasks', 'Manually'),
				// 	hint: t('tasks', 'Sort by manual order.')
				// },
				{
					id: 'alphabetically',
					icon: 'icon-alphabetically',
					text: t('tasks', 'Alphabetically'),
					hint: t('tasks', 'Sort by summary and priority.')
				}
			]
		}
	},
	computed: {
		sortOrder: {
			get() {
				return this.$store.state.settings.settings.sortOrder
			},
			set(order) {
				this.$store.dispatch('setSetting', { type: 'sortOrder', value: order })
			}
		},
		sortDirection: {
			get() {
				return this.$store.state.settings.settings.sortDirection
			},
			set(direction) {
				this.$store.dispatch('setSetting', { type: 'sortDirection', value: +direction })
			}
		},
		sortOrderIcon: function() {
			var icon
			switch (this.sortOrder) {
			case 'due':
			case 'start':
			case 'created':
			case 'completedDate':
			case 'modified':
				icon = 'calendar'
				break
			case 'priority':
				icon = 'task-star'
				break
			case 'alphabetically':
				icon = 'alphabetically'
				break
			case 'manual':
				icon = 'manual'
				break
			default:
				icon = 'list'
			}
			return 'icon-' + icon
		}
	},
	methods: {
		closeMenu() {
			this.menuOpen = false
		},
		toggleMenu() {
			this.menuOpen = !this.menuOpen
		},
		setSortOrder(order) {
			// If the sort order was already set, toggle the sort direction, otherwise reset it.
			this.sortDirection = (this.sortOrder === order) ? !this.sortDirection : false
			this.sortOrder = order
		}
	}
}
</script>

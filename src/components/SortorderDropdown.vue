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
	<Actions class="sortorder reactive"
		:title="$t('tasks', 'Change sort order')"
		:default-icon="sortOrderIcon"
		menu-align="right">
		<ActionButton v-for="order in orders"
			:key="order.id"
			v-tooltip="{
				placement: 'left',
				content: order.hint,
				delay: { show: 500, hide: 0 }
			}"
			:class="{selected: sortOrder === order.id}"
			:icon="getIcon(order)"
			:close-after-click="true"
			@click="setSortOrder(order.id)">
			{{ order.text }}
		</ActionButton>
	</Actions>
</template>

<script>
import Actions from '@nextcloud/vue/dist/Components/Actions'
import ActionButton from '@nextcloud/vue/dist/Components/ActionButton'
import { mapGetters } from 'vuex'

export default {
	name: 'SortorderDropdown',
	components: {
		Actions,
		ActionButton,
	},
	data() {
		return {
			orders: [
				{
					id: 'default',
					icon: 'icon-list',
					text: this.$t('tasks', 'Relevance'),
					hint: this.$t('tasks', 'Sort by completed state, due date, priority, start date and summary.'),
				},
				{
					id: 'start',
					icon: 'icon-start',
					text: this.$t('tasks', 'Start date'),
					hint: this.$t('tasks', 'Sort by start date and summary.'),
				},
				{
					id: 'due',
					icon: 'icon-due',
					text: this.$t('tasks', 'Due date'),
					hint: this.$t('tasks', 'Sort by due date and summary.'),
				},
				{
					id: 'created',
					icon: 'icon-add',
					// TRANSLATORS The date at which a task was created.
					text: this.$t('tasks', 'Created date'),
					hint: this.$t('tasks', 'Sort by created date and summary.'),
				},
				{
					id: 'modified',
					icon: 'icon-rename',
					text: this.$t('tasks', 'Last modified'),
					hint: this.$t('tasks', 'Sort by last-modified date and summary.'),
				},
				{
					id: 'completedDate',
					icon: 'icon-checkmark',
					text: this.$t('tasks', 'Completed date'),
					hint: this.$t('tasks', 'Sort by completed date.'),
				},
				{
					id: 'priority',
					icon: 'icon-task-star',
					text: this.$t('tasks', 'Priority'),
					hint: this.$t('tasks', 'Sort by priority and summary.'),
				},
				{
					id: 'alphabetically',
					icon: 'icon-alphabetically',
					text: this.$t('tasks', 'Alphabetically'),
					hint: this.$t('tasks', 'Sort by summary and priority.'),
				},
				{
					id: 'manual',
					icon: 'icon-manual',
					text: this.$t('tasks', 'Manually'),
					hint: this.$t('tasks', 'Sort by manual order.'),
				},
			],
		}
	},
	computed: {
		...mapGetters({
			sortOrderGetter: 'sortOrder',
			sortDirectionGetter: 'sortDirection',
		}),

		sortOrder: {
			get() {
				return this.sortOrderGetter
			},
			set(order) {
				this.$store.dispatch('setSetting', { type: 'sortOrder', value: order })
			},
		},
		sortDirection: {
			get() {
				return this.sortDirectionGetter
			},
			set(direction) {
				this.$store.dispatch('setSetting', { type: 'sortDirection', value: +direction })
			},
		},
		sortOrderIcon() {
			for (const order of this.orders) {
				if (order.id === this.sortOrder) {
					return `${order.icon}__${this.sortDirection ? 'down' : 'up'}`
				}
			}
			return 'icon-list'
		},
	},
	methods: {
		getIcon(order) {
			if (order.id !== this.sortOrder) {
				return order.icon
			} else {
				return `${order.icon}__${this.sortDirection ? 'down' : 'up'}`
			}
		},
		setSortOrder(order) {
			// If the sort order was already set, toggle the sort direction, otherwise reset it.
			this.sortDirection = (this.sortOrder === order) ? !this.sortDirection : false
			this.sortOrder = order
		},
	},
}
</script>

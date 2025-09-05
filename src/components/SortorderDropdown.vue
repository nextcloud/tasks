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
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU AFFERO GENERAL PUBLIC LICENSE for more details.

You should have received a copy of the GNU Affero General Public
License along with this library. If not, see <http://www.gnu.org/licenses/>.

-->

<template>
	<NcActions class="sortorder reactive"
		:title="t('tasks', 'Change sort order')">
		<template #icon>
			<span class="material-design-icon">
				<component :is="sortOrderIcon" :size="20" />
				<MenuDown v-if="sortDirection"
					class="sort-direction"
					:size="18" />
				<MenuUp v-else
					class="sort-direction"
					:size="18" />
			</span>
		</template>
		<NcActionButton v-for="order in orders"
			:key="order.id"
			:title="order.hint"
			class="reactive"
			:class="{selected: sortOrder === order.id}"
			:close-after-click="true"
			@click="setSortOrder(order.id)">
			<template #icon>
				<component :is="order.icon" :size="20" />
				<MenuDown v-if="order.id == sortOrder && sortDirection"
					class="sort-direction"
					:size="18" />
				<MenuUp v-if="order.id == sortOrder && !sortDirection"
					class="sort-direction"
					:size="18" />
			</template>
			{{ order.text }}
		</NcActionButton>
	</NcActions>
</template>

<script>
import { translate as t } from '@nextcloud/l10n'
import NcActions from '@nextcloud/vue/components/NcActions'
import NcActionButton from '@nextcloud/vue/components/NcActionButton'

import AnimationOutline from 'vue-material-design-icons/AnimationOutline.vue'
import Bookmark from 'vue-material-design-icons/BookmarkOutline.vue'
import CalendarStart from 'vue-material-design-icons/CalendarStart.vue'
import CalendarEnd from 'vue-material-design-icons/CalendarEnd.vue'
import Check from 'vue-material-design-icons/Check.vue'
import MenuDown from 'vue-material-design-icons/MenuDown.vue'
import MenuUp from 'vue-material-design-icons/MenuUp.vue'
import OrderAlphabeticalAscending from 'vue-material-design-icons/OrderAlphabeticalAscending.vue'
import Pencil from 'vue-material-design-icons/PencilOutline.vue'
import Plus from 'vue-material-design-icons/Plus.vue'
import Star from 'vue-material-design-icons/Star.vue'
import TagMultiple from 'vue-material-design-icons/TagMultipleOutline.vue'

import { mapGetters } from 'vuex'

export default {
	name: 'SortorderDropdown',
	components: {
		NcActions,
		NcActionButton,
		AnimationOutline,
		Bookmark,
		CalendarStart,
		CalendarEnd,
		Check,
		MenuDown,
		MenuUp,
		OrderAlphabeticalAscending,
		Pencil,
		Plus,
		Star,
		TagMultiple,
	},
	data() {
		return {
			orders: [
				{
					id: 'default',
					icon: 'Bookmark',
					text: t('tasks', 'Relevance'),
					hint: t('tasks', 'Sort by completed state, due date, priority, start date and summary.'),
				},
				{
					id: 'start',
					icon: 'CalendarStart',
					text: t('tasks', 'Start date'),
					hint: t('tasks', 'Sort by start date, priority and summary.'),
				},
				{
					id: 'due',
					icon: 'CalendarEnd',
					text: t('tasks', 'Due date'),
					hint: t('tasks', 'Sort by due date, priority and summary.'),
				},
				{
					id: 'created',
					icon: 'Plus',
					// TRANSLATORS The date at which a task was created.
					text: t('tasks', 'Created date'),
					hint: t('tasks', 'Sort by created date, priority and summary.'),
				},
				{
					id: 'modified',
					icon: 'Pencil',
					text: t('tasks', 'Last modified'),
					hint: t('tasks', 'Sort by last-modified date, priority and summary.'),
				},
				{
					id: 'completedDate',
					icon: 'Check',
					text: t('tasks', 'Completed date'),
					hint: t('tasks', 'Sort by completed date, priority and summary.'),
				},
				{
					id: 'priority',
					icon: 'Star',
					text: t('tasks', 'Priority'),
					hint: t('tasks', 'Sort by priority and summary.'),
				},
				{
					id: 'alphabetically',
					icon: 'OrderAlphabeticalAscending',
					text: t('tasks', 'Alphabetically'),
					hint: t('tasks', 'Sort by summary and priority.'),
				},
				{
					id: 'tags',
					icon: 'TagMultiple',
					text: t('tasks', 'Tags'),
					hint: t('tasks', 'Sort by tags.'),
				},
				{
					id: 'manual',
					icon: 'AnimationOutline',
					text: t('tasks', 'Manually'),
					hint: t('tasks', 'Sort by manual order.'),
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
					return order.icon
				}
			}
			return 'Bookmark'
		},
	},
	methods: {
		t,

		setSortOrder(order) {
			// If the sort order was already set, toggle the sort direction, otherwise reset it.
			this.sortDirection = (this.sortOrder === order) ? !this.sortDirection : false
			this.sortOrder = order
		},
	},
}
</script>

<style lang="scss" scoped>
// indicate which sort order is selected
li.action.selected :deep(.action-button) {
		opacity: 1;
		// allow to absolute position the sort direction icon
		position: relative;
}
// overlay the sort direction icon with the sort order icon
.material-design-icon {
	width: 44px;
	height: 44px;

	&.sort-direction {
		position: absolute;
		top: 0;
		justify-content: right;
	}
}
</style>

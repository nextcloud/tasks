<!--
Nextcloud - Tasks

@author Raimund Schlüßler
@copyright 2021 Raimund Schlüßler <raimund.schluessler@mailbox.org>
@copyright 2018 Vadim Nicolai <contact@vadimnicolai.com>

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
	<div>
		<HeaderBar />
		<div class="task-list">
			<div v-for="calendar in filteredCalendars"
				:key="calendar.id"
				:rel="calendar.id"
				class="grouped-tasks ui-droppable">
				<h2 class="heading">
					<span class="heading__icon-bullet" :style="{'background-color': calendar.color }" />
					<span class="heading__name">{{ calendar.displayName }}</span>
				</h2>
				<TaskDragContainer :tasks="calendar.filteredTasks"
					:disabled="calendar.readOnly"
					:collection-string="collectionId"
					:calendar-id="calendar.id"
					:collection-id="collectionId" />
				<LoadCompletedButton v-if="collectionId === 'completed'" :calendars="[calendar]" />
			</div>
		</div>
		<LoadCompletedButton v-if="collectionId === 'completed'" :calendars="calendars" />
	</div>
</template>

<script>
import HeaderBar from '../../components/HeaderBar.vue'
import LoadCompletedButton from '../../components/LoadCompletedButton.vue'
import TaskDragContainer from '../../components/TaskDragContainer.vue'
import { isTaskInList, isParentInList } from '../../store/storeHelper.js'
import './task-list.scss'

import { mapGetters } from 'vuex'

export default {
	components: {
		HeaderBar,
		LoadCompletedButton,
		TaskDragContainer,
	},
	computed: {

		/**
		 * Returns the calendars which are to be shown for the current collection and
		 * adds a filteredTasks property to each calendar containing the tasks belonging to the collection.
		 *
		 * Calendars have to contain at least one task which
		 * - belongs to the collection
		 * - is a root task
		 * - is uncompleted
		 *
		 * @return {Array} the calendars which should be shown in the collection
		 */
		filteredCalendars() {
			const filteredCalendars = []
			this.calendars.forEach(calendar => {
				calendar.filteredTasks = Object.values(calendar.tasks).filter(task => {
					return isTaskInList(task, this.collectionId) && (!task.related || !isParentInList(task, calendar.tasks))
				})
				if (calendar.filteredTasks.length) {
					filteredCalendars.push(calendar)
				}
			})
			return filteredCalendars
		},

		collectionId() {
			return this.$route.params.collectionId
		},
		...mapGetters({
			calendars: 'getSortedCalendars',
		}),
	},
}
</script>

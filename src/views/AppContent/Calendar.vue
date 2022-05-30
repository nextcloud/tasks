<!--
Nextcloud - Tasks

@author Raimund Schlüßler
@copyright 2021 Raimund Schlüßler <raimund.schluessler@mailbox.org>
@copyright 2018 Vadim Nicolai <contact@vadimnicolai.com>
@copyright 2021 cnmicha <cnmicha@bhb-networks.com>

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
	<div v-if="calendar">
		<Header />
		<div class="task-list">
			<div class="grouped-tasks">
				<TaskDragContainer :tasks="openRootTasks(calendar.tasks)"
					:calendar-id="calendarId"
					:disabled="calendar.readOnly"
					collection-id="uncompleted" />
				<h2 v-show="closedCount(calendarId)" class="heading heading--hiddentasks reactive" @click="toggleHidden">
					<span class="heading__title icon-triangle-s">{{ closedCountString }}</span>
				</h2>
				<TaskDragContainer v-if="showHidden"
					:tasks="closedRootTasks(calendar.tasks)"
					:calendar-id="calendarId"
					:disabled="calendar.readOnly"
					class="completed"
					collection-id="completed" />
				<LoadCompletedButton :calendar="calendar" />
				<DeleteCompletedModal v-if="calendar.loadedCompleted && !calendar.readOnly" :calendar="calendar" />
			</div>
		</div>
	</div>
</template>

<script>
import Header from '../../components/Header.vue'
import DeleteCompletedModal from '../../components/DeleteCompletedModal.vue'
import LoadCompletedButton from '../../components/LoadCompletedButton.vue'
import TaskDragContainer from '../../components/TaskDragContainer.vue'
import './task-list.scss'

import { translatePlural as n } from '@nextcloud/l10n'

import { mapGetters } from 'vuex'

export default {
	components: {
		Header,
		LoadCompletedButton,
		TaskDragContainer,
		DeleteCompletedModal,
	},
	props: {
		calendarId: {
			type: String,
			default: '',
		},
		taskId: {
			type: String,
			default: '',
		},
	},
	computed: {
		showHidden: {
			get() {
				return this.$store.state.settings.settings.showHidden
			},
			set(value) {
				this.$store.dispatch('setSetting', { type: 'showHidden', value })
			},
		},
		/**
		 * Returns the string for closed tasks
		 *
		 * @return {string} The string to show for the completed tasks count
		 */
		closedCountString() {
			return n('tasks', '%n Completed Task', '%n Completed Tasks', this.closedCount(this.calendarId))
		},
		...mapGetters({
			closedCount: 'getCalendarCountClosed',
			calendar: 'getCalendarByRoute',
			openRootTasks: 'findOpenRootTasks',
			closedRootTasks: 'findClosedRootTasks',
		}),
	},
	methods: {
		toggleHidden() {
			this.showHidden = +!this.showHidden
		},
	},
}
</script>

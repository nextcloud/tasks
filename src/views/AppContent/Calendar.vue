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
		<HeaderBar />
		<div class="task-list">
			<div class="grouped-tasks">
				<TaskDragContainer :tasks="openRootTasks(calendar.tasks)"
					:calendar-id="calendarId"
					:disabled="calendar.readOnly"
					collection-id="uncompleted" />
				<NcButton v-if="closedCount(calendarId)"
					alignment="center-reverse"
					type="tertiary"
					class="reactive heading"
					@click="toggleHidden">
					<template #icon>
						<ChevronUp v-if="showHidden" />
						<ChevronDown v-else />
					</template>
					{{ closedCountString }}
				</NcButton>
				<TaskDragContainer v-if="showHidden"
					:tasks="closedRootTasks(calendar.tasks)"
					:calendar-id="calendarId"
					:disabled="calendar.readOnly"
					class="completed"
					collection-id="completed" />
				<LoadCompletedButton :calendars="[calendar]" />
				<DeleteCompletedModal v-if="calendar.loadedCompleted && !calendar.readOnly" :calendar="calendar" />
			</div>
		</div>
	</div>
</template>

<script>
import HeaderBar from '../../components/HeaderBar.vue'
import DeleteCompletedModal from '../../components/DeleteCompletedModal.vue'
import LoadCompletedButton from '../../components/LoadCompletedButton.vue'
import TaskDragContainer from '../../components/TaskDragContainer.vue'
import './task-list.scss'

import NcButton from '@nextcloud/vue/dist/Components/NcButton.js'

import ChevronDown from 'vue-material-design-icons/ChevronDown.vue'
import ChevronUp from 'vue-material-design-icons/ChevronUp.vue'

import { translatePlural as n } from '@nextcloud/l10n'

import { mapGetters } from 'vuex'

export default {
	components: {
		HeaderBar,
		LoadCompletedButton,
		TaskDragContainer,
		DeleteCompletedModal,
		NcButton,
		ChevronDown,
		ChevronUp,
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
		calendar() {
			return this.getCalendarByRoute(this.$route)
		},
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
			getCalendarByRoute: 'getCalendarByRoute',
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

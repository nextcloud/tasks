<!--
Nextcloud - Tasks

@author Julius Härtl
@copyright 2021 Julius Härtl <jus@bitgrid.net>

@author Jakob Röhrl
@copyright 2021 Jakob Röhrl <jakob.roehrl@web.de>

@author Raimund Schlüßler
@copyright 2021 Raimund Schlüßler <raimund.schluessler@mailbox.org>

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
	<Modal class="task-selector" @close="close">
		<div class="modal-scroller">
			<div v-if="!creating && !created" id="modal-inner" :class="{ 'icon-loading': loading }">
				<h3>{{ t('tasks', 'Create a new task') }}</h3>

				<CalendarPickerItem
					:disabled="loading"
					:calendar="pendingCalendar"
					:calendars="writableCalendars"
					@changeCalendar="changeCalendar" />

				<input v-model="pendingTitle"
					type="text"
					:placeholder="t('tasks', 'Create a new task')"
					:disabled="loading">

				<textarea v-model="pendingDescription"
					:disabled="loading" />
				<div class="modal-buttons">
					<button @click="close">
						{{ t('tasks', 'Cancel') }}
					</button>
					<button :disabled="loading"
						class="primary"
						@click="addTask">
						{{ t('tasks', 'Create task') }}
					</button>
				</div>
			</div>
			<div v-else id="modal-inner">
				<EmptyContent v-if="creating" icon="icon-loading">
					{{ t('tasks', 'Creating the new task…') }}
				</EmptyContent>
				<EmptyContent v-else-if="created" icon="icon-checkmark">
					{{ t('tasks', '"{task}" was added to "{calendar}"', { task: pendingTitle, calendar: pendingCalendar.displayName }, undefined, { sanitize: false, escape: false }) }}
					<template #desc>
						<button class="primary" @click="openNewTask">
							{{ t('tasks', 'Open task') }}
						</button>
						<button @click="close">
							{{ t('tasks', 'Close') }}
						</button>
					</template>
				</EmptyContent>
			</div>
		</div>
	</Modal>
</template>

<script>

import CalendarPickerItem from './AppSidebar/CalendarPickerItem.vue'
import client from '../services/cdav.js'

import { translate as t } from '@nextcloud/l10n'
import { generateUrl } from '@nextcloud/router'
import EmptyContent from '@nextcloud/vue/dist/Components/EmptyContent'
import Modal from '@nextcloud/vue/dist/Components/Modal'

import { mapGetters, mapActions } from 'vuex'

export default {
	name: 'TaskCreateDialog',
	components: {
		CalendarPickerItem,
		EmptyContent,
		Modal,
	},
	props: {
		title: {
			type: String,
			default: '',
		},
		description: {
			type: String,
			default: '',
		},
	},
	data() {
		return {
			pendingTitle: '',
			pendingDescription: '',
			pendingCalendar: null,
			loading: true,
			creating: false,
			created: false,
			newTask: null,
		}
	},

	computed: {
		...mapGetters({
			writableCalendars: 'getSortedWritableCalendars',
			defaultCalendar: 'getDefaultCalendar',
		}),
	},

	beforeMount() {
		this.fetchCalendars()
	},

	mounted() {
		this.pendingTitle = this.title
		this.pendingDescription = this.description
	},

	methods: {
		...mapActions([
			'createTask',
		]),

		t,

		changeCalendar(calendar) {
			this.pendingCalendar = calendar
		},

		close() {
			this.$root.$emit('close')
		},

		async fetchCalendars() {
			this.loading = true
			await client.connect({ enableCalDAV: true })
			await this.$store.dispatch('fetchCurrentUserPrincipal')
			await this.$store.dispatch('getCalendarsAndTrashBin')
			// TODO: Would be good to select the default calendar instead of the first one
			this.pendingCalendar = this.writableCalendars[0]
			this.loading = false
		},

		async addTask() {
			this.creating = true
			const task = {
				summary: this.pendingTitle,
				note: this.pendingDescription,
				calendar: this.pendingCalendar,
			}
			this.newTask = await this.createTask(task)
			this.creating = false
			this.created = true
		},
		openNewTask() {
			window.location = generateUrl('apps/tasks') + `/#/calendars/${this.pendingCalendar.id}/tasks/${this.newTask.uri}`
		},
	},

}
</script>

<style lang="scss" scoped>
	.modal-scroller {
		overflow: scroll;
		max-height: calc(80vh - 40px);
		margin: 10px;
	}

	#modal-inner {
		width: 90vw;
		max-width: 400px;
		padding: 10px;
		min-height: 200px;
	}

	input, textarea {
		width: 100%;
		margin-bottom: 10px !important;
	}

	.modal-buttons {
		display: flex;
		justify-content: flex-end;
	}

	.task-selector::v-deep .modal-container {
		overflow: visible !important;
	}
</style>
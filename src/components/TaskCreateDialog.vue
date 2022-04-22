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
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU AFFERO GENERAL PUBLIC LICENSE for more details.

You should have received a copy of the GNU Affero General Public
License along with this library. If not, see <http://www.gnu.org/licenses/>.

-->

<template>
	<Modal class="task-selector" size="small" @close="close">
		<div v-if="!creating && !created" id="modal-inner" :class="{ 'icon-loading': loading }">
			<h3>{{ t('tasks', 'Create a new task') }}</h3>

			<CalendarPickerItem :disabled="loading"
				:calendar="pendingCalendar"
				:calendars="writableCalendars"
				@change-calendar="changeCalendar" />

			<div class="property property__summary">
				<ViewHeadline :size="20" />
				<input v-model="pendingTitle"
					type="text"
					:placeholder="t('tasks', 'Task summary')"
					:disabled="loading">
			</div>

			<div class="property property__notes">
				<TextBoxOutline :size="20" />
				<textarea v-model="pendingDescription"
					:disabled="loading" />
			</div>
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
	</Modal>
</template>

<script>

import CalendarPickerItem from './AppSidebar/CalendarPickerItem.vue'
import client from '../services/cdav.js'

import { translate as t } from '@nextcloud/l10n'
import { generateUrl } from '@nextcloud/router'
import EmptyContent from '@nextcloud/vue/dist/Components/EmptyContent'
import Modal from '@nextcloud/vue/dist/Components/Modal'

import TextBoxOutline from 'vue-material-design-icons/TextBoxOutline'
import ViewHeadline from 'vue-material-design-icons/ViewHeadline'

import { mapGetters, mapActions } from 'vuex'

export default {
	name: 'TaskCreateDialog',
	components: {
		CalendarPickerItem,
		EmptyContent,
		Modal,
		TextBoxOutline,
		ViewHeadline,
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
			this.$emit('close')
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

	#modal-inner {
		display: flex;
		flex-direction: column;
		padding: 20px;
	}

	.property__item {
		border-bottom: none;
		margin-bottom: 3px;

		&::v-deep .multiselect {
			border: 1px solid var(--color-border-dark);
			border-radius: var(--border-radius);
		}
	}

	.property {
		position: relative;

		.material-design-icon {
			position: absolute;
			top: 12px;
			left: 12px;
		}

		input,
		textarea {
			width: 100%;
			font-size: var(--default-font-size);
			padding-left: 44px;
		}

		input {
			height: 44px !important;
			margin: 0;
		}

		textarea {
			min-width: 100%;
			max-width: 100%;
			min-height: 100px;
		}
	}

	.modal-buttons {
		display: flex;
		justify-content: flex-end;
	}

	::v-deep {
		.calendar-picker-option__label,
		.property__item .multiselect__tags input.multiselect__input {
			font-weight: normal;
		}
	}
</style>

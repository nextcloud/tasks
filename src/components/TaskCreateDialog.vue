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
	<NcModal class="task-selector" size="small" @close="close">
		<div v-if="!creating && !created" id="modal-inner">
			<div v-if="loading" class="loading-overlay">
				<NcLoadingIcon :size="40" />
			</div>
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
				<NcButton @click="close">
					{{ t('tasks', 'Cancel') }}
				</NcButton>
				<NcButton :disabled="loading"
					type="primary"
					@click="addTask">
					{{ t('tasks', 'Create task') }}
				</NcButton>
			</div>
		</div>
		<div v-else id="modal-inner">
			<NcEmptyContent v-if="creating" key="creating">
				{{ t('tasks', 'Creating the new task…') }}
				<template #icon>
					<NcLoadingIcon />
				</template>
			</NcEmptyContent>
			<NcEmptyContent v-else-if="created" key="created">
				{{ t('tasks', '"{task}" was added to "{calendar}"', { task: pendingTitle, calendar: pendingCalendar.displayName }, undefined, { sanitize: false, escape: false }) }}
				<template #icon>
					<Check />
				</template>
				<template #desc>
&nbsp;
					<NcButton @click="close">
						{{ t('tasks', 'Close') }}
					</NcButton>
					<NcButton type="primary" @click="openNewTask">
						{{ t('tasks', 'Open task') }}
					</NcButton>
				</template>
			</NcEmptyContent>
		</div>
	</NcModal>
</template>

<script>

import CalendarPickerItem from './AppSidebar/CalendarPickerItem.vue'
import client from '../services/cdav.js'

import { translate as t } from '@nextcloud/l10n'
import { generateUrl } from '@nextcloud/router'
import NcButton from '@nextcloud/vue/dist/Components/NcButton.js'
import NcEmptyContent from '@nextcloud/vue/dist/Components/NcEmptyContent.js'
import NcLoadingIcon from '@nextcloud/vue/dist/Components/NcLoadingIcon.js'
import NcModal from '@nextcloud/vue/dist/Components/NcModal.js'

import Check from 'vue-material-design-icons/Check.vue'
import TextBoxOutline from 'vue-material-design-icons/TextBoxOutline.vue'
import ViewHeadline from 'vue-material-design-icons/ViewHeadline.vue'

import { mapGetters, mapActions } from 'vuex'

export default {
	name: 'TaskCreateDialog',
	components: {
		CalendarPickerItem,
		Check,
		NcButton,
		NcEmptyContent,
		NcLoadingIcon,
		NcModal,
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

		.loading-overlay {
			position: absolute;
			top: calc(50% - 20px);
			left: calc(50% - 20px);
			z-index: 1000;
		}

		.empty-content {
			margin: 10vh 0;

			::v-deep p {
				display: flex;
				justify-content: flex-end;
			}
		}
	}

	.property__item {
		border-bottom: none;
		margin-bottom: 3px;

		:deep(.multiselect) {
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

	:deep(.calendar-picker-option__label),
	:deep(.property__item .multiselect__tags) input.multiselect__input {
			font-weight: normal;
	}
</style>

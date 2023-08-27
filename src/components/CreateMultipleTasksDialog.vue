<!--
Nextcloud - Tasks

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
	<NcModal class="task-selector" size="small" @close="() => {created ? cancel() : close()}">
		<div v-if="!creating && !created" id="modal-inner">
			<h3>{{ t('tasks', 'Create new tasks') }}</h3>

			<p>{{ t('tasks', 'Create {numberOfTasks} tasks from pasted text', { numberOfTasks: tasksToCreate.numberOfTasks }) }}</p>

			<!-- Need to prevent keydown and keyup of first button.
				The issue is that the first button will have focus and enter will trigger the button with keydown.
				The input fields in HeaderBar and TaskBody which will get focus after closing the modal react on keyup.
				Therefore an empty task would be created.
			-->
			<div class="modal-buttons">
				<NcButton @click="cancel"
					@keydown.prevent
					@keyup.prevent>
					{{ t('tasks', 'Cancel') }}
				</NcButton>
				<NcButton type="primary"
					@click="addTasks">
					{{ t('tasks', 'Create tasks') }}
				</NcButton>
			</div>
		</div>
		<div v-else id="modal-inner">
			<NcEmptyContent v-if="creating" key="creating" :description="t('tasks', 'Creating new tasks…')">
				<template #icon>
					<NcLoadingIcon />
				</template>
			</NcEmptyContent>
			<NcEmptyContent v-else-if="created" key="created" :description="createdMessage">
				<template #icon>
					<Check />
				</template>
				<template #action>
					<NcButton @click="close">
						{{ t('tasks', 'Close') }}
					</NcButton>
				</template>
			</NcEmptyContent>
		</div>
	</NcModal>
</template>

<script>

import { translate as t } from '@nextcloud/l10n'
import NcButton from '@nextcloud/vue/dist/Components/NcButton.js'
import NcEmptyContent from '@nextcloud/vue/dist/Components/NcEmptyContent.js'
import NcLoadingIcon from '@nextcloud/vue/dist/Components/NcLoadingIcon.js'
import NcModal from '@nextcloud/vue/dist/Components/NcModal.js'

import Check from 'vue-material-design-icons/Check.vue'

import { mapActions } from 'vuex'

export default {
	name: 'CreateMultipleTasksDialog',
	components: {
		Check,
		NcButton,
		NcEmptyContent,
		NcLoadingIcon,
		NcModal,
	},
	props: {
		calendar: {
			type: Object,
			required: true,
		},
		tasksToCreate: {
			type: Object,
			required: true,
		},
		tasksAdditionalProperties: {
			type: Object,
			default() {
				return {}
			},
		},
		rootTask: {
			type: Object,
			default: undefined,
		},
	},
	emits: ['cancel', 'close'],
	data() {
		return {
			creating: false,
			created: false,
		}
	},

	computed: {
		createdMessage() {
			return t('tasks', '{numberOfTasks} tasks have been added to "{calendar}"', { numberOfTasks: this.tasksToCreate.numberOfTasks, calendar: this.calendar.displayName }, undefined, { sanitize: false, escape: false })
		},
	},

	methods: {
		...mapActions([
			'createTask',
		]),

		t,

		cancel() {
			this.$emit('cancel')
			this.$root.$emit('close')
		},

		close() {
			this.$emit('close')
			this.$root.$emit('close')
		},

		async addTasks() {
			this.creating = true
			await Promise.all(this.tasksToCreate.tasks.map(task => this.addTaskWithParent(task, this.rootTask?.uid)))
			this.creating = false
			this.created = true
		},

		async addTaskWithParent(task, parentUid) {
			const newParent = await this.createTask({
				summary: task.summary,
				calendar: this.calendar,
				related: parentUid,
				...this.tasksAdditionalProperties,
			})
			await Promise.all(task.children.map(child => this.addTaskWithParent(child, newParent?.uid)))
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

			:deep(.empty-content__action) {
				display: flex;
			}
		}
	}

	.property__item {
		border-bottom: none;
		margin-bottom: 3px;

		:deep(.multiselect .multiselect__tags) {
			border: 2px solid var(--color-border-dark);
		}
	}

	.property {
		position: relative;

		.material-design-icon {
			position: absolute;
			top: 14px;
			left: 14px;
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

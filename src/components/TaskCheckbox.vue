<!--
Nextcloud - Tasks

@author Raimund Schlüßler
@copyright 2022 Raimund Schlüßler <raimund.schluessler@mailbox.org>

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
	<div class="task-checkbox">
		<input :id="checkboxId"
			type="checkbox"
			:class="{'disabled': readOnly}"
			:checked="completed"
			:aria-checked="completed"
			:disabled="readOnly"
			:aria-label="ariaLabel"
			@click="toggleCompleted()">
		<label :class="[priorityClass]" :for="checkboxId">
			<CheckboxBlankOffOutline v-if="cancelled && !completed" :size="22" />
			<CheckboxOutline v-else-if="completed" :size="22" />
			<CheckboxBlank v-else-if="readOnly" :size="22" />
			<Repeat v-else-if="recurring" :size="22" />
			<CheckboxBlankOutline v-else :size="22" />
		</label>
	</div>
</template>

<script>
import { translate as t } from '@nextcloud/l10n'

import CheckboxBlank from 'vue-material-design-icons/CheckboxBlank.vue'
import CheckboxBlankOffOutline from 'vue-material-design-icons/CheckboxBlankOffOutline.vue'
import CheckboxBlankOutline from 'vue-material-design-icons/CheckboxBlankOutline.vue'
import CheckboxOutline from 'vue-material-design-icons/CheckboxOutline.vue'
import Repeat from 'vue-material-design-icons/Repeat.vue'

export default {
	components: {
		CheckboxBlank,
		CheckboxBlankOffOutline,
		CheckboxBlankOutline,
		CheckboxOutline,
		Repeat,
	},
	props: {
		completed: {
			type: Boolean,
			required: true,
		},
		cancelled: {
			type: Boolean,
			required: true,
		},
		readOnly: {
			type: Boolean,
			required: true,
		},
		recurring: {
			type: Boolean,
			required: true
		},
		priorityClass: {
			type: String,
			default: '',
		},
	},
	emits: ['toggle-completed'],
	computed: {
		ariaLabel() {
			if (this.cancelled && !this.completed) {
				return t('tasks', 'Task is cancelled')
			} else if (this.completed) {
				return t('tasks', 'Task is completed')
			} else if (this.readOnly) {
				return t('tasks', 'Task is read-only')
			}
			return t('tasks', 'Task is not completed')
		},
		/**
		 * The unique id of the checkbox.
		 */
		checkboxId() {
			return 'checkbox-' + Math.random()
				.toString(36)
				.replace(/[^a-z]+/g, '')
				.slice(0, 6)
		},
	},
	methods: {
		t,

		toggleCompleted() {
			this.$emit('toggle-completed')
		},
	},
}
</script>

<style lang="scss" scoped>
$red_overdue: #b3312d; // overdue dates and high importance
$yellow: #fd0; // medium importance
$blue_due: #4271a6; // due dates and low importance

.task-checkbox {
	display: flex;
	height: 44px;
	width: 44px;
	justify-content: center;
	flex-shrink: 0;

	input[type='checkbox'] {
		position: absolute;
		left: -100000px;
		overflow: hidden;

		&:disabled + label,
		&:disabled + label .material-design-icon {
			cursor: default;
		}

		+ label {
			display: flex;
			align-items: center;
			height: 44px;
			width: 44px;
			padding: 11px;

			.material-design-icon {
				cursor: pointer;
				height: 22px;
				width: 22px;
			}

			&:hover {
				border-color: var(--color-border-dark);
			}

			&.priority {
				&--high {
					color: $red_overdue;
				}

				&--medium {
					color: $yellow;
				}

				&--low {
					color: $blue_due;
				}
			}
		}
	}
}
</style>

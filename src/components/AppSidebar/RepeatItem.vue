<!--
Nextcloud - Tasks

@author Sunik Kupfer
@copyright 2023 Sunik Kupfer <mail@sunik.de>
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
	<div v-click-outside="() => setValue()"
		:class="{
			'property__item--clearable': isRecurring && !readOnly,
			'property__item--readonly': readOnly
		}"
		class="property__item">
		<div class="item__content" @click="setEditing(true)">
			<div class="content__icon">
				<component :is="icon" :size="20" />
			</div>
			<span v-show="!editing" class="content__name">
				<RepeatSummary class="property-repeat__summary__content"
					:recurrence-rule="value" />
			</span>
			<div v-if="editing" class="content__input">
				<RepeatFreqInterval v-if="!readOnly && !disabled"
					v-model:frequency="frequency"
					v-model:interval="interval"
					@change-frequency="changeFrequency"
					@change-interval="changeInterval" />
			</div>
		</div>
		<div class="item__actions">
			<NcActions v-show="editing" class="actions__set">
				<NcActionButton @click="setValue()">
					<template #icon>
						<Check :size="20" />
					</template>
					{{ t('tasks', 'Set value') }}
				</NcActionButton>
			</NcActions>
			<NcActions v-show="editing" class="actions__clear">
				<NcActionButton @click="clearValue">
					<template #icon>
						<Delete :size="20" />
					</template>
					{{ t('tasks', 'Delete value') }}
				</NcActionButton>
			</NcActions>
		</div>
	</div>
</template>

<script>

import { translate as t } from '@nextcloud/l10n'
import RepeatSummary from './RepeatItem/RepeatSummary.vue'
import RepeatFreqInterval from './RepeatItem/RepeatFreqInterval.vue'
import Pencil from 'vue-material-design-icons/Pencil.vue'
import Check from 'vue-material-design-icons/Check.vue'
import { NcActions as Actions, NcActionButton as ActionButton } from '@nextcloud/vue'
import editableItem from '../../mixins/editableItem.js'
import logger from '../../utils/logger.js'

export default {
	name: 'RepeatItem',
	components: {
		RepeatSummary,
		RepeatFreqInterval,
		Actions,
		ActionButton,
		Pencil,
		Check,
	},
	mixins: [editableItem],
	props: {
		/**
		 * The Recurrence object
		 */
		value: {
			type: Object,
			required: true,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		readOnly: {
			type: Boolean,
			required: true,
		},
		placeholder: {
			type: String,
			default: '',
		},
		icon: {
			type: String,
			default: null,
		},
	},
	data() {
		return {
			frequency: this.value.frequency,
			interval: this.value.interval,
		}
	},
	methods: {
		t,
		isRecurring() {
			return this.value.frequency !== 'NONE'
		},
		changeFrequency(value) {
			this.frequency = value
			// TODO: There should be a better way than using structuredClone
			this.newValue = structuredClone(this.value)
			this.newValue.frequency = value
		},
		changeInterval(value) {
			logger.info('change Interval to ' + value)
			this.interval = value
			this.newValue = structuredClone(this.value)
			this.newValue.interval = value
		},
	},
}
</script>

<style lang="scss" scoped>
.property__item {
	border-bottom: 1px solid var(--color-border);
	padding: 0;
	position: relative;
	margin-bottom: 0;
	width: 100%;
	color: var(--color-text-lighter);
	display: flex;

	& * {
		cursor: pointer;
	}

	.item {
		&__content {
			display: flex;
			line-height: 44px;
			min-width: 0;
			flex-grow: 1;

			.content {
				&__icon {
					display: flex;
					height: 44px;
					width: 44px;
					min-width: 44px;
					justify-content: center;

					.material-design-icon__svg {
						vertical-align: middle;
					}
				}

				&__name {
					font-weight: bold;
					flex-grow: 1;
					padding-right: 14px;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}

				&__input {
					display: flex;
					flex-grow: 1;
					flex-wrap: wrap;
					align-content: center;

					input[type='number'] {
						width: 50px;
						flex-basis: 50px;
						flex-shrink: 0;
						background: none repeat scroll 0 0 var(--color-background-dark);
						margin: 0;
						min-height: 0;
					}

					input[type='range'] {
						flex-grow: 1;
						flex-shrink: 1;
						min-width: 100px;
						flex-basis: 100px;
						border: medium none;
						box-shadow: none;
						margin-left: 5px;
					}
				}
			}
		}

		&__actions {
			display: flex;
			flex-wrap: nowrap;
		}
	}

	&--readonly * {
		cursor: default;
	}

	&--clearable:hover .actions__clear {
		display: inline-block !important;
	}
}
</style>

<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="repeat-option-set repeat-option-set--end">
		<span class="repeat-option-end__label">{{ t('tasks', 'End repeat') }}</span>
		<NcSelect class="repeat-option-end__end-type-select"
			:options="options"
			:searchable="false"
			:name="t('tasks', 'Select to end repeat')"
			:model-value="selectedOption"
			:clearable="false"
			input-id="value"
			label="label"
			@update:model-value="changeEndType" />
		<NcDateTimePicker v-if="isUntil"
			class="repeat-option-end__until"
			:value="until"
			:append-to-body="true"
			type="date"
			@input="changeUntil" />
		<div v-if="isCount" class="repeat-option-end__count-container">
			<input class="repeat-option-end__count-input"
				type="number"
				min="1"
				max="3500"
				:value="count"
				@input="changeCount">
			<span class="repeat-option-end__count-label">
				{{ occurrencesLabel }}
			</span>
		</div>
	</div>
</template>

<script>
import { NcSelect, NcDateTimePicker } from '@nextcloud/vue'
import { translate as t, translatePlural as n } from '@nextcloud/l10n'

export default {
	name: 'RepeatEndRepeat',
	components: {
		NcDateTimePicker,
		NcSelect,
	},

	props: {
		/**
		 * The calendar-object instance
		 */
		calendarObjectInstance: {
			type: Object,
			required: true,
		},

		count: {
			type: Number,
			default: null,
		},

		until: {
			type: Date,
			default: null,
		},
	},

	emits: ['changeToUntil', 'changeToCount', 'setInfinite', 'setUntil', 'setCount'],

	computed: {
		/**
		 * The minimum date the user can select in the until date-picker
		 *
		 * @return {Date}
		 */
		minimumDate() {
			return this.calendarObjectInstance.startDate
		},

		/**
		 * Whether or not this event is recurring until a given date
		 *
		 * @return {boolean}
		 */
		isUntil() {
			return this.count === null && this.until !== null
		},

		/**
		 * Whether or not this event is recurring after a given amount of occurrences
		 *
		 * @return {boolean}
		 */
		isCount() {
			return this.count !== null && this.until === null
		},

		/**
		 * Label for time/times
		 *
		 * @return {string}
		 */
		occurrencesLabel() {
			return n('tasks', 'time', 'times', this.count)
		},

		/**
		 * Options for recurrence-end
		 *
		 * @return {object[]}
		 */
		options() {
			return [{
				label: t('tasks', 'never'),
				value: 'never',
			}, {
				label: t('tasks', 'on date'),
				value: 'until',
			}, {
				label: t('tasks', 'after'),
				value: 'count',
			}]
		},

		/**
		 * The selected option for the recurrence-end
		 *
		 * @return {object}
		 */
		selectedOption() {
			if (this.count !== null) {
				return this.options.find((option) => option.value === 'count')
			} else if (this.until !== null) {
				return this.options.find((option) => option.value === 'until')
			} else {
				return this.options.find((option) => option.value === 'never')
			}
		},
	},

	methods: {
		t,
		n,

		/**
		 * Changes the type of recurrence-end
		 * Whether it ends never, on a given date or after an amount of occurrences
		 *
		 * @param {object} value The new type of recurrence-end to select
		 */
		changeEndType(value) {
			console.debug(value)
			if (!value) {
				return
			}

			switch (value.value) {
			case 'until':
				this.$emit('changeToUntil')
				break

			case 'count':
				this.$emit('changeToCount')
				break

			case 'never':
			default:
				this.$emit('setInfinite')
			}
		},

		/**
		 * Changes the until-date of this recurrence-set
		 *
		 * @param {Date} date The new date to set as end
		 */
		changeUntil(date) {
			this.$emit('setUntil', date)
		},

		/**
		 * Changes the number of occurrences in this recurrence-set
		 *
		 * @param {Event} event The input event
		 */
		changeCount(event) {
			const minimumValue = parseInt(event.target.min, 10)
			const maximumValue = parseInt(event.target.max, 10)
			const selectedValue = parseInt(event.target.value, 10)

			if (selectedValue >= minimumValue && selectedValue <= maximumValue) {
				this.$emit('setCount', selectedValue)
			}
		},
	},
}
</script>

<style lang="scss" scoped>
.repeat-option-set--end {
	display: flex;
	flex-direction: column;
	gap: var(--default-grid-baseline, 4px);
}

.repeat-option-end__label {
	font-weight: bold;
	margin-bottom: var(--default-grid-baseline, 4px);
}

.repeat-option-end__count-container {
	display: flex;
	align-items: center;
	gap: 8px;
}

.repeat-option-end__count-input {
	width: 80px;
}
</style>

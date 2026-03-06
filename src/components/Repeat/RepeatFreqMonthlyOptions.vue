<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="repeat-option-set repeat-option-set--monthly">
		<div class="repeat-option-set-section">
			<NcCheckboxRadioSwitch class="repeat-option-set-section__title"
				type="radio"
				:name="radioInputId"
				:model-value="byMonthDayEnabled"
				@update:model-value="enableByMonthDay">
				{{ t('tasks', 'By day of the month') }}
			</NcCheckboxRadioSwitch>
			<div class="repeat-option-set-section__grid">
				<NcButton v-for="option in byMonthDayOptions"
					:key="option.value"
					class="repeat-option-set-section-grid-item"
					:variant="option.selected ? 'primary' : 'secondary'"
					:disabled="!byMonthDayEnabled"
					@click="toggleByMonthDay(option.value)">
					{{ option.label }}
				</NcButton>
			</div>
		</div>
		<div class="repeat-option-set-section repeat-option-set-section--on-the-select">
			<NcCheckboxRadioSwitch class="repeat-option-set-section__title"
				type="radio"
				:name="radioInputId"
				:model-value="!byMonthDayEnabled"
				@update:model-value="enableBySetPosition">
				{{ t('tasks', 'On the') }}
			</NcCheckboxRadioSwitch>
			<RepeatFirstLastSelect :by-set-position="bySetPosition"
				:disabled="byMonthDayEnabled"
				@change="changeBySetPosition" />
			<RepeatOnTheSelect :by-day="byDay"
				:disabled="byMonthDayEnabled"
				@change="changeByDay" />
		</div>
	</div>
</template>

<script>
import {
	NcButton,
	NcCheckboxRadioSwitch,
} from '@nextcloud/vue'
import { translate as t } from '@nextcloud/l10n'
import RepeatFirstLastSelect from './RepeatFirstLastSelect.vue'
import RepeatOnTheSelect from './RepeatOnTheSelect.vue'

export default {
	name: 'RepeatFreqMonthlyOptions',
	components: {
		NcButton,
		NcCheckboxRadioSwitch,
		RepeatOnTheSelect,
		RepeatFirstLastSelect,
	},

	props: {
		/**
		 *
		 */
		byDay: {
			type: Array,
			required: true,
		},

		/**
		 *
		 */
		byMonthDay: {
			type: Array,
			required: true,
		},

		/**
		 *
		 */
		bySetPosition: {
			type: Number,
			default: null,
		},
	},

	emits: [
		'addByMonthDay',
		'removeByMonthDay',
		'changeToByMonthDay',
		'changeToBySetPosition',
		'changeByDay',
		'changeBySetPosition',
	],

	computed: {
		/**
		 * @return {object[]}
		 */
		byMonthDayOptions() {
			const options = []

			for (let i = 1; i <= 31; i++) {
				options.push({
					label: i,
					value: i,
					selected: this.byMonthDay.indexOf(i) !== -1,
				})
			}

			return options
		},

		/**
		 * @return {boolean}
		 */
		byMonthDayEnabled() {
			return this.byMonthDay.length > 0
		},

		/**
		 * @return {string}
		 */
		radioInputId() {
			return this._uid + '-radio-select'
		},
	},

	methods: {
		t,

		/**
		 *
		 * @param {string} byMonthDay The month-day to toggle
		 */
		toggleByMonthDay(byMonthDay) {
			if (this.byMonthDay.indexOf(byMonthDay) === -1) {
				this.$emit('addByMonthDay', byMonthDay)
			} else {
				if (this.byMonthDay.length > 1) {
					this.$emit('removeByMonthDay', byMonthDay)
				}
			}
		},

		enableByMonthDay() {
			if (this.byMonthDayEnabled) {
				return
			}

			this.$emit('changeToByMonthDay')
		},

		enableBySetPosition() {
			if (!this.byMonthDayEnabled) {
				return
			}

			this.$emit('changeToBySetPosition')
		},

		changeByDay(value) {
			this.$emit('changeByDay', value)
		},

		changeBySetPosition(value) {
			this.$emit('changeBySetPosition', value)
		},
	},
}
</script>

<style lang="scss" scoped>
.repeat-option-set--monthly {
	display: flex;
	flex-direction: column;
	gap: calc(var(--default-grid-baseline) * 2);
	width: 100%;
}

.repeat-option-set-section {
	display: flex;
	flex-direction: column;
	gap: calc(var(--default-grid-baseline) * 2);
	width: 100%;

	&--on-the-select {
		flex-direction: row;
		flex-wrap: wrap;
		width: 100%;

		:deep(.v-select.select) {
			min-width: 140px;
			flex: 1;
		}
	}
}

.repeat-option-set-section__title {
	font-weight: normal;
}

.repeat-option-set-section__grid {
	display: flex;
	flex-wrap: wrap;
	gap: calc(var(--default-grid-baseline) * 1);
	width: 100%;
}

.repeat-option-set-section-grid-item {
	min-width: 44px;
}
</style>

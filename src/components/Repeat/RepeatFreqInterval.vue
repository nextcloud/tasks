<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="repeat-option-set repeat-option-set--interval-freq">
		<NcTextField v-if="!isIntervalDisabled"
			:label="repeatEveryLabel"
			type="number"
			class="repeat-option-set__interval"
			min="1"
			max="366"
			:model-value="String(interval)"
			@update:model-value="changeInterval" />
		<RepeatFreqSelect class="repeat-option-set__frequency"
			:freq="frequency"
			:count="interval"
			@change="changeFrequency" />
	</div>
</template>

<script>
import NcTextField from '@nextcloud/vue/components/NcTextField'
import { translate as t } from '@nextcloud/l10n'
import RepeatFreqSelect from './RepeatFreqSelect.vue'

export default {
	name: 'RepeatFreqInterval',
	components: {
		RepeatFreqSelect,
		NcTextField,
	},

	props: {
		frequency: {
			type: String,
			required: true,
		},

		interval: {
			type: Number,
			required: true,
		},
	},

	emits: ['changeFrequency', 'changeInterval'],

	computed: {
		repeatEveryLabel() {
			console.debug(this.frequency)
			if (this.frequency === 'NONE') {
				return t('tasks', 'Repeat')
			}

			return t('tasks', 'Repeat every')
		},

		isIntervalDisabled() {
			return this.frequency === 'NONE'
		},
	},

	methods: {
		t,
		changeFrequency(value) {
			this.$emit('changeFrequency', value)
		},

		/**
		 *
		 * @param {string} value The new interval value
		 */
		changeInterval(value) {
			const selectedValue = parseInt(value, 10)

			if (selectedValue >= 1 && selectedValue <= 366) {
				this.$emit('changeInterval', selectedValue)
			}
		},
	},
}
</script>

<style lang="scss" scoped>
.repeat-option-set--interval-freq {
	display: flex;
	flex-direction: column;
	gap: calc(var(--default-grid-baseline) * 2);
}
</style>

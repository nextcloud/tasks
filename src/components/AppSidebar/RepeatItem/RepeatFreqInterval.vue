<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  -
  - @author Georg Ehrke <oc.list@georgehrke.com>
  -
  - @license AGPL-3.0-or-later
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as
  - published by the Free Software Foundation, either version 3 of the
  - License, or (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program. If not, see <http://www.gnu.org/licenses/>.
  -
  -->

<template>
	<div class="repeat-option-set repeat-option-set--interval-freq">
		<span class="repeat-option-set__label">
			{{ repeatEveryLabel }}
		</span>
		<input v-if="!isIntervalDisabled"
			:value="interval"
			type="number"
			min="1"
			max="366"
			@input="$emit('update:interval', $event.target.value)">
		<RepeatFreqSelect :freq="frequency"
			:count="interval"
			@change="changeFrequency" />
	</div>
</template>

<script>
import RepeatFreqSelect from './RepeatFreqSelect.vue'

export default {
	name: 'RepeatFreqInterval',
	components: { RepeatFreqSelect },
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
	emits: ['update:frequency', 'update:interval'],
	computed: {
		repeatEveryLabel() {
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
		changeFrequency(value) {
			this.$emit('update:frequency', value)
		},
	},
}
</script>

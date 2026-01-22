<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<NcSelect :allow-empty="false"
		:options="options"
		:value="selected"
		:disabled="disabled"
		:placeholder="t('tasks', 'Monday')"
		:clearable="false"
		input-id="value"
		label="label"
		@input="select" />
</template>

<script>
import { getDayNames, translate as t } from '@nextcloud/l10n'
import { NcSelect } from '@nextcloud/vue'

export default {
	name: 'RepeatOnTheSelect',
	components: {
		NcSelect,
	},

	props: {
		/**
		 *
		 */
		byDay: {
			type: Array,
			required: true,
		},

		disabled: {
			type: Boolean,
			required: true,
		},
	},

	computed: {
		options() {
			const dayNames = getDayNames()

			return [{
				label: dayNames[1],
				value: ['MO'],
			}, {
				label: dayNames[2],
				value: ['TU'],
			}, {
				label: dayNames[3],
				value: ['WE'],
			}, {
				label: dayNames[4],
				value: ['TH'],
			}, {
				label: dayNames[5],
				value: ['FR'],
			}, {
				label: dayNames[6],
				value: ['SA'],
			}, {
				label: dayNames[0],
				value: ['SU'],
			}, {
				label: t('tasks', 'day'),
				value: ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'],
			}, {
				label: t('tasks', 'weekday'),
				value: ['MO', 'TU', 'WE', 'TH', 'FR'],
			}, {
				label: t('tasks', 'weekend day'),
				value: ['SU', 'SA'],
			}]
		},

		selected() {
			return this.options.find((option) => option.value.slice().sort().join(',') === this.byDay.slice().sort().join(','))
		},
	},

	methods: {
		t,

		select(value) {
			if (!value) {
				return
			}

			this.$emit('change', value.value)
		},
	},
}
</script>

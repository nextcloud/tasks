<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<NcSelect :allow-empty="false"
		:options="options"
		:value="selected"
		:clearable="false"
		input-id="freq"
		label="label"
		@input="select" />
</template>

<script>
import { NcSelect } from '@nextcloud/vue'
import { translate as t, translatePlural as n } from '@nextcloud/l10n'

export default {
	name: 'RepeatFreqSelect',
	components: {
		NcSelect,
	},

	props: {
		freq: {
			type: String,
			required: true,
		},

		count: {
			type: Number,
			required: true,
		},
	},

	computed: {
		options() {
			return [{
				label: t('tasks', 'never'),
				freq: 'NONE',
			}, {
				label: n('tasks', 'day', 'days', this.count),
				freq: 'DAILY',
			}, {
				label: n('tasks', 'week', 'weeks', this.count),
				freq: 'WEEKLY',
			}, {
				label: n('tasks', 'month', 'months', this.count),
				freq: 'MONTHLY',
			}, {
				label: n('tasks', 'year', 'years', this.count),
				freq: 'YEARLY',
			}]
		},

		selected() {
			return this.options.find((o) => o.freq === this.freq)
		},
	},

	methods: {
		t,
		n,
		select(value) {
			if (!value) {
				return
			}

			this.$emit('change', value.freq)
		},
	},
}
</script>

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
	<NcSelect v-show="true"
		display-name="green"
		:clearable="false"
		:options="options"
		:model-value="selected"
		:placeholder="t('tasks', 'Select something')"
		:append-to-body="false"
		@option:selected="select" />
</template>

<script>
import { NcSelect } from '@nextcloud/vue'
import { translate as t } from '@nextcloud/l10n'

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
	emits: ['change'],
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
			return this.options.find(o => o.freq === this.freq)
		},
	},
	methods: {
		t,
		select(value) {
			if (!value) {
				return
			}
			this.$emit('change', value.freq)
		},
	},
}
</script>

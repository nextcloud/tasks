<!--
Nextcloud - Tasks

@author Georg Ehrke
@copyright 2019 Georg Ehrke <oc.list@georgehrke.com>

@author Raimund Schlüßler
@copyright 2021 Raimund Schlüßler <raimund.schluessler@mailbox.org>

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
	<div class="property__item">
		<NcSelect label="displayName"
			:disabled="isDisabled"
			:clearable="false"
			:options="calendarsMap"
			:model-value="calendarMap"
			:placeholder="t('tasks', 'Select a calendar')"
			:append-to-body="false"
			@option:selected="change">
			<template #selected-option="option">
				<CalendarPickerOption v-bind="option" />
			</template>
			<template #option="option">
				<CalendarPickerOption v-bind="option" />
			</template>
			<template #no-options>
				<CalendarPickerOption color=""
					owner=""
					:is-shared-with-me="false"
					:display-name="t('tasks', 'No calendar matches the search.')" />
			</template>
		</NcSelect>
	</div>
</template>

<script>
import CalendarPickerOption from './CalendarPickerOption.vue'

import { translate as t } from '@nextcloud/l10n'
import NcSelect from '@nextcloud/vue/components/NcSelect'

export default {
	components: {
		CalendarPickerOption,
		NcSelect,
	},
	props: {
		calendar: {
			type: Object,
			default: null,
		},
		calendars: {
			type: Array,
			required: true,
		},
		disabled: {
			type: Boolean,
			required: false,
		},
	},
	emits: ['changeCalendar'],
	computed: {
		isDisabled() {
			return this.calendars.length < 2 || this.disabled
		},
		calendarsMap() {
			return this.calendars.map(calendar => this.stubCalendar(calendar))
		},
		calendarMap() {
			return this.stubCalendar(this.calendar)
		},
	},
	methods: {
		t,

		stubCalendar(calendar) {
			return calendar
				? {
					id: calendar.url,
					displayName: calendar.displayName,
					color: calendar.color,
					isSharedWithMe: calendar.isSharedWithMe,
					owner: calendar.owner,
				}
				: null
		},

		/**
		 * TODO: this should emit the calendar id instead
		 *
		 * @param {object} calendarMap The selected calendar
		 */
		change(calendarMap) {
			const calendar = this.calendars.find(calendar => calendar.url === calendarMap.id)
			if (!calendar) {
				return
			}
			this.$emit('changeCalendar', calendar)
		},
	},
}
</script>

<style lang="scss" scoped>
.property__item {
	display: flex;
	border-bottom: 1px solid var(--color-border);
	width: 100%;
	padding: 0 6px;

	:deep(.v-select.select) {
		width: 100%;
		margin: 0 !important;

		.vs {
			&__dropdown-menu,
			&__dropdown-option,
			&__selected-options {
				margin:  0;
				padding: 0;
				border: none;
			}

			&__dropdown-toggle {
				margin:  0;
				padding: 0;
				border: none;
				outline: none !important;
			}

			&__selected {
				height: var(--default-clickable-area);
				margin:  0;
				padding: 0;
				border: none;
			}

			&__dropdown-menu {
				border-radius: 0;
				box-shadow: none;
				border: 1px solid var(--color-border-dark);
			}

			&__dropdown-option {
				margin-left: -1px;
			}

			&__search {
				padding-left: 44px;
				margin: 0;
				height: var(--default-clickable-area) !important;
				line-height: var(--default-clickable-area);
			}

			&__actions {
				cursor: pointer;

				span {
					cursor: pointer;
				}
			}
		}
	}
}
</style>

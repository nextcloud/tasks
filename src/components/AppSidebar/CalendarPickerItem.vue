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
		<NcMultiselect label="displayName"
			track-by="url"
			:disabled="isDisabled"
			:options="calendars"
			:value="calendar"
			:placeholder="t('tasks', 'Select a calendar')"
			@select="change">
			<template #singleLabel="scope">
				<CalendarPickerOption v-bind="scope.option" />
			</template>
			<template #option="scope">
				<CalendarPickerOption v-bind="scope.option" />
			</template>
			<template #noResult>
				<CalendarPickerOption color=""
					owner=""
					:is-shared-with-me="false"
					:display-name="t('tasks', 'No calendar matches the search.')" />
			</template>
		</NcMultiselect>
	</div>
</template>

<script>
import CalendarPickerOption from './CalendarPickerOption.vue'

import { translate as t } from '@nextcloud/l10n'
import NcMultiselect from '@nextcloud/vue/dist/Components/NcMultiselect'

export default {
	components: {
		CalendarPickerOption,
		NcMultiselect,
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
	computed: {
		isDisabled() {
			return this.calendars.length < 2 || this.disabled
		},
	},
	methods: {
		t,

		/**
		 * TODO: this should emit the calendar id instead
		 *
		 * @param {object} newCalendar The selected calendar
		 */
		change(newCalendar) {
			if (!newCalendar) {
				return
			}
			this.$emit('change-calendar', newCalendar)
		},
	},
}
</script>

<style lang="scss" scoped>
.property__item::v-deep {
	display: flex;
	border-bottom: 1px solid var(--color-border);
	width: 100%;

	.multiselect {
		width: 100%;

		&--active .multiselect__tags {
			border: 1px solid var(--color-border-dark);
		}

		&--disabled,
		&--disabled .multiselect__single {
			background-color: var(--color-main-background) !important;

			& * {
				cursor: default !important;
			}
		}

		.multiselect__tags {
			border: 1px solid transparent;
			height: 44px;

			.multiselect__single {
				padding: 0;
			}

			input.multiselect__input {
				padding: 0 !important;
				padding-left: 44px !important;
				width: 100% !important;
				position: absolute !important;
				font-weight: bold;
				font-size: var(--default-font-size);
			}
		}

		.multiselect__content-wrapper li > span {
			padding: 0;

			&.multiselect__option--selected {
				color: var(--color-main-text);
			}
		}
	}
}
</style>

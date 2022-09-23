<!--
Nextcloud - Tasks

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
	<div v-click-outside="checkOutsideClick"
		:class="{
			'property__item--clearable': date.isValid() && !readOnly,
			'property__item--valid': isValid,
			'property__item--overdue': isOverdue,
			'property__item--readonly': readOnly
		}"
		class="property__item">
		<div class="item__content" @click="setEditing(true)">
			<span class="content__icon">
				<slot name="icon" />
			</span>
			<span v-show="!editing" class="content__title">
				{{ propertyString }}
			</span>
			<div v-if="editing" class="content__input">
				<NcDatetimePicker :value="newValue"
					:lang="lang"
					:format="dateFormat"
					:clearable="false"
					:append-to-body="true"
					:show-week-number="true"
					type="date"
					:placeholder="t('tasks', 'Set date')"
					class="date"
					@change="setDate" />
				<NcDatetimePicker v-if="!allDay"
					:value="newValue"
					:lang="lang"
					:format="timeFormat"
					:clearable="false"
					:append-to-body="true"
					:time-picker-options="timePickerOptions"
					type="time"
					:placeholder="t('tasks', 'Set time')"
					class="time"
					@change="setTime" />
			</div>
		</div>
		<div class="item__actions">
			<NcActions v-show="editing" class="actions__set">
				<NcActionButton @click="setValue()">
					<template #icon>
						<Check :size="20" />
					</template>
					{{ t('tasks', 'Set date') }}
				</NcActionButton>
			</NcActions><NcActions v-show="editing" class="actions__clear">
				<NcActionButton @click="clearValue">
					<template #icon>
						<Delete :size="20" />
					</template>
					{{ t('tasks', 'Delete date') }}
				</NcActionButton>
			</NcActions>
		</div>
	</div>
</template>

<script>
import editableItem from '../../mixins/editableItem.js'
import { overdue } from '../../store/storeHelper.js'

import { translate as t } from '@nextcloud/l10n'
import moment from '@nextcloud/moment'
import { NcDatetimePicker } from '@nextcloud/vue'

export default {
	name: 'DatetimePickerItem',
	components: {
		NcDatetimePicker,
	},
	mixins: [editableItem],
	props: {
		/**
		 * The current date
		 */
		date: {
			type: Object,
			default: null,
		},
		/**
		 * The current value
		 */
		value: {
			type: Date,
			default: null,
		},
		/**
		 * Whether the date is all day
		 */
		allDay: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			lang: {
				formatLocale: {
					firstDayOfWeek: window.firstDay,
				},
				days: window.dayNamesShort, // provided by nextcloud
				months: window.monthNamesShort, // provided by nextcloud
			},
			dateFormat: moment.localeData().longDateFormat('L'),
			timeFormat: moment.localeData().longDateFormat('LT'),
			timePickerOptions: {
				start: '00:00',
				step: '00:30',
				end: '23:30',
			},
		}
	},
	computed: {
		isValid() {
			return this.date.isValid()
		},
		isOverdue() {
			return overdue(this.date)
		},
	},
	methods: {
		t,

		/**
		 * Checks if the click originated from the datepicker
		 * and sets the value if not.
		 *
		 * @param {object} $event The click event
		 */
		checkOutsideClick($event) {
			/**
			 * If the click originates from the datepicker, we do nothing.
			 * Can be removed once https://github.com/nextcloud/nextcloud-vue/pull/1881
			 * is merged and the datepicker is not attached to body anymore.
			 */
			if ($event.target.closest('.mx-datepicker-main')
				|| $event.target.closest('.mx-table')
				|| $event.target.classList.contains('mx-btn')) {
				return
			}
			this.setValue()
		},
		/**
		 * When selecting a new date with the datepicker, the time is always set to 00:00.
		 * So we have to get the time from the previous date object.
		 *
		 * @param {Date} date The new date (year, month & day)
		 */
		setDate(date) {
			date.setHours(this.newValue.getHours(), this.newValue.getMinutes())
			this.newValue = date
		},
		/**
		 * When selecting a new time with the keyboard, the date is set to the current day.
		 * So we only get hours and minutes from the new date.
		 *
		 * @param {Date} date The new date (hours & minutes)
		 */
		setTime(date) {
			/**
			 * Simply mutating newValue doesn't make vue pick up the changes,
			 * so we create a new object, mutate it and assign it to newValue.
			 */
			const newDate = new Date(this.newValue.getTime())
			newDate.setHours(date.getHours(), date.getMinutes())
			this.newValue = newDate
		},
	},
}
</script>

<style lang="scss" scoped>
$red: #b3312d;
$blue: #4271a6;

.property__item {
	border-bottom: 1px solid var(--color-border);
	padding: 0;
	position: relative;
	margin-bottom: 0;
	width: 100%;
	color: var(--color-text-lighter);
	display: flex;

	&:first-child {
		border-top: 1px solid var(--color-border);
	}

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

				&__title {
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

					.mx-datepicker {
						width: auto;
						&.date {
							min-width: 100px;
							flex-shrink: 1;
							flex-basis: 100px;
							flex-grow: 3;
						}
						&.time {
							min-width: 65px;
							flex-shrink: 2;
							flex-basis: 65px;
							flex-grow: 2;
						}
					}
				}
			}
		}

		&__actions {
			display: flex;
			flex-wrap: nowrap;
		}
	}

	&--valid {
		color: $blue;
	}

	&--overdue {
		color: $red;
	}

	&--readonly * {
		cursor: default;
	}

	&--clearable:hover .actions__clear {
		display: inline-block !important;
	}
}
</style>

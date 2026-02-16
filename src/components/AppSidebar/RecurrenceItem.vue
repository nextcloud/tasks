<!--
Nextcloud - Tasks

@author Raimund Schlüßler
@copyright 2026 Raimund Schlüßler <raimund.schluessler@mailbox.org>

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
	<div :class="{
			'property__item--clearable': isRecurring && !readOnly,
			'property__item--readonly': readOnly
		}"
		class="property__item">
		<div class="item__content" @click="!readOnly && openEditor()">
			<span class="content__icon">
				<slot name="icon" />
			</span>
			<span class="content__name">
				{{ recurrenceSummary }}
			</span>
		</div>
		<div class="item__actions">
			<NcActions v-show="isRecurring && !readOnly" class="actions__clear">
				<NcActionButton @click="clearRecurrence">
					<template #icon>
						<Delete :size="20" />
					</template>
					{{ t('tasks', 'Remove recurrence') }}
				</NcActionButton>
			</NcActions>
		</div>

		<!-- Recurrence Editor Modal -->
		<NcModal v-if="showEditor" @close="closeEditor">
			<div class="property-repeat__options">
				<h2>{{ t('tasks', 'Repeat task') }}</h2>
				<RepeatFreqInterval :frequency="localRule.frequency"
					:interval="localRule.interval"
					@change-interval="changeInterval"
					@change-frequency="changeFrequency" />
				<RepeatFreqWeeklyOptions v-if="isFreqWeekly"
					:by-day="localRule.byDay"
					@add-by-day="addByDay"
					@remove-by-day="removeByDay" />
				<RepeatFreqMonthlyOptions v-if="isFreqMonthly"
					:by-day="localRule.byDay"
					:by-month-day="localRule.byMonthDay"
					:by-set-position="localRule.bySetPosition"
					@add-by-month-day="addByMonthDay"
					@remove-by-month-day="removeByMonthDay"
					@change-by-day="setByDay"
					@change-by-set-position="setBySetPosition"
					@change-to-by-set-position="changeToBySetPositionMonthly"
					@change-to-by-month-day="changeToByDayMonthly" />
				<RepeatFreqYearlyOptions v-if="isFreqYearly"
					:by-day="localRule.byDay"
					:by-month="localRule.byMonth"
					:by-month-day="localRule.byMonthDay"
					:by-set-position="localRule.bySetPosition"
					@add-by-month="addByMonth"
					@remove-by-month="removeByMonth"
					@add-by-month-day="addByMonthDay"
					@remove-by-month-day="removeByMonthDay"
					@change-by-day="setByDay"
					@change-by-set-position="setBySetPosition"
					@change-to-by-set-position="changeToBySetPositionYearly"
					@change-to-by-month-day="changeToByDayYearly" />
				<RepeatEndRepeat v-if="isRepeating"
					:calendar-object-instance="calendarObjectInstance"
					:until="localRule.until"
					:count="localRule.count"
					@set-infinite="setInfinite"
					@set-until="setUntil"
					@set-count="setCount"
					@change-to-count="changeToCount"
					@change-to-until="changeToUntil" />
				<div class="property-repeat__options__footer">
					<NcButton type="primary" @click="saveRecurrence">
						{{ t('tasks', 'Save') }}
					</NcButton>
				</div>
			</div>
		</NcModal>
	</div>
</template>

<script>
import { NcActions, NcActionButton, NcButton, NcModal } from '@nextcloud/vue'
import { translate as t, translatePlural as n } from '@nextcloud/l10n'
import Delete from 'vue-material-design-icons/Delete.vue'
import RepeatFreqInterval from '../Repeat/RepeatFreqInterval.vue'
import RepeatFreqWeeklyOptions from '../Repeat/RepeatFreqWeeklyOptions.vue'
import RepeatFreqMonthlyOptions from '../Repeat/RepeatFreqMonthlyOptions.vue'
import RepeatFreqYearlyOptions from '../Repeat/RepeatFreqYearlyOptions.vue'
import RepeatEndRepeat from '../Repeat/RepeatEndRepeat.vue'
import moment from '@nextcloud/moment'

export default {
	name: 'RecurrenceItem',
	components: {
		NcActions,
		NcActionButton,
		NcButton,
		NcModal,
		Delete,
		RepeatFreqInterval,
		RepeatFreqWeeklyOptions,
		RepeatFreqMonthlyOptions,
		RepeatFreqYearlyOptions,
		RepeatEndRepeat,
	},
	props: {
		/**
		 * The task object
		 */
		task: {
			type: Object,
			required: true,
		},
		/**
		 * Whether the item is read-only
		 */
		readOnly: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			showEditor: false,
			localRule: {
				frequency: 'NONE',
				interval: 1,
				count: null,
				until: null,
				byDay: [],
				byMonth: [],
				byMonthDay: [],
				bySetPosition: null,
			},
		}
	},
	computed: {
		isRecurring() {
			return this.task.recurrenceRule && this.task.recurrenceRule.frequency !== 'NONE'
		},
		isRepeating() {
			return this.localRule.frequency !== 'NONE'
		},
		isFreqWeekly() {
			return this.localRule.frequency === 'WEEKLY'
		},
		isFreqMonthly() {
			return this.localRule.frequency === 'MONTHLY'
		},
		isFreqYearly() {
			return this.localRule.frequency === 'YEARLY'
		},
		/**
		 * Provide a minimal calendarObjectInstance for RepeatEndRepeat
		 *
		 * @return {object}
		 */
		calendarObjectInstance() {
			return {
				startDate: this.task.start ? new Date(this.task.start) : new Date(),
			}
		},
		recurrenceSummary() {
			if (!this.isRecurring) {
				return t('tasks', 'Does not repeat')
			}

			const rule = this.task.recurrenceRule
			const interval = rule.interval || 1

			// Get translated frequency
			const frequencyText = this.getTranslatedFrequency(rule.frequency, interval)

			let summary = ''
			if (interval === 1) {
				summary = frequencyText
			} else {
				summary = t('tasks', 'Every {interval} {frequency}', { interval, frequency: frequencyText })
			}

			// Add by-day info for weekly
			if (rule.frequency === 'WEEKLY' && rule.byDay && rule.byDay.length > 0) {
				const dayNames = rule.byDay.map(day => this.getDayName(day)).join(', ')
				summary += ' ' + t('tasks', 'on {days}', { days: dayNames })
			}

			if (rule.until) {
				const date = new Date(rule.until).toLocaleDateString()
				summary += ', ' + t('tasks', 'until {date}', { date })
			} else if (rule.count) {
				summary += ', ' + t('tasks', '{count} times', { count: rule.count })
			}

			return summary
		},
	},
	watch: {
		'task.recurrenceRule': {
			handler(newRule) {
				if (newRule) {
					this.loadFromRule(newRule)
				}
			},
			immediate: true,
		},
	},
	methods: {
		t,
		n,

		getDayName(day) {
			const dayMap = {
				MO: t('tasks', 'Monday'),
				TU: t('tasks', 'Tuesday'),
				WE: t('tasks', 'Wednesday'),
				TH: t('tasks', 'Thursday'),
				FR: t('tasks', 'Friday'),
				SA: t('tasks', 'Saturday'),
				SU: t('tasks', 'Sunday'),
			}
			return dayMap[day] || day
		},

		getTranslatedFrequency(frequency, interval) {
			switch (frequency) {
			case 'DAILY':
				return interval === 1 ? t('tasks', 'Daily') : n('tasks', 'day', 'days', interval)
			case 'WEEKLY':
				return interval === 1 ? t('tasks', 'Weekly') : n('tasks', 'week', 'weeks', interval)
			case 'MONTHLY':
				return interval === 1 ? t('tasks', 'Monthly') : n('tasks', 'month', 'months', interval)
			case 'YEARLY':
				return interval === 1 ? t('tasks', 'Yearly') : n('tasks', 'year', 'years', interval)
			default:
				return frequency
			}
		},

		openEditor() {
			if (!this.readOnly) {
				this.loadFromRule(this.task.recurrenceRule)
				this.showEditor = true
			}
		},

		closeEditor() {
			this.showEditor = false
		},

		loadFromRule(rule) {
			const dayMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
			let byDay = rule.byDay ? [...rule.byDay] : []

			// Initialize byDay with current day if WEEKLY but no days selected
			if (rule.frequency === 'WEEKLY' && byDay.length === 0) {
				byDay = [dayMap[moment().day()]]
			}

			this.localRule = {
				frequency: rule.frequency || 'NONE',
				interval: rule.interval || 1,
				count: rule.count || null,
				until: rule.until ? new Date(rule.until) : null,
				byDay,
				byMonth: rule.byMonth ? [...rule.byMonth] : [],
				byMonthDay: rule.byMonthDay ? [...rule.byMonthDay] : [],
				bySetPosition: rule.bySetPosition || null,
			}
		},

		// Frequency and interval changes
		changeFrequency(frequency) {
			this.localRule.frequency = frequency
			// Reset options when changing frequency
			if (frequency === 'WEEKLY') {
				// Set current day as default (0=Sunday, 1=Monday, etc.)
				const dayMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
				const dayOfWeek = dayMap[moment().day()]
				this.localRule.byDay = [dayOfWeek]
				this.localRule.byMonthDay = []
				this.localRule.byMonth = []
				this.localRule.bySetPosition = null
			} else if (frequency === 'MONTHLY') {
				this.localRule.byDay = []
				this.localRule.byMonthDay = [moment().date()]
				this.localRule.byMonth = []
				this.localRule.bySetPosition = null
			} else if (frequency === 'YEARLY') {
				this.localRule.byDay = []
				this.localRule.byMonthDay = [moment().date()]
				this.localRule.byMonth = [moment().month() + 1]
				this.localRule.bySetPosition = null
			} else {
				this.localRule.byDay = []
				this.localRule.byMonthDay = []
				this.localRule.byMonth = []
				this.localRule.bySetPosition = null
			}
		},

		changeInterval(interval) {
			this.localRule.interval = interval
		},

		// Weekly options
		addByDay(day) {
			if (!this.localRule.byDay.includes(day)) {
				this.localRule.byDay.push(day)
			}
		},

		removeByDay(day) {
			const index = this.localRule.byDay.indexOf(day)
			if (index > -1) {
				this.localRule.byDay.splice(index, 1)
			}
		},

		// Monthly options
		addByMonthDay(day) {
			if (!this.localRule.byMonthDay.includes(day)) {
				this.localRule.byMonthDay.push(day)
			}
		},

		removeByMonthDay(day) {
			const index = this.localRule.byMonthDay.indexOf(day)
			if (index > -1) {
				this.localRule.byMonthDay.splice(index, 1)
			}
		},

		setByDay(byDay) {
			this.localRule.byDay = byDay
		},

		setBySetPosition(position) {
			this.localRule.bySetPosition = position
		},

		changeToBySetPositionMonthly() {
			this.localRule.byMonthDay = []
			this.localRule.bySetPosition = 1
			const dayMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
			this.localRule.byDay = [dayMap[moment().day()]]
		},

		changeToByDayMonthly() {
			this.localRule.bySetPosition = null
			this.localRule.byDay = []
			this.localRule.byMonthDay = [moment().date()]
		},

		// Yearly options
		addByMonth(month) {
			if (!this.localRule.byMonth.includes(month)) {
				this.localRule.byMonth.push(month)
			}
		},

		removeByMonth(month) {
			const index = this.localRule.byMonth.indexOf(month)
			if (index > -1) {
				this.localRule.byMonth.splice(index, 1)
			}
		},

		changeToBySetPositionYearly() {
			this.localRule.byMonthDay = []
			this.localRule.bySetPosition = 1
			const dayMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
			this.localRule.byDay = [dayMap[moment().day()]]
		},

		changeToByDayYearly() {
			this.localRule.bySetPosition = null
			this.localRule.byDay = []
			this.localRule.byMonthDay = [moment().date()]
		},

		// End repeat options
		setInfinite() {
			this.localRule.count = null
			this.localRule.until = null
		},

		changeToUntil() {
			this.localRule.count = null
			// Default to 1 month from now
			const until = moment().add(1, 'month').toDate()
			this.localRule.until = until
		},

		changeToCount() {
			this.localRule.until = null
			this.localRule.count = 10
		},

		setUntil(date) {
			this.localRule.until = date
		},

		setCount(count) {
			this.localRule.count = count
		},

		async saveRecurrence() {
			if (this.localRule.frequency === 'NONE') {
				await this.clearRecurrence()
				this.closeEditor()
				return
			}

			// Build the recurrence rule
			const recurrenceData = {
				frequency: this.localRule.frequency,
				interval: this.localRule.interval || 1,
			}

			if (this.localRule.byDay && this.localRule.byDay.length > 0) {
				recurrenceData.byDay = this.localRule.byDay
			}

			if (this.localRule.byMonth && this.localRule.byMonth.length > 0) {
				recurrenceData.byMonth = this.localRule.byMonth
			}

			if (this.localRule.byMonthDay && this.localRule.byMonthDay.length > 0) {
				recurrenceData.byMonthDay = this.localRule.byMonthDay
			}

			if (this.localRule.bySetPosition !== null) {
				recurrenceData.bySetPosition = this.localRule.bySetPosition
			}

			if (this.localRule.until) {
				recurrenceData.until = this.localRule.until
			} else if (this.localRule.count) {
				recurrenceData.count = this.localRule.count
			}

			// Dispatch to store
			await this.$store.dispatch('setRecurrenceRule', {
				task: this.task,
				recurrenceRule: recurrenceData,
			})

			this.closeEditor()
		},

		async clearRecurrence() {
			await this.$store.dispatch('removeRecurrenceRule', {
				task: this.task,
			})
		},
	},
}
</script>

<style lang="scss" scoped>
.property__item {
	border-bottom: 1px solid var(--color-border);
	padding: 0 6px;
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
			line-height: var(--default-clickable-area);
			min-width: 0;
			flex-grow: 1;
			gap: 0 4px;

			.content {
				&__icon {
					display: flex;
					height: var(--default-clickable-area);
					width: var(--default-clickable-area);
					min-width: var(--default-clickable-area);
					justify-content: center;

					.material-design-icon__svg {
						vertical-align: middle;
					}
				}

				&__name {
					flex-grow: 1;
					padding-right: 14px;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
			}
		}

		&__actions {
			display: flex;
			flex-wrap: nowrap;
		}
	}

	&--readonly * {
		cursor: default;
	}

	&--clearable:hover .actions__clear {
		display: inline-block !important;
	}
}

.property-repeat__options {
	padding: calc(var(--default-grid-baseline) * 4);
	display: flex;
	flex-direction: column;
	gap: calc(var(--default-grid-baseline) * 2);

	&__footer {
		display: flex;
		justify-content: flex-end;
		margin-top: calc(var(--default-grid-baseline) * 2);
	}
}
</style>

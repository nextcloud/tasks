<template>
	<NcModal @close="onClose()">
		<div class="content">
			<h3 class="content__heading">
				{{ t('tasks', 'Update reminder') }}
			</h3>
			<div>
				<p v-if="alarm.relativeIsRelatedToStart" class="content__form-label">
					{{ t('tasks', 'Set a reminder relative to your tasks start date:') }}
				</p>
				<p v-else class="content__form-label">
					{{ t('tasks', 'Set a reminder relative to your tasks due date:') }}
				</p>

				<div v-if="!isAllDay"
					class="content__form content__form--timed">
					<input v-model="relativeAmountTimed"
						type="number"
						min="0"
						max="3600">
					<AlarmTimeUnitSelect :is-all-day="isAllDay"
						:count="relativeAmountTimed"
						:unit="relativeUnitTimed"
						@change="changeRelativeUnitTimed" />
				</div>
				<div v-else>
					<div class="content__form content__form--timed">
						<input v-model="relativeAmountAllDay"
							type="number"
							min="0"
							max="3600">
						<AlarmTimeUnitSelect :is-all-day="isAllDay"
							:count="relativeAmountAllDay"
							:unit="relativeUnitAllDay"
							class="time-unit-select"
							@change="changeRelativeUnitAllDay" />
						<p>
							{{ t('tasks', 'before at') }}
						</p>
						<NcDateTimePickerNative v-model="relativeAllDayDate"
							type="time"
							:hide-label="true" />
					</div>
					<div class="content__form content__form--all-day" />
				</div>
			</div>
			<div class="content__buttons">
				<NcButton @click="onClose()">
					{{ t('tasks', 'Cancel') }}
				</NcButton>
				<NcButton type="primary" @click="onSelectDateTime">
					{{ t('tasks', 'Update reminder') }}
				</NcButton>
			</div>
		</div>
	</NcModal>
</template>

<script>
import { translate as t } from '@nextcloud/l10n'
import { NcButton, NcDateTimePickerNative, NcModal } from '@nextcloud/vue'
import AlarmTimeUnitSelect from './AlarmTimeUnitSelect.vue'
import { getAlarmObjectFromTriggerTime } from '../../../models/alarm.js'
import {
	getFactorForAlarmUnit,
	getTotalSecondsFromAmountHourMinutesAndUnitForAllDayEvents,
} from '../../../utils/alarms.js'

export default {
	name: 'AlarmRelativeTimePickerModal',
	components: {
		AlarmTimeUnitSelect,
		NcButton,
		NcDateTimePickerNative,
		NcModal,
	},
	props: {
		originalAlarm: {
			type: Object,
			required: true,
		},
		isAllDay: {
			type: Boolean,
			required: true,
		},
	},
	emits: [
		'select-date-time',
		'close',
	],
	data() {
		return {
			alarm: this.originalAlarm,

			relativeAmountTimed: this.originalAlarm.relativeAmountTimed,
			relativeUnitTimed: this.originalAlarm.relativeUnitTimed,

			relativeAmountAllDay: this.originalAlarm.relativeAmountAllDay,
			relativeUnitAllDay: this.originalAlarm.relativeUnitAllDay,
			relativeHoursAllDay: this.originalAlarm.relativeHoursAllDay,
			relativeMinutesAllDay: this.originalAlarm.relativeMinutesAllDay,
		}
	},
	computed: {
		relativeAllDayDate: {
			get() {
				const date = new Date()
				date.setHours(this.alarm.relativeHoursAllDay)
				date.setMinutes(this.alarm.relativeMinutesAllDay)

				return date
			},
			set(date) {
				this.relativeHoursAllDay = date.getHours()
				this.relativeMinutesAllDay = date.getMinutes()
			},
		},
	},
	methods: {
		t,

		/**
		 * Changes the relative unit entered in timed mode
		 *
		 * @param {string} unit The new unit
		 */
		changeRelativeUnitTimed(unit) {
			this.relativeUnitTimed = unit
		},

		/**
		 * Changes the relative unit entered in all-day mode
		 *
		 * @param {string} unit The new unit
		 */
		changeRelativeUnitAllDay(unit) {
			this.relativeUnitAllDay = unit
		},

		onSelectDateTime() {
			const totalSecondsAllDay = getTotalSecondsFromAmountHourMinutesAndUnitForAllDayEvents(
				this.relativeAmountAllDay,
				this.relativeHoursAllDay,
				this.relativeMinutesAllDay,
				this.relativeUnitAllDay,
			)
			const totalSecondsTimed = this.relativeAmountTimed * -1 * getFactorForAlarmUnit(this.relativeUnitTimed)
			const seconds = this.isAllDay ? totalSecondsAllDay : totalSecondsTimed

			const alarmObject = getAlarmObjectFromTriggerTime(seconds, this.alarm.relativeIsRelatedToStart)

			this.$emit('select-date-time', alarmObject)
		},

		onClose() {
			this.$emit('close')
		},
	},
}
</script>

<style lang="scss" scoped>
.content {
	padding: 14px;

	&__heading {
		margin-top: 0;
	}

	&__buttons {
		display: flex;
		gap: 8px;
		margin-top: 14px;
		justify-content: flex-end;
	}

	&__form-label {
		margin-bottom: 8px;
	}

	&__form {
		&--timed {
			display: flex;
			align-items: baseline;
			gap: 8px;

			input {
				margin: 0;
			}

			& > div {
				flex-grow: 1;
			}
		}
	}
}
</style>

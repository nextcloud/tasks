<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<NcActions ref="actions"
		type="tertiary"
		:force-name="true"
		:force-menu="true"
		:menu-name="t('tasks', 'Add reminder')">
		<template #icon>
			<Plus :size="20" />
		</template>
		<NcActionButton v-if="hasStartDate && !isReminderMenuOpen" :is-menu="true" @click="showStartReminderMenu">
			<template #icon>
				<BellPlusOutline :size="18" />
			</template>
			{{ t('tasks', 'Before the task starts') }}
		</NcActionButton>
		<NcActionButton v-if="hasDueDate && !isReminderMenuOpen" :is-menu="true" @click="showDueReminderMenu">
			<template #icon>
				<BellPlusOutline :size="18" />
			</template>
			{{ t('tasks', 'Before the task is due') }}
		</NcActionButton>
		<template v-if="!isReminderMenuOpen">
			<NcActionButton v-for="alarm in absoluteAlarms"
				:key="alarm.label"
				:title="alarm.label"
				close-after-click
				@click="onAlarmOptionClick(alarm)">
				<template #icon>
					<BellPlus :size="18" />
				</template>
				{{ alarm.label }}
			</NcActionButton>
		</template>
		<NcActionButton v-if="!isReminderMenuOpen" @click="showChooseDateTimeMenu">
			<template #icon>
				<CalendarClock :size="18" />
			</template>
			{{ t('tasks', 'Select date and time') }}
		</NcActionButton>

		<!-- Alarms relative to start-date -->
		<template v-if="hasStartDate && startDateMenuIsOpen">
			<!-- Back to top-level button -->
			<NcActionButton @click="onBackToMenuClick()">
				<template #icon>
					<ArrowLeft :size="18" />
				</template>
				{{ t('tasks', 'Go back') }}
			</NcActionButton>
			<NcActionSeparator />
			<NcActionButton v-for="alarm in startDateAlarms"
				:key="alarm.label"
				:title="alarm.label"
				close-after-click
				@click="onAlarmOptionClick(alarm)">
				<template #icon>
					<BellPlus :size="18" />
				</template>
				{{ alarm.label }}
			</NcActionButton>
		</template>

		<!-- Alarms relative to due-date -->
		<template v-if="hasDueDate && dueDateMenuIsOpen">
			<!-- Back to top-level button -->
			<NcActionButton @click="onBackToMenuClick()">
				<template #icon>
					<ArrowLeft :size="18" />
				</template>
				{{ t('tasks', 'Go back') }}
			</NcActionButton>
			<NcActionSeparator />
			<NcActionButton v-for="alarm in dueDateAlarms"
				:key="alarm.label"
				:title="alarm.label"
				close-after-click
				@click="onAlarmOptionClick(alarm)">
				<template #icon>
					<BellPlus :size="18" />
				</template>
				{{ alarm.label }}
			</NcActionButton>
		</template>
	</NcActions>

	<AlarmDateTimePickerModal v-if="chooseDateTimeMenuIsOpen"
		@select-date-time="onChooseDateAndTime"
		@close="onBackToMenuClick" />
</template>

<script>
import AlarmDateTimePickerModal from './AlarmDateTimePickerModal.vue'
import {
	getDefaultAlarms,
	getDefaultAbsoluteAlarms,
} from '../../../utils/alarms.js'
import { formatAlarm } from '../../../utils/dateStrings.js'
import { getAlarmObjectFromDateTime, getAlarmObjectFromTriggerTime } from '../../../models/alarm.js'

import { getCanonicalLocale, translate as t } from '@nextcloud/l10n'
import { NcActions, NcActionButton, NcActionSeparator } from '@nextcloud/vue'
import ArrowLeft from 'vue-material-design-icons/ArrowLeft.vue'
import BellPlus from 'vue-material-design-icons/BellPlus.vue'
import BellPlusOutline from 'vue-material-design-icons/BellPlusOutline.vue'
import CalendarClock from 'vue-material-design-icons/CalendarClock.vue'
import Plus from 'vue-material-design-icons/Plus.vue'

export default {
	name: 'AlarmListNew',
	components: {
		AlarmDateTimePickerModal,
		NcActions,
		NcActionButton,
		NcActionSeparator,
		ArrowLeft,
		BellPlus,
		BellPlusOutline,
		CalendarClock,
		Plus,
	},
	props: {
		hasStartDate: {
			type: Boolean,
			required: true,
		},
		hasDueDate: {
			type: Boolean,
			required: true,
		},
		isAllDay: {
			type: Boolean,
			required: true,
		},
	},
	emits: [
		'addAlarm',
	],
	data() {
		return {
			startDateMenuIsOpen: false,
			dueDateMenuIsOpen: false,
			chooseDateTimeMenuIsOpen: false,
		}
	},
	computed: {
		locale() {
			return getCanonicalLocale().toLocaleLowerCase()
		},
		timeZone() {
			return new Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
		},
		startDateAlarms() {
			return getDefaultAlarms(this.isAllDay).map((defaultAlarm) => {
				const alarmObject = getAlarmObjectFromTriggerTime(defaultAlarm, true)

				return {
					value: defaultAlarm,
					parameter: { name: 'RELATED', value: 'START' },
					label: formatAlarm(alarmObject, this.isAllDay, this.timeZone, this.locale),
				}
			})
		},
		dueDateAlarms() {
			return getDefaultAlarms(false).map((defaultAlarm) => {
				const alarmObject = getAlarmObjectFromTriggerTime(defaultAlarm, false)

				return {
					value: defaultAlarm,
					parameter: { name: 'RELATED', value: 'END' },
					label: formatAlarm(alarmObject, false, this.timeZone, this.locale),
				}
			})
		},
		absoluteAlarms() {
			return getDefaultAbsoluteAlarms().map((defaultAlarm) => {
				const alarmObject = getAlarmObjectFromDateTime(defaultAlarm)

				return {
					value: defaultAlarm,
					parameter: undefined, // ical.js sets the correct parameter for us when using a `ICAL.Time`-object
					// Absolute alarms are not in UTC but in the time zone of the current user, so we don't have to
					// convert the date. We achieve this by passing 'UTC' as time zone.
					label: formatAlarm(alarmObject, false, 'UTC', this.locale),
				}
			})
		},
		isReminderMenuOpen() {
			return this.startDateMenuIsOpen || this.dueDateMenuIsOpen || this.chooseDateTimeMenuIsOpen
		},
	},
	methods: {
		t,

		showStartReminderMenu() {
			this.startDateMenuIsOpen = true
		},

		showDueReminderMenu() {
			this.dueDateMenuIsOpen = true
		},

		showChooseDateTimeMenu() {
			this.chooseDateTimeMenuIsOpen = true
		},

		onBackToMenuClick() {
			this.resetState()
		},

		onAlarmOptionClick(alarm) {
			this.$emit('addAlarm', alarm)
			this.resetState()
		},

		onChooseDateAndTime(date) {
			const alarm = {
				value: date,
				parameter: undefined, // ical.js sets the correct parameter for us when using a `ICAL.Time`-object
			}

			this.$emit('addAlarm', alarm)
			this.resetState()

			// We have to close the menu manually because the `NcActions`-component isn't aware of what happens in
			// the `AlarmDateTimePickerModal`-component and would stay open until one of its buttons are pressed.
			this.$refs.actions.closeMenu()
		},

		resetState() {
			this.startDateMenuIsOpen = false
			this.dueDateMenuIsOpen = false
			this.chooseDateTimeMenuIsOpen = false
		},
	},
}
</script>

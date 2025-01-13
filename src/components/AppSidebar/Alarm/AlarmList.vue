<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="component">
		<div class="component__icon">
			<slot name="icon" />
		</div>
		<div class="component__items">
			<AlarmListItem v-for="(alarm, index) in alarmComponents"
				:key="index"
				:index="index"
				:alarm="alarm"
				:is-all-day="allDay"
				:is-read-only="readOnly"
				@update-alarm="updateAlarm"
				@remove-alarm="removeAlarm" />
			<div class="new">
				<div v-if="alarms.length === 0">
					<p>
						{{ t('tasks', 'No reminders') }}
					</p>
				</div>
				<AlarmListNew v-if="!readOnly"
					:has-start-date="hasStartDate"
					:has-due-date="hasDueDate"
					:is-all-day="allDay"
					@add-alarm="addAlarm" />
			</div>
		</div>
	</div>
</template>

<script>
import AlarmListNew from './AlarmListNew.vue'
import AlarmListItem from './AlarmListItem.vue'
import { mapAlarmComponentToAlarmObject } from '../../../models/alarm.js'

import { translate as t } from '@nextcloud/l10n'
import { AlarmComponent } from '@nextcloud/calendar-js'
import ICAL from 'ical.js'

export default {
	name: 'AlarmList',
	components: {
		AlarmListItem,
		AlarmListNew,
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
		readOnly: {
			type: Boolean,
			required: true,
		},
		allDay: {
			type: Boolean,
			required: true,
		},
		alarms: {
			type: Array,
			required: true,
		},
	},
	emits: [
		'add-alarm',
		'remove-alarm',
		'update-alarm',
	],
	computed: {
		alarmComponents() {
			return this.alarms.map((alarm) => {
				try {
					return mapAlarmComponentToAlarmObject(AlarmComponent.fromICALJs(alarm))
				} catch (e) {
					// Instead of breaking the whole page when parsing an invalid alarm,
					// we just print a warning on the console.
					console.warn(e)
					return false
				}
			}).filter(Boolean)
		},
	},
	methods: {
		t,

		/**
		 * Generates a valarm from an alarm-event
		 *
		 * @param {object} alarm The alarm time or duration
		 * @param {number|Date} alarm.value Value of the trigger
		 * @param {object|undefined} alarm.parameter Name and value of the trigger parameter
		 */
		generateVAlarm({ value, parameter }) {
			const valarm = {
				action: 'DISPLAY',
				// When the action is "DISPLAY", the alarm MUST also include a "DESCRIPTION" property
				description: t('tasks', 'This is an event reminder.'),
				repeat: 1,
				trigger: { value: undefined, parameter },
			}

			if (typeof value === 'number') {
				valarm.trigger.value = ICAL.Duration.fromSeconds(value)
			} else if (value instanceof Date) {
				valarm.trigger.value = ICAL.Time.fromJSDate(value, true)
			}

			return valarm
		},

		/**
		 * Adds an alarm to this event
		 *
		 * @param {object} alarm The alarm time or duration
		 */
		addAlarm(alarm) {
			this.$emit('add-alarm', this.generateVAlarm(alarm))
		},

		/**
		 * Removes an alarm from this event
		 *
		 * @param {object} alarm The alarm object
		 * @param {number} index This index of the updated alarm-item
		 */
		updateAlarm(alarm, index) {
			this.$emit('update-alarm', this.generateVAlarm(alarm), index)
		},

		/**
		 * Removes an alarm from this event
		 *
		 * @param {number} index The index of the alarm-list
		 */
		removeAlarm(index) {
			this.$emit('remove-alarm', index)
		},
	},
}
</script>

<style lang="scss" scoped>
.component {
	display: flex;
	border-bottom: 1px solid var(--color-border);
	width: 100%;
	color: var(--color-text-lighter);

	.component {
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

		&__items {
			display: flex;
			flex-direction: column;
			flex-grow: 1;
			gap: 4px;
			padding-inline-end: 4px;
			padding-block: 4px;
			overflow: auto;
			text-overflow: ellipsis;
			white-space: nowrap;

			.new {
				display: flex;
				align-items: center;
				justify-content: space-between;
				width: 100%;
				padding-block: 2px;
			}
		}
	}
}
</style>

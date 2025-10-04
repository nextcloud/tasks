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
			<AlarmListItem v-for="(alarm, index) in alarms"
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
					:has-start-date="!!startDate"
					:has-due-date="!!dueDate"
					:is-all-day="allDay"
					@add-alarm="addAlarm" />
			</div>
		</div>
		<AlarmRelationDeletionModal v-if="alarmRelationDeletionModalIsOpen"
			:alarms="relatedAlarms"
			@keep="keepAlarms"
			@discard="discardAlarms"
			@close="cancelAlarmsModal" />
	</div>
</template>

<script>
import AlarmListNew from './AlarmListNew.vue'
import AlarmListItem from './AlarmListItem.vue'

import { translate as t } from '@nextcloud/l10n'
import ICAL from 'ical.js'
import AlarmRelationDeletionModal from './AlarmRelationDeletionModal.vue'

export default {
	name: 'AlarmList',
	components: {
		AlarmRelationDeletionModal,
		AlarmListItem,
		AlarmListNew,
	},
	props: {
		startDate: {
			type: [Date, null],
			required: true,
		},
		dueDate: {
			type: [Date, null],
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
		'addAlarm',
		'removeAlarm',
		'updateAlarm',
	],
	data() {
		return {
			alarmRelationDeletionModalIsOpen: false,
			relatedAlarms: [],
		}
	},
	watch: {
		startDate(newStartDate) {
			this.openModalIfAlarmsAreRelated(newStartDate, true)
		},
		dueDate(newDueDate) {
			this.openModalIfAlarmsAreRelated(newDueDate, false)
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
				description: t('tasks', 'This is a todo reminder.'),
				// The "REPEAT" property is only valid in combination with a "DURATION" property
				repeat: 1,
				duration: 'PT10M',
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
			this.$emit('addAlarm', this.generateVAlarm(alarm))
		},

		/**
		 * Removes an alarm from this event
		 *
		 * @param {object} alarm The alarm object
		 * @param {number} index This index of the updated alarm-item
		 */
		updateAlarm(alarm, index) {
			this.$emit('updateAlarm', this.generateVAlarm(alarm), index)
		},

		/**
		 * Removes an alarm from this event
		 *
		 * @param {number} index The index of the alarm-list
		 */
		removeAlarm(index) {
			this.$emit('removeAlarm', index)
		},

		keepAlarms() {
			// TODO Implement
			this.completeRelationDeletionModal()
		},
		discardAlarms() {
			// TODO Implement
			this.completeRelationDeletionModal()
		},
		cancelAlarmsModal() {
			// TODO Restore date?
			this.completeRelationDeletionModal()
		},

		/**
		 * @param {Date|null} date The new date
		 * @param {boolean} isRelatedToStart If the date is related to the start
		 */
		openModalIfAlarmsAreRelated(date, isRelatedToStart) {
			const relatedAlarms = this.alarms.filter((alarm) => alarm.isRelative && (alarm.relativeIsRelatedToStart === isRelatedToStart))
			if (date === null && relatedAlarms.length > 0) {
				this.relatedAlarms = relatedAlarms
				this.alarmRelationDeletionModalIsOpen = true
			}
		},

		completeRelationDeletionModal() {
			this.alarmRelationDeletionModalIsOpen = false
			this.relatedAlarms = []
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
	padding: 0 6px;
	gap: 0 4px;

	.component {
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

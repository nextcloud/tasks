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
			@close="restoreRelatedDate" />
	</div>
</template>

<script>
import AlarmListNew from './AlarmListNew.vue'
import AlarmListItem from './AlarmListItem.vue'

import { translate as t } from '@nextcloud/l10n'
import ICAL from 'ical.js'
import AlarmRelationDeletionModal from './AlarmRelationDeletionModal.vue'
import { calculateAbsoluteDateFromRelativeTrigger } from '../../../utils/alarms.js'
import { toRaw } from 'vue'

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
		'restoreDate',
	],
	data() {
		return {
			alarmRelationDeletionModalIsOpen: false,
			relatedAlarms: [],
			relatedDate: null,
			relatedDateIsRelatedToStart: null,
		}
	},
	watch: {
		startDate(newDate, oldDate) {
			this.openModalIfAlarmsAreRelated(newDate, oldDate, true)
		},
		dueDate(newDueDate, oldDate) {
			this.openModalIfAlarmsAreRelated(newDueDate, oldDate, false)
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
		 * @param {number|number[]} indexes The indexes of the alarm-list
		 */
		removeAlarm(indexes) {
			this.$emit('removeAlarm', Array.isArray(indexes) ? indexes : [indexes])
		},

		/**
		 * Convert relative alarms to absolute alarms if related date is deleted
		 */
		keepAlarms() {
			this.relatedAlarms.forEach((relatedAlarm) => {
				const alarm = {
					value: calculateAbsoluteDateFromRelativeTrigger(this.relatedDate, relatedAlarm.alarm.relativeTrigger),
					parameter: undefined, // ical.js sets the correct parameter for us when using a `ICAL.Time`-object
				}
				this.updateAlarm(alarm, relatedAlarm.index)
			})
			this.completeRelationDeletionModal()
		},

		/**
		 * Discard all alarms if related date is deleted
		 */
		discardAlarms() {
			this.removeAlarm(this.relatedAlarms.map((relatedAlarm) => relatedAlarm.index))
			this.completeRelationDeletionModal()
		},

		/**
		 * Restore related date if modal was cancelled
		 */
		restoreRelatedDate() {
			this.$emit('restoreDate', this.relatedDate, this.relatedDateIsRelatedToStart)
			this.completeRelationDeletionModal()
		},

		/**
		 * @param {Date|null} newDate The new date
		 * @param {ICAL.Time|null} oldDate The old date
		 * @param {boolean} isRelatedToStart If the date is related to the start
		 */
		openModalIfAlarmsAreRelated(newDate, oldDate, isRelatedToStart) {
			const relatedAlarms = this.alarms.map((alarm, index) => {
				if (alarm.isRelative && (alarm.relativeIsRelatedToStart === isRelatedToStart)) {
					return { alarm, index }
				}
				return false
			}).filter(Boolean)

			if (newDate === null && relatedAlarms.length > 0) {
				this.relatedAlarms = relatedAlarms
				this.relatedDate = toRaw(oldDate).toJSDate()
				this.relatedDateIsRelatedToStart = isRelatedToStart
				this.alarmRelationDeletionModalIsOpen = true
			}
		},

		completeRelationDeletionModal() {
			this.alarmRelationDeletionModalIsOpen = false
			this.relatedAlarms = []
			this.relatedDate = null
			this.relatedDateIsRelatedToStart = null
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
				flex-wrap: wrap;
				gap: 6px;
				align-items: center;
				justify-content: space-between;
				width: 100%;
				padding-block: 2px;
			}
		}
	}
}
</style>

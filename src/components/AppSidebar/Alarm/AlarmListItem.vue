<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<!-- TODO UX would be way nicer if one could just click on the item and an edit-popup
		      would open with all options. On hover an x-button is visible for deletion. -->
	<div class="alarm-item">
		<div class="alarm-item__label" :title="formattedAlarm">
			{{ formattedAlarm }}
		</div>

		<div v-if="isEditing && !isRelativeAlarm">
			<AlarmDateTimePickerModal :original-date="alarm.absoluteDate"
				@select-date-time="onChooseAbsoluteDate"
				@close="closeEditMode" />
		</div>
		<div v-if="isEditing && isRelativeAlarm">
			<AlarmRelativeTimeTimePickerModal :original-alarm="alarm"
				:is-all-day="isAllDay"
				@select-date-time="onChooseRelativeTime"
				@close="closeEditMode" />
		</div>

		<div v-if="!isReadOnly"
			class="alarm-item__options">
			<NcActions :open="showMenu"
				@update:open="(open) => showMenu = open">
				<!-- Setting the alarm notification-type is not yet supported. -->
				<NcActionRadio v-if="isAlarmTypeDisplay"
					:name="alarmTypeName"
					:model-value="isAlarmTypeDisplay"
					:disabled="true">
					{{ t('tasks', 'Notification') }}
				</NcActionRadio>
				<NcActionRadio v-if="isAlarmTypeEmail"
					:name="alarmTypeName"
					:model-value="isAlarmTypeEmail"
					:disabled="true">
					{{ t('tasks', 'Email') }}
				</NcActionRadio>
				<NcActionRadio v-if="isAlarmTypeAudio"
					:name="alarmTypeName"
					:model-value="isAlarmTypeAudio"
					:disabled="true">
					{{ t('tasks', 'Audio notification') }}
				</NcActionRadio>
				<NcActionRadio v-if="isAlarmTypeOther"
					:name="alarmTypeName"
					:model-value="isAlarmTypeOther"
					:disabled="true">
					{{ t('tasks', 'Other notification') }}
				</NcActionRadio>

				<NcActionSeparator />

				<NcActionButton v-if="canEdit && !isEditing"
					@click.stop="toggleEditAlarm">
					<template #icon>
						<Pencil :size="20" decorative />
					</template>
					{{ t('tasks', 'Edit time') }}
				</NcActionButton>
				<NcActionButton @click="removeAlarm">
					<template #icon>
						<Delete :size="20" decorative />
					</template>
					{{ t('tasks', 'Remove reminder') }}
				</NcActionButton>
			</NcActions>
		</div>
	</div>
</template>

<script>
import AlarmDateTimePickerModal from './AlarmDateTimePickerModal.vue'
import { formatAlarm } from '../../../utils/dateStrings.js'

import {
	NcActions,
	NcActionButton,
	NcActionRadio,
	NcActionSeparator,
} from '@nextcloud/vue'
import Delete from 'vue-material-design-icons/Delete.vue'
import Pencil from 'vue-material-design-icons/Pencil.vue'

import { getCanonicalLocale, translate as t } from '@nextcloud/l10n'
import { vOnClickOutside as ClickOutside } from '@vueuse/components'
import AlarmRelativeTimeTimePickerModal from './AlarmRelativeTimePickerModal.vue'

export default {
	name: 'AlarmListItem',
	components: {
		AlarmDateTimePickerModal,
		AlarmRelativeTimeTimePickerModal,
		NcActions,
		NcActionButton,
		NcActionRadio,
		NcActionSeparator,
		Delete,
		Pencil,
	},
	directives: {
		ClickOutside,
	},
	props: {
		alarm: {
			type: Object,
			required: true,
		},
		index: {
			type: Number,
			required: true,
		},
		isAllDay: {
			type: Boolean,
			required: true,
		},
		isReadOnly: {
			type: Boolean,
			required: true,
		},
	},
	emits: [
		'remove-alarm',
		'update-alarm',
	],
	data() {
		return {
			isEditing: false,
			showMenu: false,
		}
	},
	computed: {
		locale() {
			return getCanonicalLocale().toLocaleLowerCase()
		},
		canEdit() {
			// You can always edit an alarm if it's absolute
			if (!this.isRelative) {
				return true
			}

			// We don't allow editing when the alarm is
			// related to the event's end
			if (!this.alarm.relativeIsRelatedToStart) {
				return false
			}

			// We don't allow editing when this event is timed
			// and the trigger time is positive
			if (!this.isAllDay && this.alarm.relativeTrigger > 0) {
				return false
			}

			// We don't allow editing when this event is all-day
			// and the trigger time is bigger than one day
			if (this.isAllDay && this.alarm.relativeTrigger > 86400) {
				return false
			}

			return true
		},

		alarmTypeName() {
			return this._uid + '-radio-type-name'
		},
		isAlarmTypeDisplay() {
			return this.alarm.type === 'DISPLAY'
		},
		isAlarmTypeEmail() {
			return this.alarm.type === 'EMAIL'
		},
		isAlarmTypeAudio() {
			return this.alarm.type === 'AUDIO'
		},
		isAlarmTypeOther() {
			return !['AUDIO', 'DISPLAY', 'EMAIL'].includes(this.alarm.type)
		},
		isRelativeAlarm() {
			return this.alarm.relativeTrigger !== null
		},
		currentUserTimezone() {
			return new Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
		},
		formattedAlarm() {
			return formatAlarm(this.alarm, this.isAllDay, this.currentUserTimezone, this.locale)
		},
	},
	methods: {
		t,

		/**
		 * This method enables the editing mode
		 */
		toggleEditAlarm() {
			this.isEditing = !this.isEditing

			// Hide menu when starting to edit
			if (this.isEditing) {
				this.showMenu = false
			}
		},

		onChooseAbsoluteDate(date) {
			const alarm = {
				value: date,
				parameter: undefined, // ical.js sets the correct parameter for us when using a `ICAL.Time`-object
			}

			this.$emit('update-alarm', alarm, this.index)
			this.closeEditMode()
		},

		onChooseRelativeTime(updatedAlarm) {
			const alarm = {
				value: updatedAlarm.relativeTrigger,
				parameter: undefined, // We don't care about the params, since they currently can't be changed
			}

			this.$emit('update-alarm', alarm, this.index)
			this.closeEditMode()
		},

		closeEditMode() {
			this.isEditing = false
		},

		/**
		 * This method emits the removeAlarm event
		 */
		removeAlarm() {
			this.$emit('remove-alarm', this.index)
			this.showMenu = false
		},
	},
}
</script>

<style lang="scss" scoped>
.alarm-item {
	display: flex;
	align-items: flex-start;

	&__label {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		align-self: center;
	}

	&__options {
		margin-left: auto;
		display: flex;
		align-items: center;
		white-space: nowrap;
	}

	&__edit--all-day__time {
		display: flex;
	}
}
</style>

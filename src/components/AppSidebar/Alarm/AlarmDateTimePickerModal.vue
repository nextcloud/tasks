<template>
	<NcModal @close="onClose()">
		<div class="content">
			<h3 class="content__heading">
				<template v-if="isNewAlarm">
					{{ t('tasks', 'Create reminder') }}
				</template>
				<template v-else>
					{{ t('tasks', 'Update reminder') }}
				</template>
			</h3>
			<NcDateTimePickerNative id="alarm-date-time-picker"
				v-model="date"
				type="datetime-local"
				:label="t('tasks', 'Set a reminder at a custom date and time:')" />
			<div class="content__buttons">
				<NcButton @click="onClose()">
					{{ t('tasks', 'Cancel') }}
				</NcButton>
				<NcButton type="primary" @click="onSelectDateTime(date)">
					<template v-if="isNewAlarm">
						{{ t('tasks', 'Create reminder') }}
					</template>
					<template v-else>
						{{ t('tasks', 'Update reminder') }}
					</template>
				</NcButton>
			</div>
		</div>
	</NcModal>
</template>

<script>
import { convertTimeZone, getDefaultAbsoluteAlarms } from '../../../utils/alarms.js'
import { translate as t } from '@nextcloud/l10n'
import { NcButton, NcDateTimePickerNative, NcModal } from '@nextcloud/vue'

export default {
	name: 'AlarmDateTimePickerModal',
	components: {
		NcButton,
		NcDateTimePickerNative,
		NcModal,
	},
	props: {
		originalDate: {
			type: Date,
			default: undefined,
		},
	},
	emits: [
		'select-date-time',
		'close',
	],
	data() {
		return {
			date: (this.originalDate && convertTimeZone(this.originalDate)) || this.defaultAbsoluteAlarm(),
			isNewAlarm: !this.originalDate,
		}
	},
	methods: {
		t,

		defaultAbsoluteAlarm() {
			const timeZone = new Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
			const alarms = getDefaultAbsoluteAlarms(timeZone)

			return alarms[0]
		},

		onSelectDateTime(date) {
			this.$emit('select-date-time', date)
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
}
</style>

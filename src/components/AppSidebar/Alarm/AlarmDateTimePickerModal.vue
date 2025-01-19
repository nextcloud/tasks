<template>
	<NcModal @close="onClose()">
		<form class="content" @submit.prevent="onSubmit">
			<h3 class="content__heading">
				<template v-if="isNewAlarm">
					{{ t('tasks', 'Create reminder') }}
				</template>
				<template v-else>
					{{ t('tasks', 'Update reminder') }}
				</template>
			</h3>
			<div class="content__form">
				<NcDateTimePickerNative id="alarm-date-time-picker"
					v-model="date"
					type="datetime-local"
					required
					:label="t('tasks', 'Set a reminder at a custom date and time:')" />
			</div>
			<div class="content__buttons">
				<NcButton @click="onClose()">
					{{ t('tasks', 'Cancel') }}
				</NcButton>
				<NcButton type="primary" native-type="submit">
					<template v-if="isNewAlarm">
						{{ t('tasks', 'Create reminder') }}
					</template>
					<template v-else>
						{{ t('tasks', 'Update reminder') }}
					</template>
				</NcButton>
			</div>
		</form>
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
		'selectDateTime',
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

		onSubmit() {
			this.$emit('selectDateTime', this.date)
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

	&__form {
		// TODO This should be part of the `NcDateTimePickerNative` component
		:deep(input) {
			&:invalid {
				border-color: var(--color-error) !important; // Override hover border color
				&:focus-visible {
					box-shadow: rgb(248, 250, 252) 0px 0px 0px 2px, var(--color-primary-element) 0px 0px 0px 4px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px
				}
			}
		}
	}
}
</style>

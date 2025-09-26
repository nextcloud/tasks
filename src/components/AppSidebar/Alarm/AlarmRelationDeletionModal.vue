<template>
	<NcModal @close="onClose()">
		<form class="content" @submit.prevent="onSubmit">
			<h3 class="content__heading">
				{{ t('tasks', 'Do you want to keep related reminders?') }}
			</h3>
			<p>
				{{ t(
					'tasks',
					'This task has {alarms}. Would you like to keep them?',
					{
						alarms: n('tasks', '%n alarm', '%n alarms', alarms.length)
					}
				) }}
			</p>
			<div class="content__buttons">
				<NcButton @click="onClose()">
					{{ t('tasks', 'Cancel') }}
				</NcButton>
				<NcButton variant="warning" @click="onDiscard()">
					{{ t('tasks', 'Discard reminders') }}
				</NcButton>
				<NcButton variant="primary" type="submit">
					{{ t('tasks', 'Keep reminders') }}
				</NcButton>
			</div>
		</form>
	</NcModal>
</template>

<script>
import { translate as t } from '@nextcloud/l10n'
import { NcButton, NcModal } from '@nextcloud/vue'

export default {
	name: 'AlarmRelationDeletionModal',
	components: {
		NcButton,
		NcModal,
	},
	props: {
		alarms: {
			type: Array,
			default: () => [],
		},
	},
	emits: [
		'close',
		'discard',
		'keep',
	],
	methods: {
		t,
		n,

		onSubmit() {
			this.$emit('keep', this.alarms)
		},

		onDiscard() {
			this.$emit('discard', this.alarms)
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

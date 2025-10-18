<template>
	<NcModal @close="onClose()">
		<form class="content" @submit.prevent="onSubmit">
			<h3 class="content__heading">
				{{ t('tasks', 'Do you want to keep related reminders?') }}
			</h3>
			<p>
				{{ n(
					'tasks',
					'This task has %n reminder. Would you like to keep it?',
					'This task has %n reminders. Would you like to keep them?',
					alarms.length
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
			this.$emit('keep')
		},

		onDiscard() {
			this.$emit('discard')
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
		margin-top: 28px;
		justify-content: flex-end;
	}
}
</style>

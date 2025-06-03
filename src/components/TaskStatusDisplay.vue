<!--
Nextcloud - Tasks

@author Raimund Schlüßler
@copyright 2023 Raimund Schlüßler <raimund.schluessler@mailbox.org>

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
License as published by the Free Software Foundation; either
version 3 of the License, or any later version.

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU AFFERO GENERAL PUBLIC LICENSE for more details.

You should have received a copy of the GNU Affero General Public
License along with this library. If not, see <http://www.gnu.org/licenses/>.

-->

<template>
	<NcButton v-if="status"
		:title="status.message"
		:disabled="isDisabled"
		type="tertiary"
		:aria-label="status.message"
		@click="statusClicked">
		<template #icon>
			<AlertCircleOutline v-if="status.status==='error'" :size="20" class="status--error" />
			<Check v-if="status.status==='success'" :size="20" class="status--success" />
			<NcLoadingIcon v-if="status.status==='sync'" :size="20" class="status--sync" />
			<SyncAlert v-if="status.status==='conflict'" :size="20" class="status--conflict" />
		</template>
	</NcButton>
</template>

<script>
import NcButton from '@nextcloud/vue/components/NcButton'
import NcLoadingIcon from '@nextcloud/vue/components/NcLoadingIcon'

import AlertCircleOutline from 'vue-material-design-icons/AlertCircleOutline.vue'
import Check from 'vue-material-design-icons/Check.vue'
import SyncAlert from 'vue-material-design-icons/SyncAlert.vue'

export default {
	name: 'TaskStatusDisplay',
	components: {
		NcButton,
		NcLoadingIcon,
		AlertCircleOutline,
		Check,
		SyncAlert,
	},
	props: {
		status: {
			type: Object,
			default: null,
		},
	},
	emits: [
		'statusClicked',
		'resetStatus',
	],
	data() {
		return {
			resetStatusTimeout: null,
		}
	},
	computed: {
		isDisabled() {
			return this.status.status !== 'conflict'
		},
	},
	watch: {
		status(newStatus) {
			this.checkTimeout(newStatus)
		},
	},
	mounted() {
		this.checkTimeout(this.status)
	},
	methods: {
		statusClicked() {
			this.$emit('statusClicked')
		},
		checkTimeout(newStatus) {
			if (newStatus) {
				if (this.resetStatusTimeout) {
					clearTimeout(this.resetStatusTimeout)
				}
				if (newStatus.status === 'success') {
					this.resetStatusTimeout = setTimeout(
						() => {
							this.$emit('resetStatus')
						}, 5000,
					)
				}
			}
		},
	},
}
</script>

<style lang="scss" scoped>
.button-vue {
	&:disabled {
		opacity: 1 !important;
	}
	.status {
		&--error {
			color: var(--color-error);
		}
		&--success {
			color: var(--color-success);
		}
		&--conflict svg {
			animation-iteration-count: infinite;
			animation-duration: 1s;
			animation-name: pulse;
			border-radius: 50%;
		}
	}
}
@keyframes pulse {
	0% {
		box-shadow: 0 0 0 0 rgba(50, 50, 50, .4);
	}
	70% {
		box-shadow: 0 0 0 10px rgba(50, 50, 50, 0);
	}
	100% {
		box-shadow: 0 0 0 0 rgba(50, 50, 50, 0);
	}
}
</style>

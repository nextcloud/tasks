<!--
@copyright Copyright (c) 2018 Team Popcorn <teampopcornberlin@gmail.com>

@author Team Popcorn <teampopcornberlin@gmail.com>
@author Raimund Schlüßler <raimund.schluessler@mailbox.org>

@copyright Copyright (c) 2020 Georg Ehrke <oc.list@georgehrke.com>
@author Georg Ehrke <oc.list@georgehrke.com>

@license GNU Affero General Public License v3.0 or later

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.

-->

<template>
	<NcAppNavigationItem :title="sharee.displayName" force-display-actions>
		<template #icon>
			<AccountMultiple v-if="sharee.isGroup"
				:size="18"
				class="avatar" />
			<div v-else-if="sharee.isCircle" class="avatar icon-circles" />
			<NcAvatar v-else
				:user="sharee.id"
				:display-name="sharee.displayName"
				:disable-menu="true" />
		</template>

		<template #counter>
			<NcActionCheckbox :disabled="loading"
				:checked="writeable"
				@update:checked="editSharee">
				{{ t('tasks', 'Can edit') }}
			</NcActionCheckbox>
		</template>

		<template #actions>
			<NcActionButton :disabled="loading"
				@click.prevent.stop="deleteSharee">
				<template #icon>
					<Delete :size="20" />
				</template>
				{{ t('tasks', 'Unshare with {displayName}', { displayName: sharee.displayName }) }}
			</NcActionButton>
		</template>
	</NcAppNavigationItem>
</template>

<script>
import { showError } from '@nextcloud/dialogs'
import { translate as t } from '@nextcloud/l10n'
import { NcActionButton, NcActionCheckbox, NcAppNavigationItem, NcAvatar } from '@nextcloud/vue'

import AccountMultiple from 'vue-material-design-icons/AccountMultiple.vue'
import Delete from 'vue-material-design-icons/Delete.vue'

export default {
	name: 'CalendarSharee',
	components: {
		NcActionButton,
		NcActionCheckbox,
		NcAppNavigationItem,
		NcAvatar,
		AccountMultiple,
		Delete,
	},
	props: {
		calendar: {
			type: Object,
			required: true,
		},
		sharee: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			loading: false,
		}
	},
	computed: {
		writeable() {
			return this.sharee.writeable
		},
		// generated id for this sharee
		uid() {
			return this.sharee.id + this.calendar.id + Math.floor(Math.random() * 1000)
		},
	},
	methods: {
		t,

		async deleteSharee() {
			if (this.loading) {
				return false
			}
			this.loading = true
			try {
				await this.$store.dispatch('removeSharee', {
					calendar: this.calendar,
					uri: this.sharee.uri,
				})
			} catch (error) {
				console.error(error)
				showError(t('tasks', 'Unable to delete the share.'))
			} finally {
				this.loading = false
			}
		},
		async editSharee() {
			if (this.loading) {
				return false
			}
			this.loading = true
			try {
				await this.$store.dispatch('toggleShareeWritable', {
					calendar: this.calendar,
					uri: this.sharee.uri,
					writeable: !this.sharee.writeable,
				})
			} catch (error) {
				console.error(error)
				showError(t('tasks', 'Unable to change permissions.'))
			} finally {
				this.loading = false
			}
		},
	},
}
</script>

<style lang="scss" scoped>
.app-navigation-entry .avatar {
	width: 32px;
	height: 32px;
	background-color: var(--color-border-dark);
	background-size: 16px;
}
</style>

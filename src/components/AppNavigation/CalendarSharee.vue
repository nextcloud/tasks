<!--
@copyright Copyright (c) 2018 Team Popcorn <teampopcornberlin@gmail.com>

@author Team Popcorn <teampopcornberlin@gmail.com>
@author Raimund Schlüßler <raimund.schluessler@mailbox.org>

@copyright Copyright (c) 2020 Georg Ehrke <oc.list@georgehrke.com>
@author Georg Ehrke <oc.list@georgehrke.com>

@license GNU AGPL version 3 or any later version

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
	<AppNavigationItem
		:title="sharee.displayName">
		<template slot="icon">
			<div v-if="sharee.isGroup" class="avatar icon-group" />
			<div v-else-if="sharee.isCircle" class="avatar icon-circle" />
			<Avatar v-else
				:user="sharee.id"
				:display-name="sharee.displayName"
				:disable-menu="true" />
		</template>

		<template slot="counter">
			<ActionCheckbox
				:disabled="loading"
				:checked="writeable"
				@update:checked="editSharee">
				{{ $t('tasks', 'can edit') }}
			</ActionCheckbox>
		</template>

		<template slot="actions">
			<ActionButton
				:disabled="loading"
				@click.prevent.stop="deleteSharee">
				<Delete slot="icon" :size="24" decorative />
				{{ $t('tasks', 'Unshare with {displayName}', { displayName: sharee.displayName }) }}
			</ActionButton>
		</template>
	</AppNavigationItem>
</template>

<script>
import { showError } from '@nextcloud/dialogs'
import ActionButton from '@nextcloud/vue/dist/Components/ActionButton'
import ActionCheckbox from '@nextcloud/vue/dist/Components/ActionCheckbox'
import AppNavigationItem from '@nextcloud/vue/dist/Components/AppNavigationItem'
import Avatar from '@nextcloud/vue/dist/Components/Avatar'

import Delete from 'vue-material-design-icons/Delete.vue'

export default {
	name: 'CalendarSharee',
	components: {
		ActionButton,
		ActionCheckbox,
		AppNavigationItem,
		Avatar,
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
				showError(this.$t('tasks', 'Unable to delete the share.'))
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
				showError(this.$t('tasks', 'Unable to change permissions.'))
			} finally {
				this.loading = false
			}
		},
	},
}
</script>

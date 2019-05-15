<!--
@copyright Copyright (c) 2018 Team Popcorn <teampopcornberlin@gmail.com>

@author Team Popcorn <teampopcornberlin@gmail.com>
@author Raimund Schlüßler <raimund.schluessler@mailbox.org>

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
	<li class="calendar-sharee">
		<span :class="{
			'icon-loading-small': loading,
			'icon-group': sharee.isGroup && !loading,
			'icon-user': !sharee.isGroup && !loading
		}" class="icon"
		/>
		<span class="calendar-sharee__identifier">
			{{ sharee.displayName }}
		</span>
		<span class="calendar-sharee__utils">
			<input
				:id="uid"
				:checked="writeable"
				:disabled="loading"
				class="checkbox"
				name="editable"
				type="checkbox"
				@change="editSharee"
			>
			<label :for="uid">
				{{ t('tasks', 'can edit') }}
			</label>
			<a :class="{'calendar-sharee__utils--disabled': loading}" href="#"
				title="Delete"
				class="icon-delete"
				@click="deleteSharee"
			/>
		</span>
	</li>
</template>

<script>

export default {
	name: 'ShareSharee',

	props: {
		calendar: {
			type: Object,
			required: true
		},
		sharee: {
			type: Object,
			required: true
		}
	},

	data() {
		return {
			loading: false
		}
	},

	computed: {
		writeable() {
			return this.sharee.writeable
		},
		// generated id for this sharee
		uid() {
			return this.sharee.id + this.calendar.id + Math.floor(Math.random() * 1000)
		}
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
					uri: this.sharee.uri
				})
			} catch (error) {
				console.error(error)
				OC.Notification.showTemporary(t('tasks', 'Unable to delete the share.'))
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
					writeable: !this.sharee.writeable
				})
			} catch (error) {
				console.error(error)
				OC.Notification.showTemporary(t('tasks', 'Unable to change permissions.'))
			} finally {
				this.loading = false
			}
		}
	}
}
</script>

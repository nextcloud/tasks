<!--
Nextcloud - Tasks

@author Raimund Schlüßler
@copyright 2018 Raimund Schlüßler <raimund.schluessler@mailbox.org>

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
License as published by the Free Software Foundation; either
version 3 of the License, or any later version.

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU AFFERO GENERAL PUBLIC LICENSE for more details.

You should have received a copy of the GNU Affero General Public
License along with this library.  If not, see <http://www.gnu.org/licenses/>.

-->

<template>
	<div v-if="status"
		v-tooltip="{
			content: status.message,
			html: true
		}"
		class="status-display"
		:class="status.cssClass"
		@click="react" />
</template>

<script>

export default {
	name: 'TaskStatusDisplay',
	props: {
		task: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			resetStatusTimeout: null,
		}
	},
	computed: {
		status() {
			return this.task.syncstatus
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
		react() {
			// Prevent event dispatching if action is null (e.g. successful store)
			if (this.status.action === null) {
				return
			}

			this.$store.dispatch(this.status.action, { task: this.task, etag: this.conflict })
				.then(() => {
					this.task.conflict = false
				})
		},
		checkTimeout(newStatus) {
			if (newStatus) {
				if (this.resetStatusTimeout) {
					clearTimeout(this.resetStatusTimeout)
				}
				if (newStatus.duration > 0) {
					this.resetStatusTimeout = setTimeout(() => { this.task.syncstatus = null }, this.status.duration)
				}
			}
		},
	},
}
</script>

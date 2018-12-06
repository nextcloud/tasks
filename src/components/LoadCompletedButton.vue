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
	<div v-show="loadedCompleted" class="loadmore">
		<span @click="loadCompletedTasks">
			{{ t('tasks', 'Load remaining completed tasks.') }}
		</span>
	</div>
</template>

<script>

export default {
	props: {
		calendar: {
			type: Object,
			required: true
		}
	},
	computed: {
		loadedCompleted() {
			// TODO: Query the store if the completed tasks where already loaded for calendar "this.calendar"
			return false
		}
	},
	methods: {
		loadCompletedTasks() {
			// TODO: Load completed tasks for calendar "this.calendar"
		}
	}
}
</script>

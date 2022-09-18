<!--
Nextcloud - Tasks

@author Raimund Schlüßler
@copyright 2021 Raimund Schlüßler <raimund.schluessler@mailbox.org>

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
	<div class="header">
		<div v-if="$route.params.collectionId !== 'completed' && calendar && !calendar.readOnly"
			class="header__input">
			<form @submit.prevent="addTask">
				<Plus :size="20" />
				<input v-model="newTaskName"
					:placeholder="placeholder"
					autocomplete="off"
					class="transparent reactive"
					@keyup.27="clearNewTask($event)">
			</form>
		</div>
		<SortorderDropdown />
	</div>
</template>

<script>
import SortorderDropdown from './SortorderDropdown.vue'

import { translate as t } from '@nextcloud/l10n'
import moment from '@nextcloud/moment'

import Plus from 'vue-material-design-icons/Plus.vue'

import { mapGetters, mapActions } from 'vuex'

export default {
	components: {
		SortorderDropdown,
		Plus,
	},
	data() {
		return {
			newTaskName: '',
		}
	},
	computed: {
		...mapGetters({
			calendar: 'getCalendarByRoute',
		}),

		placeholder() {
			switch (this.$route.params.collectionId) {
			case 'starred':
				return t('tasks', 'Add an important task to "{calendar}"…', { calendar: this.calendar.displayName }, undefined, { sanitize: false, escape: false })
			case 'week':
			case 'today':
				return t('tasks', 'Add a task due today to "{calendar}"…', { calendar: this.calendar.displayName }, undefined, { sanitize: false, escape: false })
			case 'current':
				return t('tasks', 'Add a current task to "{calendar}"…', { calendar: this.calendar.displayName }, undefined, { sanitize: false, escape: false })
			default:
				return t('tasks', 'Add a task to "{calendar}"…', { calendar: this.calendar.displayName }, undefined, { sanitize: false, escape: false })
			}
		},
	},
	methods: {
		...mapActions([
			'createTask',
		]),

		clearNewTask(event) {
			event.target.blur()
			this.newTaskName = ''
		},

		addTask() {
			const task = { summary: this.newTaskName }

			// If the task is created in the calendar view,
			// we set the current calendar
			if (this.$route.params.calendarId) {
				task.calendar = this.calendar
			}

			// If the task is created in a collection view,
			// set the appropriate properties.
			if (this.$route.params.collectionId === 'starred') {
				task.priority = 1
			}
			if (this.$route.params.collectionId === 'today'
				|| this.$route.params.collectionId === 'week') {
				task.due = moment().startOf('day').format('YYYY-MM-DDTHH:mm:ss')
				task.allDay = this.$store.state.settings.settings.allDay
			}
			if (this.$route.params.collectionId === 'current') {
				task.start = moment().format('YYYY-MM-DDTHH:mm:ss')
			}

			this.createTask(task)
			this.newTaskName = ''
		},
	},
}
</script>

<style lang="scss" scoped>
// mobile breakpoint
$breakpoint-mobile: 1024px;

.header {
	padding: 12px 15px 12px 59px;
	position: sticky;
	top: 50px;
	background-color: var(--color-background-dark);
	z-index: 1000;
	display: flex;

	@media only screen and (max-width: $breakpoint-mobile) {
		padding-right: 0;
		padding-left: 44px;
	}

	&__input {
		position: relative;
		width: calc(100% - 44px);

		.material-design-icon {
			position: absolute;
			padding: 12px;
		}

		input {
			box-shadow: 0 0 1px var(--color-box-shadow);
			border: medium none !important;
			box-sizing: border-box;
			color: var(--color-main-text);
			cursor: text;
			font-size: 100%;
			margin: 0;
			padding: 0 15px 0 44px;
			width: 100%;
			min-height: 44px;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
			outline: none;
			border-radius: var(--border-radius);
		}
	}

	.sortorder {
		margin-left: auto;
	}
}
</style>

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
	<AppNavigationItem
		:id="'list_' + calendar.id"
		v-click-outside="resetView"
		:calendar-id="calendar.id"
		:to="{ name: 'calendars', params: { calendarId: calendar.id } }"
		:title="calendar.displayName"
		:class="{edit: editing}"
		class="list reactive"
		@add="dropTaskOnCalendar(...arguments, calendar)">
		<AppNavigationIconBullet slot="icon" :color="calendar.color" />

		<template slot="counter">
			<AppNavigationCounter>
				{{ calendarCount(calendar.id) | counterFormatter }}
			</AppNavigationCounter>
			<Actions v-if="!calendar.readOnly">
				<ActionButton
					:icon="sharingIconClass"
					@click="toggleShare">
					{{ sharedWithTooltip }}
				</ActionButton>
			</Actions>
			<Avatar v-if="calendar.isSharedWithMe && calendar.loadedOwnerPrincipal" :user="calendar.ownerUserId" :display-name="calendar.ownerDisplayname" />
			<div v-if="calendar.isSharedWithMe && !calendar.loadedOwnerPrincipal" class="icon icon-loading" />
		</template>

		<template slot="actions">
			<ActionButton
				v-if="!calendar.readOnly"
				icon="icon-rename"
				@click="editCalendar">
				{{ $t('tasks', 'Edit') }}
			</ActionButton>
			<ActionButton
				icon="icon-public"
				:close-after-click="true"
				@click="copyCalDAVUrl($event, calendar)">
				{{ !copied
					? $t('tasks', 'Copy private link')
					: copySuccess
						? $t('tasks', 'Copied')
						: $t('tasks', 'Can not copy') }}
			</ActionButton>
			<ActionLink
				icon="icon-download"
				:close-after-click="true"
				:href="exportUrl">
				{{ $t('tasks', 'Download') }}
			</ActionLink>
			<ActionButton
				v-if="!calendar.readOnly"
				v-tooltip="{
					placement: 'left',
					boundariesElement: 'body',
					content: deleteMessage
				}"
				icon="icon-delete"
				@click="deleteCalendar">
				{{ !calendar.isSharedWithMe ? $t('calendar', 'Delete') : $t('calendar', 'Unshare') }}
			</ActionButton>
		</template>

		<ShareCalendar v-if="shareOpen && !calendar.readOnly" :calendar="calendar" />

		<div :class="{error: nameError}" class="app-navigation-entry-edit">
			<form>
				<input v-model="newCalendarName"
					v-tooltip="{
						content: tooltipMessage,
						show: showTooltip('list_' + calendar.id),
						trigger: 'manual'
					}"
					class="edit"
					type="text"
					@keyup="checkName($event, calendar, save)">
				<input :title="$t('tasks', 'Cancel')"
					type="cancel"
					value=""
					class="action icon-close"
					@click="resetView">
				<input :title="$t('tasks', 'Save')"
					type="button"
					value=""
					class="action icon-checkmark"
					@click="save(calendar)">
			</form>
			<Colorpicker :selected-color="selectedColor" @color-selected="setColor(...arguments)" />
		</div>
	</AppNavigationItem>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Colorpicker from './Colorpicker'
import ShareCalendar from './CalendarShare'

import ClickOutside from 'vue-click-outside'
import AppNavigationItem from '@nextcloud/vue/dist/Components/AppNavigationItem'
import AppNavigationCounter from '@nextcloud/vue/dist/Components/AppNavigationCounter'
import AppNavigationIconBullet from '@nextcloud/vue/dist/Components/AppNavigationIconBullet'
import Actions from '@nextcloud/vue/dist/Components/Actions'
import ActionButton from '@nextcloud/vue/dist/Components/ActionButton'
import ActionLink from '@nextcloud/vue/dist/Components/ActionLink'

export default {
	components: {
		Colorpicker,
		ShareCalendar,
		AppNavigationItem,
		AppNavigationCounter,
		AppNavigationIconBullet,
		Actions,
		ActionButton,
		ActionLink,
	},
	directives: {
		ClickOutside,
	},
	filters: {
		counterFormatter: function(count) {
			switch (false) {
			case count !== 0:
				return ''
			case count < 999:
				return '999+'
			default:
				return count
			}
		},
	},
	props: {
		calendar: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			editing: false,
			shareOpen: false,
			copySuccess: false,
			copied: false,
			nameError: false,
			newCalendarName: '',
			selectedColor: '',
			tooltipMessage: '',
			tooltipTarget: '',
		}
	},
	computed: {
		...mapGetters({
			calendarCount: 'getCalendarCount',
			isCalendarNameUsed: 'isCalendarNameUsed',
			getTask: 'getTaskByUri',
		}),

		deleteMessage() {
			return !this.calendar.isSharedWithMe
				? this.$t('tasks', 'This will delete the calendar "{calendar}" and all corresponding events and tasks.', { calendar: this.calendar.displayName })
				: this.$t('tasks', 'This will unshare the calendar "{calendar}".', { calendar: this.calendar.displayName })
		},
		sharingIconClass() {
			if (this.calendar.shares.length) {
				return 'icon-shared'
			}
			return 'icon-share'
		},
		exportUrl() {
			let url = this.calendar.url
			// cut off last slash to have a fancy name for the ics
			if (url.slice(url.length - 1) === '/') {
				url = url.slice(0, url.length - 1)
			}
			url += '?export'
			return url
		},
		url() {
			const rootURL = this.$OC.linkToRemote('dav')
			return new URL(this.calendar.url, rootURL)
		},
		hasShares() {
			return this.calendar.shares.length > 0
		},
		// info tooltip about number of shares
		sharedWithTooltip() {
			return this.hasShares
				? this.$n('tasks',
					'Shared with {num} entity',
					'Shared with {num} entities',
					this.calendar.shares.length, {
						num: this.calendar.shares.length,
					})
				: '' // disable the tooltip
		},
	},
	methods: {
		...mapActions([
			'changeCalendar',
			'deleteCalendar',
			'moveTask',
		]),
		dropTaskOnCalendar: function($event, calendar) {
			let task
			const taskAttribute = $event.item.attributes['task-id']
			if (taskAttribute) {
				task = this.getTask(taskAttribute.value)
				if (calendar !== task.calendar) {
					this.moveTask({ task: task, calendar: calendar, parent: undefined })
				}
			}
		},
		showTooltip: function(target) {
			return this.tooltipTarget === target
		},
		editCalendar() {
			this.editing = true
			this.newCalendarName = this.calendar.displayName
			this.selectedColor = this.calendar.color
			this.nameError = false
			this.tooltipTarget = ''
			this.$nextTick(
				() => document.querySelector('#list_' + this.calendar.id + ' input.edit').focus()
			)
		},

		/**
		 * Toggles the visibility of the share menu
		 */
		toggleShare() {
			this.shareOpen = !this.shareOpen
		},
		resetView($event) {
			this.editing = false
			this.shareOpen = false
			this.tooltipTarget = ''
		},
		copyCalDAVUrl(event) {
			// change to loading status
			event.stopPropagation()

			const url = this.url

			// copy link for calendar to clipboard
			this.$copyText(url)
				.then(e => {
					event.preventDefault()
					this.copySuccess = true
					this.copied = true
					// Notify calendar url was copied
					this.$OC.Notification.showTemporary(this.$t('tasks', 'Calendar link copied to clipboard.'))
				}, e => {
					this.copySuccess = false
					this.copied = true
					this.$OC.Notification.showTemporary(this.$t('tasks', 'Calendar link could not be copied to clipboard.'))
				}).then(() => {
					setTimeout(() => {
						// stop loading status regardless of outcome
						this.copied = false
					}, 2000)
				})
		},
		setColor: function(color) {
			this.selectedColor = color
		},
		save() {
			if (!this.isNameAllowed(this.newCalendarName, this.calendar.id).allowed) {
				return
			}
			this.changeCalendar({ calendar: this.calendar, newName: this.newCalendarName, newColor: this.selectedColor })
			this.editing = false
		},
		checkName: function(event, calendar, callback) {
			const calendarId = calendar ? calendar.id : ''
			const check = this.isNameAllowed(this.newCalendarName, calendarId)
			this.tooltipMessage = check.msg
			if (!check.allowed) {
				this.tooltipTarget = 'list_' + calendarId
				this.nameError = true
			} else {
				this.tooltipTarget = ''
				this.nameError = false
			}
			if (event.keyCode === 13) {
				callback(calendar)
			}
			if (event.keyCode === 27) {
				event.preventDefault()
				this.tooltipTarget = ''
				this.creating = false
				this.editing = false
				this.nameError = false
			}
		},
		isNameAllowed: function(name, id) {
			const check = {
				allowed: false,
				msg: '',
			}
			if (this.isCalendarNameUsed(name, id)) {
				check.msg = this.$t('tasks', 'The name "{calendar}" is already used.', { calendar: name })
			} else if (!name) {
				check.msg = this.$t('tasks', 'An empty name is not allowed.')
			} else {
				check.allowed = true
			}
			return check
		},
	},
}
</script>

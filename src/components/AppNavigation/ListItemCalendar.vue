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
		v-click-outside="{ handler: resetView, middleware: clickOutsideMiddleware }"
		:calendar-id="calendar.id"
		:to="{ name: 'calendars', params: { calendarId: calendar.id } }"
		:title="calendar.displayName"
		:class="{edit: editing, deleted: !!deleteTimeout}"
		class="list reactive"
		@drop.native="dropTask"
		@dragover.native="dragOver"
		@dragenter.native="dragEnter"
		@dragleave.native="dragLeave">
		<AppNavigationIconBullet slot="icon" :color="calendar.color" />

		<template v-if="!deleteTimeout" slot="counter">
			<Actions v-if="calendar.canBeShared">
				<ActionButton
					:icon="sharingIconClass"
					@click="toggleShare">
					{{ sharedWithTooltip }}
				</ActionButton>
			</Actions>
			<Avatar v-if="calendar.isSharedWithMe && loadedOwnerPrincipal" :user="ownerUserId" :display-name="ownerDisplayname" />
			<div v-if="calendar.isSharedWithMe && !loadedOwnerPrincipal" class="icon icon-loading" />
			<AppNavigationCounter v-if="calendarCount">
				{{ calendarCount | counterFormatter }}
			</AppNavigationCounter>
		</template>

		<template v-if="!deleteTimeout" slot="actions">
			<ActionButton
				v-if="!calendar.readOnly"
				icon="icon-rename"
				class="edit-calendar"
				:close-after-click="true"
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
				v-tooltip="{
					placement: 'left',
					boundariesElement: 'body',
					content: deleteMessage
				}"
				:icon="calendar.isSharedWithMe ? 'icon-close' : 'icon-delete'"
				@click="scheduleDelete">
				{{ !calendar.isSharedWithMe ? $t('tasks', 'Delete') : $t('tasks', 'Unshare') }}
			</ActionButton>
		</template>

		<template v-if="!!deleteTimeout" slot="actions">
			<ActionButton
				icon="icon-history"
				@click.prevent.stop="cancelDelete">
				{{ undoDeleteMessage }}
			</ActionButton>
		</template>

		<ShareCalendar v-if="shareOpen && !calendar.readOnly && !deleteTimeout" :calendar="calendar" />

		<div v-if="!deleteTimeout" :class="{error: nameError}" class="app-navigation-entry-edit">
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

import ClickOutside from 'v-click-outside'
import Avatar from '@nextcloud/vue/dist/Components/Avatar'
import AppNavigationItem from '@nextcloud/vue/dist/Components/AppNavigationItem'
import AppNavigationCounter from '@nextcloud/vue/dist/Components/AppNavigationCounter'
import AppNavigationIconBullet from '@nextcloud/vue/dist/Components/AppNavigationIconBullet'
import Actions from '@nextcloud/vue/dist/Components/Actions'
import ActionButton from '@nextcloud/vue/dist/Components/ActionButton'
import ActionLink from '@nextcloud/vue/dist/Components/ActionLink'
import { generateRemoteUrl } from '@nextcloud/router'
import { showSuccess, showError } from '@nextcloud/dialogs'

const CD_DURATION = 7

export default {
	components: {
		Colorpicker,
		ShareCalendar,
		Avatar,
		AppNavigationItem,
		AppNavigationCounter,
		AppNavigationIconBullet,
		Actions,
		ActionButton,
		ActionLink,
	},
	directives: {
		clickOutside: ClickOutside.directive,
	},
	filters: {
		counterFormatter(count) {
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
			// Deleting
			deleteInterval: null,
			deleteTimeout: null,
			countdown: CD_DURATION,
		}
	},
	computed: {
		...mapGetters({
			getCalendarCount: 'getCalendarCount',
			isCalendarNameUsed: 'isCalendarNameUsed',
			getTask: 'getTaskByUri',
			getPrincipalByUrl: 'getPrincipalByUrl',
		}),

		calendarCount() {
			return this.getCalendarCount(this.calendar.id)
		},

		deleteMessage() {
			return !this.calendar.isSharedWithMe
				? this.$t('tasks', 'This will delete the calendar "{calendar}" and all corresponding events and tasks.', { calendar: this.calendar.displayName }, undefined, { sanitize: false, escape: false })
				: this.$t('tasks', 'This will unshare the calendar "{calendar}".', { calendar: this.calendar.displayName }, undefined, { sanitize: false, escape: false })
		},
		undoDeleteMessage() {
			return !this.calendar.isSharedWithMe
				? this.$n('tasks', 'Deleting the calendar in {countdown} second', 'Deleting the calendar in {countdown} seconds', this.countdown, { countdown: this.countdown })
				: this.$n('tasks', 'Unsharing the calendar in {countdown} second', 'Unsharing the calendar in {countdown} seconds', this.countdown, { countdown: this.countdown })
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
			const rootURL = generateRemoteUrl('dav')
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
		/**
		 * Whether or not the information about the owner principal was loaded
		 *
		 * @returns {Boolean}
		 */
		loadedOwnerPrincipal() {
			return this.getPrincipalByUrl(this.calendar.owner) !== undefined
		},
		ownerUserId() {
			const principal = this.getPrincipalByUrl(this.calendar.owner)
			if (principal) {
				return principal.userId
			}
			return ''
		},
		ownerDisplayname() {
			const principal = this.getPrincipalByUrl(this.calendar.owner)
			if (principal) {
				return principal.displayname
			}
			return ''
		},
	},
	methods: {
		...mapActions([
			'changeCalendar',
			'deleteCalendar',
			'moveTask',
		]),
		/**
		 * Handle the drag over
		 *
		 * @param {Object} e The event object
		 * @returns {Boolean}
		 */
		dragOver(e) {
			if (e.preventDefault) {
				e.preventDefault()
			}
			return false
		},
		/**
		 * Set the appropriate class on hovering
		 *
		 * @param {Object} e The event object
		 */
		dragEnter(e) {
			// Check if dropping here is allowed
			if (this.calendar.readOnly) {
				return
			}
			if (this.calendar.isSharedWithMe) {
				const taskUri = e.dataTransfer.getData('text/plain')
				if (taskUri) {
					const task = this.getTask(taskUri)
					if (task?.class !== 'PUBLIC') {
						return
					}
				}
			}
			// Get the correct element, in case we hover a child.
			if (e.target.closest) {
				const target = e.target.closest('li.list')
				if (target) {
					const calendars = document.querySelectorAll('li.list')
					calendars.forEach((f) => { f.classList.remove('dnd-hover') })
					target.classList.add('dnd-hover')
				}
			}
		},
		/**
		 * Remove the hovering class after leaving
		 *
		 * @param {Object} e The event object
		 */
		dragLeave(e) {
			// Don't do anything if we leave towards a child element.
			if (e.target.contains(e.relatedTarget)) {
				return
			}
			// Get the correct element, in case we leave directly from a child.
			if (e.target.closest) {
				const target = e.target.closest('li.list')
				if (!target || target.contains(e.relatedTarget)) {
					return
				}
				target.classList.remove('dnd-hover')
			}
		},
		/**
		 * Drop a task on a calendar
		 *
		 * @param {Object} e The event object
		 */
		dropTask(e) {
			// Remove all hover classes
			const calendars = document.querySelectorAll('li.list')
			calendars.forEach((f) => { f.classList.remove('dnd-hover') })
			const taskUri = e.dataTransfer.getData('text/plain')
			if (taskUri) {
				const task = this.getTask(taskUri)
				if (task && this.calendar !== task.calendar) {
					this.moveTask({ task, calendar: this.calendar, parent: undefined })
				}
			}
		},
		showTooltip(target) {
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
		resetView() {
			this.editing = false
			this.shareOpen = false
			this.tooltipTarget = ''
		},
		clickOutsideMiddleware(event) {
			return !event.target.closest('.edit-calendar')
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
					showSuccess(this.$t('tasks', 'Calendar link copied to clipboard.'))
				}, e => {
					this.copySuccess = false
					this.copied = true
					showError(this.$t('tasks', 'Calendar link could not be copied to clipboard.'))
				}).then(() => {
					setTimeout(() => {
						// stop loading status regardless of outcome
						this.copied = false
					}, 2000)
				})
		},
		setColor(color) {
			this.selectedColor = color
		},
		save() {
			if (!this.isNameAllowed(this.newCalendarName, this.calendar.id).allowed) {
				return
			}
			this.changeCalendar({ calendar: this.calendar, newName: this.newCalendarName, newColor: this.selectedColor })
			this.editing = false
		},
		checkName(event, calendar, callback) {
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
		isNameAllowed(name, id) {
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

		/**
		 * Deletes or unshares the calendar
		 */
		scheduleDelete() {
			this.deleteInterval = setInterval(() => {
				this.countdown--
				if (this.countdown < 0) {
					this.countdown = 0
				}
			}, 1000)
			this.deleteTimeout = setTimeout(async() => {
				try {
					await this.deleteCalendar(this.calendar)
				} catch (error) {
					showError(this.$t('tasks', 'An error occurred, unable to delete the calendar.'))
					console.error(error)
				} finally {
					clearInterval(this.deleteInterval)
					this.deleteTimeout = null
					this.deleteInterval = null
					this.countdown = CD_DURATION
				}
			}, 1e3 * CD_DURATION)
		},
		/**
		 * Cancels the deletion of a calendar
		 */
		cancelDelete() {
			clearTimeout(this.deleteTimeout)
			clearInterval(this.deleteInterval)
			this.deleteTimeout = null
			this.deleteInterval = null
			this.countdown = CD_DURATION
		},
	},
}
</script>

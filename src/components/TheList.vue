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
	<ul id="collections">
		<RouterLink
			v-for="collection in collections"
			:id="'collection_' + collection.id"
			:key="collection.id"
			:collection-id="collection.id"
			:to="{ name: 'collections', params: {collectionId: collection.id } }"
			:class="[collection.icon, {'animate-up': hideCollection(collection) }]"
			tag="li" class="collection reactive"
			active-class="active"
		>
			<a class="sprite">
				<span v-if="collection.id=='today'" class="date">
					{{ dayOfMonth }}
				</span>
				<span class="title">
					{{ collection.displayName }}
				</span>
			</a>
			<div v-if="collection.id!='completed'" class="app-navigation-entry-utils">
				<ul>
					<li class="app-navigation-entry-utils-counter">
						{{ collectionCount(collection.id) | counterFormatter }}
					</li>
				</ul>
			</div>
		</RouterLink>
		<RouterLink
			v-for="calendar in calendars"
			:id="'list_' + calendar.id"
			:key="calendar.id"
			v-click-outside="() => resetView(calendar)"
			:calendar-id="calendar.id"
			:to="{ name: 'calendars', params: { calendarId: calendar.id } }"
			:class="{edit: editing == calendar.id}"
			tag="li"
			class="list with-menu editing"
			active-class="active"
		>
			<div :style="{'background-color': calendar.color}" class="app-navigation-entry-bullet" />
			<a>
				<span class="title">
					{{ calendar.displayName }}
				</span>
			</a>

			<div class="app-navigation-entry-utils">
				<ul>
					<li class="app-navigation-entry-utils-counter">
						{{ calendarCount(calendar.id) | counterFormatter }}
					</li>

					<!-- sharing button -->
					<li v-if="!calendar.readOnly" v-tooltip.top="sharedWithTooltip(calendar)"
						:class="{'calendar__share--shared': hasShares(calendar)}"
						:title="sharedWithTooltip(calendar)" href="#"
						class="calendar__share icon-shared reactive" @click="toggleShare(calendar)"
					/>
					<Popover tag="li" class="app-navigation-entry-utils-menu-button reactive">
						<ul>
							<li v-if="!calendar.readOnly">
								<a @click="edit(calendar)">
									<span class="icon-rename" />
									<span>{{ t('tasks', 'Edit') }}</span>
								</a>
							</li>
							<li>
								<a @click="copyCalDAVUrl($event, calendar)">
									<span class="icon-public" />
									<span>
										{{ !copied
											? t('tasks', 'Copy private link')
											: copySuccess
												? t('tasks', 'Copied')
												: t('tasks', 'Can not copy') }}
									</span>
								</a>
							</li>
							<li>
								<a :href="exportUrl(calendar)" :download="calendar.id + '.ics'">
									<span class="icon-download" />
									<span>{{ t('tasks', 'Download') }}</span>
								</a>
							</li>
							<Confirmation v-if="!calendar.readOnly" :message="deleteMessage(calendar.displayName)" @delete-calendar="deleteCalendar(calendar)" />
						</ul>
					</Popover>
				</ul>
			</div>

			<!-- sharing input -->
			<ShareCalendar v-if="shareOpen == calendar.id && !calendar.readOnly" :calendar="calendar" />

			<div :class="{error: nameError}" class="app-navigation-entry-edit name">
				<form>
					<input v-model="newCalendarName"
						v-tooltip="{
							content: tooltipMessage,
							show: showTooltip('list_' + calendar.id),
							trigger: 'manual'
						}"
						class="edit"
						type="text"
						@keyup="checkName($event, calendar, save)"
					>
					<input :title="t('tasks', 'Cancel')"
						type="cancel"
						value=""
						class="action icon-close"
						@click="resetView(calendar)"
					>
					<input :title="t('tasks', 'Save')"
						type="button"
						value=""
						class="action icon-checkmark"
						@click="save(calendar)"
					>
				</form>
				<Colorpicker :selected-color="selectedColor" @color-selected="setColor(...arguments)" />
			</div>
		</RouterLink>
		<li v-click-outside="cancelCreate" :class="{edit: creating}" class="newList icon-add reactive editing">
			<a class="icon icon-bw addlist sprite"
				@click="startCreate($event)"
			>
				<span class="title">
					{{ t('tasks', 'Add List…') }}
				</span>
			</a>
			<div :class="{error: nameError}" class="app-navigation-entry-edit name">
				<form>
					<input id="newListInput"
						v-model="newCalendarName"
						v-tooltip="{
							content: tooltipMessage,
							show: showTooltip('list_'),
							trigger: 'manual'
						}"
						:placeholder="t('tasks', 'New List')"
						class="edit"
						type="text"
						@keyup="checkName($event, null, create)"
					>
					<input :title="t('tasks', 'Cancel')"
						type="cancel"
						value=""
						class="action icon-close"
						@click="cancelCreate"
					>
					<input :title="t('tasks', 'Save')"
						type="button"
						value=""
						class="action icon-checkmark"
						@click="create($event)"
					>
				</form>
				<Colorpicker :selected-color="selectedColor" @color-selected="setColor(...arguments)" />
			</div>
		</li>
	</ul>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import Colorpicker from './Colorpicker'
import PopoverMenu from './PopoverMenu'
import Confirmation from './Confirmation'
import ShareCalendar from './CalendarShare'

import ClickOutside from 'vue-click-outside'

export default {
	components: {
		'Colorpicker': Colorpicker,
		'Popover': PopoverMenu,
		'Confirmation': Confirmation,
		ShareCalendar
	},
	directives: {
		ClickOutside
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
		}
	},
	data() {
		return {
			editing: '',
			shareOpen: '',
			copySuccess: false,
			copied: false,
			creating: false,
			nameError: false,
			newCalendarName: '',
			selectedColor: '',
			tooltipMessage: '',
			tooltipTarget: '',
			dayOfMonth: moment().date()
		}
	},
	computed: {
		...mapState({
			collections: state => state.collections.collections
		}),
		...mapGetters({
			calendars: 'getSortedCalendars',
			collectionCount: 'getCollectionCount',
			calendarCount: 'getCalendarCount',
			isCalendarNameUsed: 'isCalendarNameUsed'
		})
	},
	methods: {
		...mapActions([
			'changeCalendar',
			'deleteCalendar',
			'appendCalendar'
		]),
		hideCollection: function(collection) {
			switch (collection.show) {
			case 0:
				return true
			case 1:
				return false
			case 2:
				return this.collectionCount(collection.id) < 1
			}
		},
		showTooltip: function(target) {
			return this.tooltipTarget === target
		},
		edit: function(calendar) {
			this.editing = calendar.id
			this.newCalendarName = calendar.displayName
			this.selectedColor = calendar.color
			this.nameError = false
			this.tooltipTarget = ''
			this.$nextTick(
				() => document.querySelector('#list_' + calendar.id + ' input.edit').focus()
			)
		},
		toggleShare: function(calendar) {
			if (this.shareOpen === calendar.id) {
				this.shareOpen = ''
			} else {
				this.shareOpen = calendar.id
			}
		},
		hasShares: function(calendar) {
			return calendar.shares.length > 0
		},
		// info tooltip about number of shares
		sharedWithTooltip: function(calendar) {
			return this.hasShares(calendar)
				? n('tasks',
					'Shared with {num} entity',
					'Shared with {num} entities',
					calendar.shares.length, {
						num: calendar.shares.length
					})
				: '' // disable the tooltip
		},
		resetView: function(calendar) {
			if (this.editing === calendar.id) {
				this.editing = ''
			}
			if (this.shareOpen === calendar.id) {
				this.shareOpen = ''
			}
			this.tooltipTarget = ''
		},
		copyCalDAVUrl(event, calendar) {
			// change to loading status
			event.stopPropagation()

			const url = this.url(calendar)

			// copy link for calendar to clipboard
			this.$copyText(url)
				.then(e => {
					event.preventDefault()
					this.copySuccess = true
					this.copied = true
					// Notify calendar url was copied
					OC.Notification.showTemporary(t('tasks', 'Calendar link copied to clipboard.'))
				}, e => {
					this.copySuccess = false
					this.copied = true
					OC.Notification.showTemporary(t('tasks', 'Calendar link could not be copied to clipboard.'))
				}).then(() => {
					setTimeout(() => {
						// stop loading status regardless of outcome
						this.copied = false
					}, 2000)
				})
		},
		exportUrl(calendar) {
			var url = calendar.url
			// cut off last slash to have a fancy name for the ics
			if (url.slice(url.length - 1) === '/') {
				url = url.slice(0, url.length - 1)
			}
			url += '?export'
			return url
		},
		url(calendar) {
			const rootURL = OC.linkToRemote('dav')
			return new URL(calendar.url, rootURL)
		},
		setColor: function(color) {
			this.selectedColor = color
		},
		startCreate: function(e) {
			if (OCA.Theming) {
				this.selectedColor = OCA.Theming.color
			} else {
				this.selectedColor = '#0082C9'
			}
			this.newCalendarName = ''
			this.creating = true
			this.$nextTick(
				() => document.getElementById('newListInput').focus()
			)
			e.stopPropagation()
		},
		cancelCreate: function() {
			this.creating = false
		},
		create: function() {
			if (!this.isNameAllowed(this.newCalendarName, 'new').allowed) {
				return
			}
			this.appendCalendar({ displayName: this.newCalendarName, color: this.selectedColor })
			this.creating = false
		},
		save: function(calendar) {
			if (!this.isNameAllowed(this.newCalendarName, calendar.id).allowed) {
				return
			}
			this.changeCalendar({ calendar: calendar, newName: this.newCalendarName, newColor: this.selectedColor })
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
			var check = {
				allowed:	false,
				msg:	''
			}
			if (this.isCalendarNameUsed(name, id)) {
				check.msg = t('tasks', 'The name "%s" is already used.').replace('%s', name)
			} else if (!name) {
				check.msg = t('tasks', 'An empty name is not allowed.')
			} else {
				check.allowed = true
			}
			return check
		},
		deleteMessage: function(name) {
			return t('tasks', 'This will delete the calendar "%s" and all corresponding events and tasks.').replace('%s', name)
		}
	}
}
</script>

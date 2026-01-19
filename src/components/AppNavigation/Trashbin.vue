<!--
Nextcloud - Tasks

@author Christoph Wurst
@copyright 2021 Christoph Wurst <christoph@winzerhof-wurst.at>
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
	<NcAppNavigationItem :name="t('tasks', 'Trash bin')"
		:pinned="true"
		@click.prevent="onShow">
		<template #icon>
			<Delete :size="20" />
		</template>
		<template #extra>
			<NcModal v-if="showModal"
				size="large"
				@close="showModal = false">
				<div class="modal__content">
					<NcEmptyContent v-if="loading" :description="t('tasks', 'Loading deleted calendars, tasks and events.')">
						<template #icon>
							<NcLoadingIcon :size="64" />
						</template>
					</NcEmptyContent>
					<NcEmptyContent v-else-if="!items.length" :description="t('tasks', 'You do not have any deleted calendars, tasks or events.')">
						<template #icon>
							<Delete :size="64" />
						</template>
					</NcEmptyContent>
					<template v-else>
						<h2>{{ t('tasks', 'Trash bin') }}</h2>
						<div class="table">
							<NcButton class="table__header sort-button sort-button--summary"
								:class="{ 'sort-button--active': sortOrder === 'summary' }"
								alignment="center-reverse"
								variant="tertiary"
								@click="setSortOrder('summary')">
								<template #icon>
									<MenuDown v-if="sortDirection && sortOrder === 'summary'" />
									<MenuUp v-else />
								</template>
								{{ t('tasks', 'Name') }}
							</NcButton>
							<NcButton class="table__header table__header--deletedAt sort-button sort-button--deletedAt"
								:class="{ 'sort-button--active': sortOrder === 'deletedAt' }"
								alignment="center"
								variant="tertiary"
								@click="setSortOrder('deletedAt')">
								<template #icon>
									<MenuDown v-if="sortDirection && sortOrder === 'deletedAt'" />
									<MenuUp v-else />
								</template>
								{{ t('tasks', 'Deleted') }}
							</NcButton>
							<div class="table__header">
								&nbsp;
							</div>
							<template v-for="item in items" :key="`${item.url}body`">
								<div class="table__body">
									<div class="icon-bullet"
										:style="{ 'background-color': item.color }" />
									<div class="item-description">
										<div class="item-description__mainline">
											{{ item.summary }}
										</div>
										<div v-if="item.subline" class="item-description__subline">
											{{ item.subline }}
										</div>
									</div>
								</div>
								<div class="table__body table__body--deletedAt">
									<NcDateTime class="timestamp" :timestamp="item.deletedAt" :ignore-seconds="true" />
								</div>
								<div class="table__body">
									<NcButton @click="restore(item)">
										<template #icon>
											<Undo :size="20" />
										</template>
										{{ t('tasks','Restore') }}
									</NcButton>
									<NcActions :force-menu="true">
										<NcActionButton @click="onDeletePermanently(item)">
											<template #icon>
												<Delete :size="20" />
											</template>
											{{ t('tasks','Delete permanently') }}
										</NcActionButton>
									</NcActions>
								</div>
							</template>
						</div>
						<div class="footer">
							<p v-if="retentionDuration">
								{{ n('tasks', 'Elements in the trash bin are deleted after {numDays} day', 'Elements in the trash bin are deleted after {numDays} days', retentionDuration, { numDays: retentionDuration }) }}
							</p>
							<NcButton variant="primary" @click="onEmptyTrashBin()">
								<template #icon>
									<DeleteForever :size="20" />
								</template>
								{{ t('tasks','Empty trash bin') }}
							</NcButton>
						</div>
					</template>
				</div>
			</NcModal>
		</template>
	</NcAppNavigationItem>
</template>

<script>
import { uidToHexColor } from '../../utils/color.js'
import logger from '../../utils/logger.js'
import { sort } from '../../store/storeHelper.js'

import { showError } from '@nextcloud/dialogs'
import { translate as t, translatePlural as n } from '@nextcloud/l10n'
import NcAppNavigationItem from '@nextcloud/vue/components/NcAppNavigationItem'
import NcActions from '@nextcloud/vue/components/NcActions'
import NcActionButton from '@nextcloud/vue/components/NcActionButton'
import NcButton from '@nextcloud/vue/components/NcButton'
import NcDateTime from '@nextcloud/vue/components/NcDateTime'
import NcEmptyContent from '@nextcloud/vue/components/NcEmptyContent'
import NcLoadingIcon from '@nextcloud/vue/components/NcLoadingIcon'
import NcModal from '@nextcloud/vue/components/NcModal'

import Delete from 'vue-material-design-icons/TrashCanOutline.vue'
import DeleteForever from 'vue-material-design-icons/DeleteForeverOutline.vue'
import MenuDown from 'vue-material-design-icons/MenuDown.vue'
import MenuUp from 'vue-material-design-icons/MenuUp.vue'
import Undo from 'vue-material-design-icons/Undo.vue'

import { toRaw } from 'vue'
import { mapGetters } from 'vuex'

export default {
	name: 'Trashbin',
	components: {
		NcAppNavigationItem,
		Delete,
		NcEmptyContent,
		NcLoadingIcon,
		NcModal,
		NcActions,
		NcActionButton,
		NcButton,
		NcDateTime,
		DeleteForever,
		MenuDown,
		MenuUp,
		Undo,
	},
	data() {
		return {
			showModal: false,
			loading: true,
			sortDirection: false,
			sortOrder: 'deletedAt',
		}
	},
	computed: {
		...mapGetters({
			trashBin: 'trashBin',
			calendars: 'sortedDeletedCalendars',
			objects: 'deletedCalendarObjects',
		}),
		items() {
			const formattedCalendars = this.calendars.map(calendar => ({
				calendar,
				type: 'calendar',
				key: calendar.url,
				summary: calendar.displayname,
				url: calendar._url,
				deletedAt: calendar._props['{http://nextcloud.com/ns}deleted-at'],
				color: calendar.color ?? uidToHexColor(calendar.displayname),
			}))
			const formattedCalendarObjects = this.objects.map(vobject => {
				let summary
				try {
					summary = vobject?.calendarComponent.getComponentIterator().next().value?.title
				} catch (e) {
				}
				if (!summary) {
					if (vobject.objectType === 'VTODO') {
						summary = t('tasks', 'Untitled task')
					} else if (vobject.objectType === 'VEVENT') {
						summary = t('tasks', 'Untitled event')
					} else if (vobject.objectType === 'VJOURNAL') {
						summary = t('tasks', 'Untitled journal')
					} else {
						summary = t('tasks', 'Untitled item')
					}
				}
				let subline = vobject.calendar?.displayName || t('tasks', 'Unknown calendar')
				if (vobject.isEvent) {
					const event = toRaw(vobject?.calendarComponent.getFirstComponent('VEVENT'))
					if (event?.startDate.jsDate && event?.isAllDay()) {
						subline += ' · ' + moment(event.startDate.jsDate).format('LL')
					} else if (event?.startDate.jsDate) {
						subline += ' · ' + moment(event?.startDate.jsDate).format('LLL')
					}
				}
				const color = vobject.calendarComponent.getComponentIterator().next().value?.color
						?? vobject.calendar?.color
						?? uidToHexColor(subline)
				return {
					vobject,
					type: 'object',
					key: vobject.id,
					summary,
					subline,
					url: vobject.uri,
					deletedAt: vobject.dav._props['{http://nextcloud.com/ns}deleted-at'],
					color,
				}
			})

			const items = formattedCalendars.concat(formattedCalendarObjects).sort((item1, item2) => item2.deletedAt - item1.deletedAt)

			return sort(items, this.sortOrder, this.sortDirection)

		},
		retentionDuration() {
			return Math.ceil(
				this.trashBin.retentionDuration / (60 * 60 * 24),
			)
		},
	},
	methods: {
		t,
		n,

		setSortOrder(sortOrder) {
			if (this.sortOrder === sortOrder) {
				this.sortDirection = !this.sortDirection
			} else {
				this.sortDirection = false
				this.sortOrder = sortOrder
			}
		},

		async onShow() {
			this.showModal = true

			this.loading = true
			try {
				await Promise.all([
					this.$store.dispatch('loadDeletedCalendars'),
					this.$store.dispatch('loadDeletedCalendarObjects'),
				])

				logger.debug('deleted calendars and objects loaded', {
					calendars: this.calendars,
					objects: this.objects,
				})
			} catch (error) {
				logger.error('could not load deleted calendars and objects', {
					error,
				})

				showError(t('tasks', 'Could not load deleted calendars and objects'))
			}
			this.loading = false
		},
		async onDeletePermanently(item) {
			logger.debug('deleting ' + item.url + ' permanently', item)
			try {
				switch (item.type) {
				case 'calendar':
					await this.$store.dispatch('deleteCalendarPermanently', { calendar: item.calendar })
					break
				case 'object':
					await this.$store.dispatch('deleteCalendarObjectPermanently', { vobject: item.vobject })
					break
				}
			} catch (error) {
				logger.error('could not delete ' + item.url, { error })

				showError(t('tasks', 'Could not delete calendar or event'))
			}
		},
		async restore(item) {
			logger.debug('restoring ' + item.url, item)
			try {
				switch (item.type) {
				case 'calendar': {
					await this.$store.dispatch('restoreCalendar', { calendar: item.calendar })
					const { calendars } = await this.$store.dispatch('getCalendarsAndTrashBin')
					// Load the tasks of the restored calendar
					const calendar = calendars.find(cal => cal.url === item.calendar.url)
					if (calendar?.supportsTasks) {
						await this.$store.dispatch('getTasksFromCalendar', { calendar, completed: false, related: null })
					}
					break
				}
				case 'object':
					await this.$store.dispatch('restoreCalendarObject', { vobject: item.vobject })
					break
				}
			} catch (error) {
				logger.error('could not restore ' + item.url, { error })

				showError(t('tasks', 'Could not restore calendar or event'))
			}
		},
		onEmptyTrashBin() {
			OC.dialogs.confirm(
				t('tasks', 'Do you really want to empty the trash bin?'),
				t('tasks', 'Empty trash bin'),
				this.emptyTrashBin,
				true,
			)
		},

		emptyTrashBin(confirm) {
			if (!confirm) {
				return
			}
			this.items.forEach((item) => {
				this.onDeletePermanently(item)
			})
		},
	},
}
</script>

<style lang="scss" scoped>

.modal__content {
	display: flex;
	flex-direction: column;
	margin: 2vw;
}

:deep(.table__header).sort-button {
	.button-vue__icon {
		transition-timing-function: linear;
		transition-duration: .1s;
		transition-property: opacity;
		opacity: 0;
	}

	&--summary {
		margin-left: 17px;
	}

	&:hover,
	&--active,
	&:active {
		.button-vue__icon {
			opacity: 1;
		}
	}
}

.table {
	display: grid;
	grid-template-columns: minmax(200px, 1fr) max-content max-content;
	overflow: scroll;
	margin-bottom: auto;

	&__header {
		position: sticky;
		top: 0;
		background-color: var(--color-main-background-translucent);
		z-index: 1;
	}

	&__header,
	&__body {
		&--deletedAt {
			justify-content: right;
		}
	}

	&__body--deletedAt {
		padding-right: 16px !important;
	}

	& > div {
		display: flex;
		align-items: center;
		padding: 4px;
	}
}

.item-description {
	overflow: hidden;

	&__mainline,
	&__subline {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	&__subline {
		color: var(--color-text-maxcontrast);
	}
}

.footer {
	display: flex;
	flex-direction: column;
	align-items: center;
	color: var(--color-text-lighter);
	font-size: small;
	margin-top: 16px;
	& > p {
		margin-bottom: 12px;
	}
}

.icon-bullet {
	display: inline-block;
	vertical-align: middle;
	width: 14px;
	height: 14px;
	margin-right: 14px;
	border: none;
	border-radius: 50%;
	flex-shrink: 0;
}
</style>

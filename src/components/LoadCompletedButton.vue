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
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU AFFERO GENERAL PUBLIC LICENSE for more details.

You should have received a copy of the GNU Affero General Public
License along with this library. If not, see <http://www.gnu.org/licenses/>.

-->

<template>
	<div v-show="!loadedCompleted"
		:title="buttonStrings.tooltip"
		class="loadmore reactive">
		<NcButton variant="tertiary"
			@click="loadCompletedTasks">
			<template #icon>
				<CloudDownload :size="20" />
			</template>
			{{ buttonStrings.text }}
		</NcButton>
	</div>
</template>

<script>
import { translate as t } from '@nextcloud/l10n'
import NcButton from '@nextcloud/vue/components/NcButton'

import CloudDownload from 'vue-material-design-icons/CloudDownload.vue'

import { mapActions } from 'vuex'

export default {
	components: {
		NcButton,
		CloudDownload,
	},
	props: {
		calendars: {
			type: Array,
			required: true,
		},
	},
	computed: {
		loadedCompleted() {
			return this.calendars.every(calendar => calendar.loadedCompleted)
		},
		buttonStrings() {
			if (this.calendars.length > 1) {
				return {
					text: t('tasks', 'Load the completed tasks of all lists.'),
					tooltip: t('tasks', 'Loading the completed tasks of all lists might slow down the app.'),
				}
			} else {
				return {
					text: t('tasks', 'Load the completed tasks of list "{calendar}".', { calendar: this.calendars?.[0]?.displayName }, undefined, { sanitize: false, escape: false }),
					tooltip: t('tasks', 'Loading the completed tasks might slow down the app.'),
				}
			}
		},
	},
	methods: {
		t,

		...mapActions([
			'getTasksFromCalendar',
		]),
		loadCompletedTasks() {
			this.calendars.forEach(
				calendar => this.getTasksFromCalendar({ calendar, completed: true, related: null }),
			)
		},
	},
}
</script>

<style lang="scss" scoped>
.loadmore {
	display: flex;
	justify-content: center;
	top: 20px;
	position: relative;
}
</style>

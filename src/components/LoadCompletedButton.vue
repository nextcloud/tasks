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
	<div v-show="!loadedCompleted" class="loadmore reactive">
		<ButtonVue type="tertiary"
			@click="loadCompletedTasks">
			<template #icon>
				<CloudDownload :size="20" />
			</template>
			{{ t('tasks', 'Load all completed tasks.') }}
		</ButtonVue>
	</div>
</template>

<script>
import { translate as t } from '@nextcloud/l10n'
import ButtonVue from '@nextcloud/vue/dist/Components/ButtonVue'

import CloudDownload from 'vue-material-design-icons/CloudDownload'

import { mapActions } from 'vuex'

export default {
	components: {
		ButtonVue,
		CloudDownload,
	},
	props: {
		calendar: {
			type: Object,
			required: true,
		},
	},
	computed: {
		loadedCompleted() {
			return this.calendar.loadedCompleted
		},
	},
	methods: {
		t,

		...mapActions([
			'getTasksFromCalendar',
		]),
		loadCompletedTasks() {
			this.getTasksFromCalendar({ calendar: this.calendar, completed: true, related: null })
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

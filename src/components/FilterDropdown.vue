<!--
Nextcloud - Tasks

@author Raimund Schlüßler
@copyright 2024 Raimund Schlüßler <raimund.schluessler@mailbox.org>

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
	<NcActions class="filter reactive"
		force-menu
		:type="isFilterActive ? 'primary' : 'tertiary'"
		:title="t('tasks', 'Active filter')">
		<template #icon>
			<span class="material-design-icon">
				<FilterIcon v-if="isFilterActive" :size="20" />
				<FilterOffIcon v-else :size="20" />
			</span>
		</template>
		<NcActionInput type="multiselect"
			:label="t('tasks', 'Filter by tags')"
			track-by="id"
			:multiple="true"
			:append-to-body="true"
			:options="tags"
			:model-value="filter.tags"
			@update:model-value="setTags">
			<template #icon>
				<TagMultiple :size="20" />
			</template>
			{{ t('tasks', 'Select tags to filter by') }}
		</NcActionInput>
		<NcActionButton class="reactive"
			:close-after-click="true"
			@click="resetFilter">
			<template #icon>
				<Close :size="20" />
			</template>
			{{ t('tasks', 'Reset filter') }}
		</NcActionButton>
	</NcActions>
</template>

<script>
import { translate as t } from '@nextcloud/l10n'
import NcActions from '@nextcloud/vue/dist/Components/NcActions.js'
import NcActionButton from '@nextcloud/vue/dist/Components/NcActionButton.js'
import NcActionInput from '@nextcloud/vue/dist/Components/NcActionInput.js'

import Close from 'vue-material-design-icons/Close.vue'
import FilterIcon from 'vue-material-design-icons/Filter.vue'
import FilterOffIcon from 'vue-material-design-icons/FilterOff.vue'
import TagMultiple from 'vue-material-design-icons/TagMultiple.vue'

import { mapGetters, mapMutations } from 'vuex'

export default {
	name: 'FilterDropdown',
	components: {
		NcActions,
		NcActionButton,
		NcActionInput,
		Close,
		FilterIcon,
		FilterOffIcon,
		TagMultiple,
	},
	computed: {
		...mapGetters({
			tags: 'tags',
			filter: 'filter',
			searchQuery: 'searchQuery',
		}),
		isFilterActive() {
			return this.filter.tags.length || this.searchQuery
		},
	},
	methods: {
		t,
		...mapMutations(['setFilter', 'setSearchQuery']),

		setTags(tags) {
			const filter = this.filter
			filter.tags = tags
			this.setFilter(filter)
		},

		resetFilter() {
			this.setFilter({ tags: [] })
			this.setSearchQuery('')
		},
	},
}
</script>

<style lang="scss" scoped>
// overlay the sort direction icon with the sort order icon
.material-design-icon {
	width: 44px;
	height: 44px;
}
</style>

<style lang="scss">
.vs__dropdown-menu,
.vs__dropdown-menu--floating {
  z-index:100000 !important
}
</style>

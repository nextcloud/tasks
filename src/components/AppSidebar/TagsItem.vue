<!--
Nextcloud - Tasks

@author Georg Ehrke
@copyright 2019 Georg Ehrke <oc.list@georgehrke.com>

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
	<div class="property__item">
		<div class="multiselect__icon">
			<component :is="icon" :size="20" />
		</div>
		<NcSelect :model-value="tags"
			taggable
			:disabled="disabled"
			:options="options"
			:placeholder="placeholder"
			:multiple="true"
			:close-on-select="false"
			:append-to-body="false"
			:tag-placeholder="t('tasks', 'Add this as a new tag')"
			@update:model-value="setTags"
			@tag="addTag">
			<template #no-options>
				{{ t('tasks', 'No tag available. Create one!') }}
			</template>
		</NcSelect>
	</div>
</template>

<script>
import MultiselectOption from './MultiselectOption.vue'

import { translate as t } from '@nextcloud/l10n'
import NcSelect from '@nextcloud/vue/components/NcSelect'

import TagMultiple from 'vue-material-design-icons/TagMultiple.vue'

export default {
	components: {
		NcSelect,
		MultiselectOption,
		TagMultiple,
	},
	props: {
		tags: {
			type: Array,
			required: true,
		},
		options: {
			type: Array,
			required: true,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		placeholder: {
			type: String,
			default: '',
		},
		icon: {
			type: String,
			default: null,
		},
	},
	emits: [
		'addTag',
		'setTags',
	],
	methods: {
		t,

		addTag(tag) {
			this.$emit('addTag', tag)
		},
		setTags(tags) {
			this.$emit('setTags', tags)
		},
	},
}
</script>

<style lang="scss" scoped>
.property__item {
	display: flex;
	border-bottom: 1px solid var(--color-border);
	width: 100%;
	color: var(--color-text-lighter);

	.multiselect__icon {
		display: flex;
		height: 44px;
		width: 44px;
		justify-content: center;
		flex-basis: 44px;
		flex-shrink: 0;
	}

	:deep(.v-select.select) {
		width: 100%;
		margin-left: -44px;

		.vs {
			&__dropdown-toggle {
				margin:  0;
				padding: 0;
				border: none;
				margin-left: 44px;
				margin-bottom: 4px;
				outline: none !important;
			}

			&__dropdown-menu {
				border-radius: 0;
				box-shadow: none;
				border: 1px solid var(--color-border-dark);
			}

			&__selected-options {
				padding-left: 0;
			}

			&__search {
				padding-left: 0;

				&::placeholder {
					color: var(--color-text-lighter);
					opacity: 1;
					font-weight: bold;
				}
			}
		}
	}
}
</style>

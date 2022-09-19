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
		<NcMultiselect :value="tags"
			:taggable="true"
			:disabled="disabled"
			:options="options"
			:placeholder="placeholder"
			:multiple="true"
			:close-on-select="false"
			:tag-placeholder="t('tasks', 'Add this as a new tag')"
			@input="setTags"
			@tag="addTag">
			<template #placeholder>
				<MultiselectOption :display-name="placeholder" :icon="icon" />
			</template>
			<template #clear>
				<div v-if="tags.length" class="multiselect__icon">
					<Tag :size="20" />
				</div>
			</template>
			<template #noOptions>
				{{ t('tasks', 'No tag available. Create one!') }}
			</template>
		</NcMultiselect>
	</div>
</template>

<script>
import MultiselectOption from './MultiselectOption.vue'

import { translate as t } from '@nextcloud/l10n'
import NcMultiselect from '@nextcloud/vue/dist/Components/NcMultiselect.js'

import Tag from 'vue-material-design-icons/Tag.vue'

export default {
	components: {
		NcMultiselect,
		MultiselectOption,
		Tag,
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
		'add-tag',
		'set-tags',
	],
	methods: {
		t,

		addTag(tag) {
			this.$emit('add-tag', tag)
		},
		setTags(tags) {
			this.$emit('set-tags', tags)
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

	:deep(.multiselect) {
		width: 100%;

		&:hover .multiselect__placeholder {
			color: var(--color-text-lighter);
		}

		.multiselect--active {
			.multiselect__tags {
				border: 1px solid var(--color-border-dark);
			}

			.multiselect__icon {
				display: none;
			}
		}

		.multiselect--disabled,
		.multiselect--disabled .multiselect__single {
			background-color: var(--color-main-background) !important;

			& * {
				cursor: default !important;
			}
		}

		.multiselect__icon {
			position: absolute;
			display: flex;
			width: 44px;
			flex-basis: 44px;
			flex-shrink: 0;
			height: 44px;
			justify-content: center;
		}

		.multiselect__tags {
			border: 1px solid transparent;
			height: 44px;
			flex-grow: 1;

			.multiselect__single {
				padding: 0;
			}

			.multiselect__placeholder {
				display: flex !important;
				padding: 0;
			}

			input.multiselect__input {
				padding: 0 !important;
				padding-left: 44px !important;
				width: 100% !important;
				position: absolute !important;
				font-weight: bold;
				font-size: var(--default-font-size);
			}

			.multiselect__tags-wrap {
				padding: 0;
				padding-left: 44px;

				.multiselect__tag {
					margin-bottom: 0;
				}
			}
		}

		.multiselect__content-wrapper {
			// We need this so the options list is not cut off
			// by the tabs header
			max-height: 170px !important;

			li > span {
				padding: 0;
				height: 44px;

				&::before {
					min-width: 44px;
					margin-right: 0;
				}

				&.multiselect__option--selected {
					color: var(--color-main-text);
				}
			}
		}
	}
}
</style>

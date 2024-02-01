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
		<NcSelect label="displayName"
			:disabled="isDisabled"
			:options="options"
			:model-value="value"
			:placeholder="placeholder"
			:multiple="false"
			:searchable="false"
			:clearable="false"
			:close-on-select="true"
			:append-to-body="false"
			@option:selected="change">
			<template #search="{ attributes, events }">
				<span v-if="!value" class="placeholder__icon">
					<component :is="icon" :size="20" />
				</span>
				<input maxlength="1"
					class="vs__search"
					v-bind="attributes"
					v-on="events">
			</template>
			<template #selected-option="option">
				<MultiselectOption v-bind="option" />
			</template>
			<template #option="option">
				<MultiselectOption v-bind="option" />
			</template>
		</NcSelect>
	</div>
</template>

<script>
import MultiselectOption from './MultiselectOption.vue'

import NcSelect from '@nextcloud/vue/dist/Components/NcSelect.js'

export default {
	components: {
		NcSelect,
		MultiselectOption,
	},
	props: {
		value: {
			type: Object,
			default: null,
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
	emits: ['change-value'],
	computed: {
		isDisabled() {
			return this.options.length < 2 || this.disabled
		},
	},
	methods: {
		/**
		 * @param {object} value The selected value
		 */
		change(value) {
			if (!value) {
				return
			}
			this.$emit('change-value', value)
		},
	},
}
</script>

<style lang="scss" scoped>
.property__item {
	display: flex;
	border-bottom: 1px solid var(--color-border);
	width: 100%;

	:deep(.v-select.select) {
		width: 100%;

		&.vs--disabled .vs {
			&__search,
			&__dropdown-toggle {
				background-color: transparent;
			}
			&__actions {
				display: none;
			}
		}

		.placeholder__icon {
			display: flex;
			height: 44px;
			width: 44px;
			justify-content: center;
			flex-basis: 44px;
			flex-shrink: 0;
		}

		.vs {
			&__dropdown-toggle {
				margin:  0;
				padding: 0;
				border: none;
				outline: none !important;
			}

			&__selected-options {
				width: calc(100% - 35px);
				height: 44px;
				margin:  0;
				padding: 0;
				border: none;
			}

			&__selected {
				width: 100%;
				height: 44px;
				margin:  0;
				padding: 0;
				border: none;
			}

			&__dropdown-menu {
				border-radius: 0;
				box-shadow: none;
				border: 1px solid var(--color-border-dark);
				margin:  0;
				padding: 0;
			}

			&__dropdown-option {
				margin-left: -1px;
				margin:  0;
				padding: 0;
				border: none;
			}

			&__search {
				padding-left: 44px;
				margin: 0;
				height: 44px !important;
				line-height: 44px;
				font-weight: bold;
				position: absolute;
				width: 100%;

				&::placeholder {
					color: var(--color-text-lighter);
					opacity: 1;
				}
			}

			&__actions {
				cursor: pointer;

				span {
					cursor: pointer;
				}
			}
		}
	}
}
</style>

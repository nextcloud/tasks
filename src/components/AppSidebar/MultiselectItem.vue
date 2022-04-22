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
		<Multiselect label="displayName"
			:disabled="isDisabled"
			:options="options"
			:value="value"
			:placeholder="placeholder"
			:multiple="false"
			:searchable="false"
			:allow-empty="false"
			:close-on-select="true"
			open-direction="below"
			track-by="type"
			@input="change"
			@tag="change">
			<template #placeholder>
				<MultiselectOption :display-name="placeholder" :icon="icon" />
			</template>
			<template #singleLabel="scope">
				<MultiselectOption v-bind="scope.option" />
			</template>
			<template #option="scope">
				<MultiselectOption v-bind="scope.option" />
			</template>
		</Multiselect>
	</div>
</template>

<script>
import MultiselectOption from './MultiselectOption.vue'

import Multiselect from '@nextcloud/vue/dist/Components/Multiselect'

export default {
	components: {
		Multiselect,
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
.property__item::v-deep {
	display: flex;
	border-bottom: 1px solid var(--color-border);
	width: 100%;

	.multiselect {
		width: 100%;

		&:hover .multiselect__placeholder {
			color: var(--color-text-lighter);
		}

		&--active .multiselect__tags {
			border: 1px solid var(--color-border-dark);
		}

		&--disabled,
		&--disabled .multiselect__single {
			background-color: var(--color-main-background) !important;

			& * {
				cursor: default !important;
			}
		}

		&__tags {
			border: 1px solid transparent;
			height: 44px;

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
		}

		&__content-wrapper li > span {
			padding: 0;

			&.multiselect__option--selected {
				color: var(--color-main-text);
			}
		}
	}
}
</style>

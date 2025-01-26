<!--
Nextcloud - Tasks

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
	<div v-click-outside="() => setValue()"
		:class="{
			'property__item--clearable': value > 0 && !readOnly,
			'property__item--readonly': readOnly
		}"
		:style="{'color': color}"
		class="property__item">
		<div class="item__content" @click="setEditing(true)">
			<span class="content__icon">
				<slot name="icon" />
			</span>
			<span v-show="!editing" class="content__name">
				{{ propertyString }}
			</span>
			<div v-if="editing" class="content__input">
				<input v-model="newValue"
					type="number"
					:min="minValue"
					:max="maxValue"
					@keyup.escape="setEditing(false)"
					@keydown.enter.prevent="setValue()">
				<input v-model="newValue"
					type="range"
					:min="minValue"
					:max="maxValue"
					step="1">
			</div>
		</div>
		<div class="item__actions">
			<NcActions v-show="editing" class="actions__set">
				<NcActionButton @click="setValue()">
					<template #icon>
						<Check :size="20" />
					</template>
					{{ t('tasks', 'Set value') }}
				</NcActionButton>
			</NcActions><NcActions v-show="editing" class="actions__clear">
				<NcActionButton @click="clearValue">
					<template #icon>
						<Delete :size="20" />
					</template>
					{{ t('tasks', 'Delete value') }}
				</NcActionButton>
			</NcActions>
		</div>
	</div>
</template>

<script>
import editableItem from '../../mixins/editableItem.js'

import { translate as t } from '@nextcloud/l10n'

export default {
	name: 'SliderItem',
	mixins: [editableItem],
	props: {
		/**
		 * The current value
		 */
		value: {
			type: Number,
			default: null,
		},
		minValue: {
			type: Number,
			default: 0,
		},
		maxValue: {
			type: Number,
			default: 10,
		},
		color: {
			type: String,
			default: null,
		},
	},
	computed: {
		isValid() {
			return this.value > 0
		},
	},
	methods: {
		t,
	},
}
</script>

<style lang="scss" scoped>
.property__item {
	border-bottom: 1px solid var(--color-border);
	padding: 0;
	position: relative;
	margin-bottom: 0;
	width: 100%;
	color: var(--color-text-lighter);
	display: flex;
	padding: 0 6px;

	& * {
		cursor: pointer;
	}

	.item {
		&__content {
			display: flex;
			line-height: var(--default-clickable-area);
			min-width: 0;
			flex-grow: 1;
			gap: 0 4px;

			.content {
				&__icon {
					display: flex;
					height: var(--default-clickable-area);
					width: var(--default-clickable-area);
					min-width: var(--default-clickable-area);
					justify-content: center;

					.material-design-icon__svg {
						vertical-align: middle;
					}
				}

				&__name {
					font-weight: bold;
					flex-grow: 1;
					padding-right: 14px;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}

				&__input {
					display: flex;
					flex-grow: 1;
					flex-wrap: wrap;
					align-content: center;

					input[type='number'] {
						width: 50px;
						flex-basis: 50px;
						flex-shrink: 0;
						background: none repeat scroll 0 0 var(--color-background-dark);
						margin: 0;
						min-height: 0;
					}

					input[type='range'] {
						flex-grow: 1;
						flex-shrink: 1;
						min-width: 100px;
						flex-basis: 100px;
						border: medium none;
						box-shadow: none;
						margin: 0;
						margin-left: 5px;
					}
				}
			}
		}

		&__actions {
			display: flex;
			flex-wrap: nowrap;
		}
	}

	&--readonly * {
		cursor: default;
	}

	&--clearable:hover .actions__clear {
		display: inline-block !important;
	}
}
</style>

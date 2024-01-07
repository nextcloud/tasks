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
	<div v-click-outside="() => setValue()"
		:class="{
			'property__item--clearable': value && !readOnly,
			'property__item--readonly': readOnly
		}"
		:style="{'color': color}"
		class="property__item">
		<div class="item__content" @click="setEditing(true, $event)">
			<span class="content__icon">
				<slot name="icon" />
			</span>
			<span v-show="!editing" v-linkify="{text: propertyString, linkify: true}" class="content__name" />
			<div v-if="editing" class="content__input">
				<input ref="input"
					v-model="newValue"
					type="string"
					@keyup.27="setEditing(false)"
					@keydown.enter.prevent="setValue()">
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
import Linkify from '@nextcloud/vue/dist/Directives/Linkify.js'

export default {
	name: 'TextItem',
	directives: {
		Linkify,
	},
	mixins: [editableItem],
	props: {
		/**
		 * The current value
		 */
		value: {
			type: String,
			default: null,
		},
		color: {
			type: String,
			default: null,
		},
	},
	methods: {
		t,

		/**
		 * Focus the input field after editing is enabled
		 */
		editingEnabled() {
			if (this.editing) {
				this.$nextTick(
					() => {
						this.$refs.input.focus()
					},
				)
			}
		},
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

	& * {
		cursor: pointer;
	}

	.item {
		&__content {
			display: flex;
			line-height: 44px;
			min-width: 0;
			flex-grow: 1;

			.content {
				&__icon {
					display: flex;
					height: 44px;
					width: 44px;
					min-width: 44px;
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

					input {
						flex-grow: 1;
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

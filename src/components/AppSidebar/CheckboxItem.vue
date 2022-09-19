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
	<div class="property__item" :class="{'property__item--disabled': readOnly}">
		<input :id="id"
			type="checkbox"
			class="checkbox"
			:name="id"
			:aria-checked="checked"
			:checked="checked"
			:disabled="readOnly"
			@click="$emit('set-checked', checked)">
		<label :for="id">
			<span>{{ propertyString }}</span>
		</label>
	</div>
</template>

<script>

export default {
	props: {
		id: {
			type: String,
			required: true,
		},
		checked: {
			type: Boolean,
			default: false,
		},
		readOnly: {
			type: Boolean,
			default: false,
		},
		propertyString: {
			type: String,
			default: '',
		},
	},
	emits: ['set-checked'],
}
</script>

<style lang="scss" scoped>
.property__item {
	border-bottom: 1px solid var(--color-border);
	color: var(--color-text-lighter);
	line-height: 44px;
	cursor: pointer;
	width: 100%;

	&--disabled * {
		cursor: default;
	}

	input[type='checkbox'].checkbox + label {
		display: flex;
		width: 100%;

		&::before {
			margin: 13px;
			border-width: 2px;
			border-radius: var(--border-radius);
			min-width: 18px;
			min-height: 18px;
			box-sizing: border-box;
		}
		> span {
			font-weight: bold;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			cursor: pointer;
		}
	}
}
</style>

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
	<div :style="{'color': color}" :class="optionClass" class="multiselect-picker-option">
		<span class="multiselect-picker-option__icon">
			<component :is="icon" :size="20" />
		</span>
		<span class="multiselect-picker-option__label">
			{{ displayName }}
		</span>
	</div>
</template>

<script>
export default {
	name: 'MultiselectOption',
	props: {
		displayName: {
			type: String,
			required: true,
		},
		icon: {
			type: String,
			default: null,
		},
		optionClass: {
			type: String,
			default: null,
		},
		color: {
			type: String,
			default: null,
		},
	},
}
</script>

<style lang="scss" scoped>
.multiselect-picker-option {
	display: flex;
	align-items: center;
	flex-grow: 1;
	width: 100%;
	cursor: pointer;
	color: var(--color-text-lighter);

	&.active {
		color: #4271a6;

		.multiselect-picker-option__icon .icon {
			opacity: 1;
		}
	}

	&.center {
		justify-content: center;
	}

	&__icon {
		display: flex;
		height: var(--default-clickable-area);
		width: var(--default-clickable-area);
		justify-content: center;
		flex-basis: var(--default-clickable-area);
		flex-shrink: 0;
	}

	&__label {
		padding-right: 14px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		margin-left: 4px;
	}
}
</style>

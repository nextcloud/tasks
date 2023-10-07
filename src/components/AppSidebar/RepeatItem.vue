<!--
Nextcloud - Tasks

@author Sunik Kupfer
@copyright 2023 Sunik Kupfer <mail@sunik.de>

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
		<div class="repeat__icon">
			<component :is="icon" :size="20" />
		</div>
		{{ recurrence }}
	</div>
</template>

<script>

import { translate as t } from '@nextcloud/l10n'

export default {
	components: {
	},
	props: {
		recurrence: {
			type: String,
			default: null,
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
	methods: {
		t,
	},
}
</script>

<style lang="scss" scoped>
.property__item {
	display: flex;
	border-bottom: 1px solid var(--color-border);
	width: 100%;
	color: var(--color-text-lighter);

	.repeat__icon {
		display: flex;
		height: 44px;
		width: 44px;
		justify-content: center;
		flex-basis: 44px;
		flex-shrink: 0;
	}
}
</style>

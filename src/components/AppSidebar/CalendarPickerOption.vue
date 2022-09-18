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
	<div class="calendar-picker-option">
		<div class="calendar-picker-option__color-indicator"
			:style="{ backgroundColor: color }" />

		<span class="calendar-picker-option__label">
			{{ displayName }}
		</span>

		<NcAvatar v-if="isSharedWithMe"
			class="calendar-picker-option__avatar"
			:disable-menu="true"
			:disable-tooltip="true"
			:user="userId"
			:display-name="userDisplayName"
			:size="18" />
	</div>
</template>

<script>
import NcAvatar from '@nextcloud/vue/dist/Components/NcAvatar.js'
export default {
	name: 'CalendarPickerOption',
	components: {
		NcAvatar,
	},
	props: {
		color: {
			type: String,
			required: true,
		},
		displayName: {
			type: String,
			required: true,
		},
		owner: {
			type: String,
			required: true,
		},
		isSharedWithMe: {
			type: Boolean,
			required: true,
		},
	},
	computed: {
		/**
		 * Get the principal object of the calendar's owner
		 *
		 * @return {null|object}
		 */
		principal() {
			return this.$store.getters.getPrincipalByUrl(this.owner)
		},
		/**
		 * Gets the user-id of the calendar's owner
		 *
		 * @return {undefined|string}
		 */
		userId() {
			if (this.principal) {
				return this.principal.userId
			}
			return undefined
		},
		/**
		 * Gets the displayname of the calendar's owner
		 *
		 * @return {undefined|string}
		 */
		userDisplayName() {
			if (this.principal) {
				return this.principal.displayname
			}
			return undefined
		},
	},
}
</script>

<style lang="scss" scoped>
.calendar-picker-option {
	display: flex;
	align-items: center;
	flex-grow: 1;
	width: 100%;

	&__color-indicator {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		border: none;
		flex-basis: 16px;
		flex-shrink: 0;
		margin: 14px;
	}

	&__label {
		overflow: hidden;
		text-overflow: ellipsis;
		flex-grow: 1;
		font-weight: bold;
		white-space: nowrap;
	}

	&__avatar {
		flex-basis: 18px;
		flex-shrink: 0;
	}
}
</style>

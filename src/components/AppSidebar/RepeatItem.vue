<!--
Nextcloud - Tasks

@author Sunik Kupfer
@copyright 2023 Sunik Kupfer <mail@sunik.de>
@author Raimund Schlüßler
@copyright 2018 Raimund Schlüßler <raimund.schluessler@mailbox.org>

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
		<RepeatSummary class="property-repeat__summary__content"
			:recurrence-rule="recurrence" />
		<Actions>
			<ActionButton @click="toggleOptions">
				<template #icon>
					<component :is="toggleIcon" :size="20" decorative />
				</template>
				{{ toggleTitle }}
			</ActionButton>
		</Actions>

		<div v-if="showOptions" class="property-repeat__options">
			options
		</div>
	</div>
</template>

<script>

import { translate as t } from '@nextcloud/l10n'
import RepeatSummary from './RepeatItem/RepeatSummary.vue'
import Pencil from 'vue-material-design-icons/Pencil.vue'
import Check from 'vue-material-design-icons/Check.vue'
import { NcActions as Actions, NcActionButton as ActionButton } from '@nextcloud/vue'

export default {
	components: {
		RepeatSummary,
		Actions,
		ActionButton,
		Pencil,
		Check,
	},
	props: {
		recurrence: {
			type: Object,
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
	data() {
		return {
			showOptions: false,
		}
	},
	computed: {
		/**
		 * The name of the icon for the toggle options button
		 *
		 * @return {string}
		 */
		toggleIcon() {
			if (this.showOptions) {
				return 'Check'
			}
			return 'Pencil'
		},
		/**
		 * The text of the toggle options button
		 *
		 * @return {string}
		 */
		toggleTitle() {
			if (this.showOptions) {
				return this.t('calendar', 'Save')
			}
			return this.t('calendar', 'Edit')
		},
	},
	methods: {
		t,
		/**
		 * Toggle visibility of the options
		 */
		toggleOptions() {
			this.showOptions = !this.showOptions
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

	.repeat__icon {
		display: flex;
		height: 44px;
		width: 44px;
		justify-content: center;
		flex-basis: 44px;
		flex-shrink: 0;
	}

	.property-repeat {
		width: 100%;

		&__summary {
			display: flex;
			align-items: center;
			margin-bottom: 5px;

			&__icon {
				width: 34px;
				height: 34px;
				margin-left: -5px;
				margin-right: 5px;
			}

			&__content {
				flex: 1 auto;
				padding: 0 7px;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}

		&__options {
			margin-bottom: 5px;
		}
	}
}
</style>

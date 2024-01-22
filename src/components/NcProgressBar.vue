<!--
  - @copyright Copyright (c) 2020 Marco Ambrosini <marcoambrosini@icloud.com>
  -
  - @author Marco Ambrosini <marcoambrosini@icloud.com>
  -
  - @copyright Copyright (c) 2024 Raimund Schlüßler <raimund.schluessler@mailbox.org>
  - @author Raimund Schlüßler
  -
  - @license GNU AGPL version 3 or any later version
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as
  - published by the Free Software Foundation, either version 3 of the
  - License, or (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program. If not, see <http://www.gnu.org/licenses/>.
-->

<template>
	<span v-if="type === 'circular'"
		role="progressbar"
		:aria-valuenow="value"
		:style="{ '--progress-bar-height': height + 'px' }"
		:class="{ 'progress-bar--error': error }"
		class="progress-bar progress-bar--circular">
		<svg :height="height"
			:width="height">
			<circle stroke="currentColor"
				fill="transparent"
				:stroke-dasharray="`${progress * circumference} ${(1 - progress) * circumference}`"
				:stroke-dashoffset="0.25*circumference"
				:stroke-width="stroke"
				:r="radiusNormalized"
				:cx="radius"
				:cy="radius" />
			<circle stroke="var(--color-background-darker)"
				fill="transparent"
				:stroke-dasharray="`${(1 - progress) * circumference} ${progress * circumference}`"
				:stroke-dashoffset="(0.25 - progress) * circumference"
				:stroke-width="stroke"
				:r="radiusNormalized"
				:cx="radius"
				:cy="radius" />
		</svg>
	</span>
	<progress v-else
		class="progress-bar progress-bar--linear vue"
		:class="{ 'progress-bar--error': error }"
		:style="{'--progress-bar-height': height + 'px' }"
		:value="value"
		max="100" />
</template>

<script>
export default {

	name: 'NcProgressBar',

	props: {
		/**
		 * An integer between 1 and 100
		 */
		value: {
			type: Number,
			default: 0,
			validator(value) {
				return value >= 0
					&& value <= 100
			},
		},
		/**
		 * Determines the height of the progressbar.
		 * Possible values:
		 * - 'small' (default)
		 * - 'medium'
		 * - Number
		 * @type {'small'|'medium'|number}
		 */
		size: {
			type: [String, Number],
			default: 'small',
			validator(value) {
				return ['small', 'medium'].includes(value) || typeof value === 'number'
			},
		},
		/**
		 * Applies an error color to the progressbar if true.
		 */
		error: {
			type: Boolean,
			default: false,
		},
		/**
		 * ProgressBar type
		 */
		type: {
			type: String,
			default: 'linear',
			validator(value) {
				return ['linear', 'circular'].includes(value)
			},
		},
		color: {
			type: String,
			default: null,
		},
	},
	data() {
		return {
			stroke: 4,
		}
	},
	computed: {
		height() {
			if (this.type === 'circular') {
				if (Number.isInteger(this.size)) {
					return this.size
				}
				return 44
			}
			if (this.size === 'small') {
				return 4
			} else if (this.size === 'medium') {
				return 6
			}
			return this.size
		},
		progress() {
			return this.value / 100
		},
		radius() {
			return this.height / 2
		},
		radiusNormalized() {
			return this.radius - 3 * this.stroke
		},
		circumference() {
			return this.radiusNormalized * 2 * Math.PI
		},
	},
}
</script>

<style lang="scss" scoped>

.progress-bar {
	display: block;
	height: var(--progress-bar-height);

	--progress-bar-color: v-bind(color);

	&--linear {
		width: 100%;
		overflow: hidden;
		border: 0;
		padding: 0;
		background: var(--color-background-dark);
		border-radius: calc(var(--progress-bar-height) / 2);

		// Browser specific rules
		&::-webkit-progress-bar {
			height: var(--progress-bar-height);
			background-color: transparent;
		}
		&::-webkit-progress-value {
			background: var(--progress-bar-color, var(--gradient-primary-background));
			border-radius: calc(var(--progress-bar-height) / 2);
		}
		&::-moz-progress-bar {
			background: var(--progress-bar-color, var(--gradient-primary-background));
			border-radius: calc(var(--progress-bar-height) / 2);
		}
	}
	&--circular {
		width: var(--progress-bar-height);
		color: var(--progress-bar-color, var(--color-primary-element));
	}
	&--error {
		color: var(--color-error) !important;
		// Override previous values
		&::-moz-progress-bar {
			background: var(--color-error) !important;
		}
		&::-webkit-progress-value {
			background: var(--color-error) !important;
		}
	}
}

</style>

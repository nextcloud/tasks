<!--
Nextcloud - Tasks

@author Raimund Schlüßler
@author Raghu Nayyar
@author Georg Ehrke
@author John Molakvoæ
@copyright 2018 Raimund Schlüßler <raimund.schluessler@mailbox.org>
@copyright 2018 Raghu Nayyar <beingminimal@gmail.com>
@copyright 2018 Georg Ehrke <oc.list@georgehrke.com>
@copyright 2018 John Molakvoæ <skjnldsv@protonmail.com>

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
	<div class="colorpicker">
		<ul class="colorpicker__list">
			<li v-for="color in colors"
				:key="color"
				:class="{ selected: (color===selectedColor) }"
				:style="{'background-color': color}"
				@click="pick(color)" />
			<li v-if="!supportsColorPicker"
				:style="{'background-color': random}"
				@click="randomizeColour">
				<span class="icon icon-random" />
			</li>
			<label v-if="supportsColorPicker"
				:style="{'background-color': selectedColor}"
				class="color-selector">
				<input :value="selectedColor"
					type="color"
					class="color-selector__input"
					@change="pick($event.target.value)">
			</label>
		</ul>
	</div>
</template>

<script>
export default {
	name: 'Colorpicker',
	props: {
		selectedColor: {
			type: String,
			default: '#31CC7C',
		},
	},
	emits: ['color-selected'],
	data() {
		return {
			random: '#31CC7C',
			colors: [
				'#31CC7C',
				'#317CCC',
				'#FF7A66',
				'#F1DB50',
				'#7C31CC',
				'#CC317C',
				'#3A3B3D',
				'#CACBCD',
			],
		}
	},
	methods: {
		supportsColorPicker() {
			const inputElement = document.createElement('input')
			inputElement.setAttribute('type', 'color')
			return inputElement.type === 'color'
		},
		randomizeColour() {
			this.random = this.randColour()
			this.pick(this.random)
		},
		pick(color) {
			this.$emit('color-selected', color)
		},
		/*
		* Generate a random colour with the core generator
		*/
		randColour() {
			if (typeof String.prototype.toHsl === 'function') {
				return this.rgbToHex(this.hslToRgb(Math.random().toString().toHsl()))
			} else {
				return this.colors[Math.floor(Math.random() * this.colors.length)]
			}
		},
		/*
		* Convert rgb array to hex string
		*/
		rgbToHex(r, g, b) {
			if (Array.isArray(r)) {
				g = r[1]
				b = r[2]
				r = r[0]
			}
			return '#' + parseInt(r, 10).toString(16) + parseInt(g, 10).toString(16) + parseInt(b, 10).toString(16)
		},

		/* https://github.com/kayellpeee/hsl_rgb_converter
		* expected hue range: [0, 360)
		* expected saturation range: [0, 1]
		* expected lightness range: [0, 1]
		*/
		hslToRgb(hue, saturation, lightness) {
			// based on algorithm from http://en.wikipedia.org/wiki/HSL_and_HSV#Converting_to_RGB
			if (Array.isArray(hue)) {
				saturation = hue[1]
				lightness = hue[2]
				hue = hue[0]
			}
			if (hue === undefined) {
				return [0, 0, 0]
			}
			saturation /= 100
			lightness /= 100

			const chroma = (1 - Math.abs((2 * lightness) - 1)) * saturation
			let huePrime = hue / 60
			const secondComponent = chroma * (1 - Math.abs((huePrime % 2) - 1))

			huePrime = Math.floor(huePrime)
			let red
			let green
			let blue

			if (huePrime === 0) {
				red = chroma
				green = secondComponent
				blue = 0
			} else if (huePrime === 1) {
				red = secondComponent
				green = chroma
				blue = 0
			} else if (huePrime === 2) {
				red = 0
				green = chroma
				blue = secondComponent
			} else if (huePrime === 3) {
				red = 0
				green = secondComponent
				blue = chroma
			} else if (huePrime === 4) {
				red = secondComponent
				green = 0
				blue = chroma
			} else if (huePrime === 5) {
				red = chroma
				green = 0
				blue = secondComponent
			}

			const lightnessAdjustment = lightness - (chroma / 2)
			red += lightnessAdjustment
			green += lightnessAdjustment
			blue += lightnessAdjustment

			return [Math.round(red * 255), Math.round(green * 255), Math.round(blue * 255)]
		},
	},
}
</script>

<style lang="scss" scoped>
.colorpicker {
	display: block;
	height: auto;
	padding-bottom: 3px;
	padding-top: 3px;

	&__list {
		display: inline-flex;
		flex-wrap: wrap;
		width: 100%;
		height: 100%;
		text-align: center;
		justify-content: center;
		align-items: center;

		.color-selector {
			display: block;
			height: 24px;
			width: calc(100% / 9) !important;
			background-image: url('../../../img/color_picker.svg');
			background-repeat: no-repeat;
			background-position: center center;

			&__input {
				visibility: hidden;
			}
		}

		li {
			height: 24px;
			width: calc(100% / 9) !important;

			&.selected {
				border: 1px solid black;
			}
		}
	}
}
</style>

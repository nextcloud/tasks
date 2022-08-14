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
	<span role="img"
		class="task-icon">
		<svg :width="size"
			:height="size"
			viewBox="0 0 32 32">
			<path :fill="color"
				:stroke="color"
				stroke-miterlimit="10"
				stroke-width=".75"
				d="m14.383 26.764s0.259-0.716 0.563-1.367c4.908-10.57 11.212-17.53 14.008-20.69 2.264-2.559 1.378-2.156 0.375-1.503-4.09 2.659-11.742 11.206-14.668 14.169-0.542 0.545-1.769 1.833-2.045 1.833-0.313 0-1.358-0.481-1.955-0.833-2.282-1.338-4.464-2.643-5.834-3.136-2.917-1.049-2.092-0.052-1.926 0.281 0.521 1.042 7.566 6.689 9.899 9.356 0.722 0.824 1.583 1.89 1.583 1.89z" />
		</svg>
	</span>
</template>

<script>
export default {
	data() {
		return {
			color: 'currentColor',
		}
	},
}
</script>

<style lang="scss" scoped>
.task-icon {
	display: flex;
	align-self: center;
	justify-self: center;
	align-items: center;
	justify-content: center;
}
</style>

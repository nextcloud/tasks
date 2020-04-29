<!--
Nextcloud - Tasks

@author Raimund Schlüßler
@copyright 2019 Raimund Schlüßler <raimund.schluessler@mailbox.org>

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
License as published by the Free Software Foundation; either
version 3 of the License, or any later version.

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU AFFERO GENERAL PUBLIC LICENSE for more details.

You should have received a copy of the GNU Affero General Public
License along with this library.  If not, see <http://www.gnu.org/licenses/>.

-->

<template>
	<div ref="markdown-container" class="markdown-body" />
</template>

<script>
import MarkdownIt from 'markdown-it'
import Mila from 'markdown-it-link-attributes'
import MarkdownItEmoji from 'markdown-it-emoji'
import Mitl from 'markdown-it-task-lists'

export default {
	name: 'Markdown',
	props: {
		source: {
			type: String,
			default: '',
		},
		linkify: {
			type: Boolean,
			default: true,
		},
	},
	data() {
		const md = new MarkdownIt({
			linkify: this.linkify,
			breaks: true,
		})
			.use(MarkdownItEmoji)
			.use(Mila, {
				attrs: {
					target: '_blank',
					rel: 'nofollow',
				},
			})
			.use(Mitl)
		return {
			md,
		}
	},
	watch: {
		source: {
			immediate: true,
			handler(val) {
				this.$nextTick(_ => {
					this.$refs['markdown-container'].innerHTML = this.md.render(val)
				})
			},
		},
	},
}
</script>

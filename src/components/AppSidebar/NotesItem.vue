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
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU AFFERO GENERAL PUBLIC LICENSE for more details.

You should have received a copy of the GNU Affero General Public
License along with this library. If not, see <http://www.gnu.org/licenses/>.

-->

<template>
	<div v-click-outside="() => setEditing(false)"
		class="property__item"
		@click="setEditing(true, $event)">
		<div :class="{'content__note--editing': editing}" class="content__note">
			<div
				id="note__viewer"
				ref="note__viewer"
				:source="note"
				class="note__viewer" />
			<div class="note__editor">
				<pre><span>{{ newNote }}</span><br><br></pre>
				<textarea ref="note__editor" v-model="newNote" @change="setNote" />
			</div>
		</div>
	</div>
</template>

<script>
import MarkdownIt from 'markdown-it'
import Mila from 'markdown-it-link-attributes'
import MarkdownItEmoji from 'markdown-it-emoji'
import Mitl from 'markdown-it-task-lists'

import ClickOutside from 'v-click-outside'

export default {
	name: 'NotesItem',
	directives: {
		clickOutside: ClickOutside.directive,
	},
	props: {
		note: {
			type: String,
			required: true,
		},
		readOnly: {
			type: Boolean,
			default: false,
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
			editing: false,
			newNote: this.note,
		}
	},
	watch: {
		note: {
			immediate: true,
			handler(val) {
				this.$nextTick(_ => {
					this.$refs.note__viewer.innerHTML = this.md.render(val)
				})
			},
		},
	},
	methods: {
		/**
		 * Emits the current note to the parent component
		 * when editing ends
		 */
		setNote() {
			// Set the property if editing is active.
			if (this.editing) {
				this.$emit('setNote', this.newNote)
			}
			this.setEditing(false)
		},
		/**
		 * Sets the editing mode if allowed.
		 *
		 * @param {Boolean} editing If editing is enabled
		 * @param {Object} $event The event which triggered the function
		 */
		setEditing(editing, $event) {
			if (this.readOnly) {
				return
			}

			if ($event?.target.tagName === 'A') {
				return
			}

			// If we just start editing, we sync note
			// and new note
			if (!this.editing && editing) {
				this.newNote = this.note
			}

			this.editing = editing
			this.$emit('editing', this.editing)

			// Focus textarea if we are editing
			if (this.editing) {
				this.$nextTick(
					() => {
						this.$refs.note__editor.focus()
					}
				)
			}
		},
	},
}
</script>

<style lang="scss" scoped>
.property__item {
	display: flex;
	width: 100%;
	padding: 15px;
	font-size: 13px;
	line-height: 26px;
	cursor: text;
	min-height: 140px;
	word-wrap: break-word;

	.content__note {
		width: 100%;
		height: 100%;

		&--editing.content__note {
			.note__viewer {
				display: none;
			}

			.note__editor {
				display: block;
			}
		}

		.note {
			&__viewer {
				cursor: text;
			}

			&__editor {
				display: none;
				position: relative;
				margin-left: -1px;

				textarea,
				pre {
					box-shadow: none;
					background: none repeat scroll 0 0 transparent;
					border: medium none;
					line-height: 26px;
					padding: 0;
					white-space: pre-wrap;
					word-wrap: break-word;
				}

				textarea {
					margin: 0 0 0 1px;
					border-radius: 0;
					height: 100%;
					left: 0;
					overflow: hidden;
					position: absolute;
					resize: none;
					top: 0;
					width: 100%;
					color: var(--color-main-text);
					font-weight: 500;
					outline: medium none;
				}

				pre {
					border: 0 none !important;
					display: block;
					margin: 0;
					outline: 0 none;
					padding: 0 !important;
					visibility: hidden;
				}
			}
		}
	}
}

#note__viewer::v-deep {
	width: 100% !important;
	min-height: 40px;
	cursor: text;

	* {
		white-space: normal;
		word-wrap: break-word;
		overflow-wrap: break-word;
	}

	a {
		opacity: .5;
		text-decoration: underline;
	}

	s {
		text-decoration: line-through;
	}

	em {
		font-style: italic;
	}

	ol,
	ul {
		margin-left: 20px;
		margin-bottom: 10px;
	}

	ul {
		list-style-type: disc;

		&.contains-task-list {
			list-style-type: none;
			margin-left: 0;
		}
	}

	h1 {
		font-size: 18px;
		font-weight: 600;
		margin-bottom: 5px;
	}

	h2 {
		font-size: 16px;
		font-weight: 600;
	}

	h3 {
		font-size: 14px;
		font-weight: 600;
	}

	h4 {
		font-size: 13px;
		font-weight: 600;
	}

	h6 {
		font-size: 12px;
		font-weight: 600;
	}

	pre {
		background-color: var(--color-background-dark);
		padding: 3px;
		overflow: auto;

		code {
			white-space: pre;
		}
	}

	img {
		max-width: 100%;
		max-height: 50vh;
		margin: auto;
		display: block;
	}

	input[type=checkbox] {
		margin-right: 7px;
		vertical-align: -2px;
		line-height: 10px;
		font-size: 10px;
		display: inline-block;
		min-height: 12px;
	}

	li input[type='checkbox'].checkbox + label::before {
		margin-left: -15px;

	}
	input[type='checkbox'].checkbox + label::before {
		position: relative;
		z-index: 100;
		margin-right: 10px;
		margin-top: 0;
	}
	li input[type='checkbox'].checkbox:not(:checked) + label::before {
		background-color: var(--color-main-background);
	}

	table {
		margin-bottom: 10px;
		border-collapse: collapse;

		thead {
			background-color: var(--color-background-dark);
		}
		td, th {
			border: 1px solid var(--color-background-darker);
			padding: 3px;
		}
	}

	blockquote {
		padding: 10px 20px;
		margin: 0 0 20px;
		font-size: 17.5px;
		border-left: 5px solid var(--color-background-dark);
	}
}
</style>

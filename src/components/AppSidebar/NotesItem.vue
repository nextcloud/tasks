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
	<div v-click-outside="() => setValue()"
		class="property__item">
		<div :class="{'content__note--editing': editing}"
			class="content__note"
			@click="setEditing(true, $event)">
			<div id="note__viewer"
				ref="note__viewer"
				:source="value"
				class="note__viewer"
				:class="{'note__viewer--empty': !value.trim()}" />
			<div class="note__editor">
				<pre><span>{{ newValue }}</span><br><br></pre>
				<textarea ref="note__editor"
					v-model="newValue"
					@keyup.27="setEditing(false)"
					@keydown.enter.ctrl.prevent="setValue()"
					@change="setValue()" />
			</div>
		</div>
	</div>
</template>

<script>
import editableItem from '../../mixins/editableItem.js'

import { subscribe, unsubscribe } from '@nextcloud/event-bus'
import { translate as t } from '@nextcloud/l10n'

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
	mixins: [editableItem],
	props: {
		value: {
			type: String,
			required: true,
		},
	},
	data() {
		const md = new MarkdownIt({
			linkify: true,
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
		value: {
			immediate: true,
			handler(val) {
				this.$nextTick(_ => {
					// Show placeholder if note is empty
					if (!val.trim()) {
						val = t('tasks', 'Click here to add a note.')
					}
					this.$refs.note__viewer.innerHTML = this.md.render(val)
				})
			},
		},
	},
	mounted() {
		subscribe('tasks:edit-appsidebar-notes', this.setNotes)
	},
	beforeDestroy() {
		unsubscribe('tasks:edit-appsidebar-notes', this.setNotes)
	},
	methods: {
		/**
		 * Focus the notes field after editing is enabled
		 */
		editingEnabled() {
			// Focus textarea if we are editing
			if (this.editing) {
				this.$nextTick(
					() => {
						this.$refs.note__editor.focus()
					}
				)
			}
		},
		setNotes($event) {
			this.setEditing(true, $event)
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
	min-height: 140px;
	height: 100%;
	word-wrap: break-word;

	.content__note {
		width: 100%;
		height: 100%;
		cursor: text;

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

				&--empty {
					display: flex;
					justify-content: center;
					font-size: var(--default-font-size);
				}
			}

			&__editor {
				display: none;
				position: relative;

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
					outline: medium none;
				}

				pre {
					border: 0 none !important;
					display: block;
					margin: 0;
					outline: 0 none;
					padding: 0 !important;
					visibility: hidden;
					padding-bottom: 50px !important;
				}
			}
		}
	}
}

:deep(#note__viewer) {
	width: 100% !important;
	min-height: 40px;
	cursor: text;
	font-size: var(--default-font-size);
	margin-left: 1px;

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
		height: auto;
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

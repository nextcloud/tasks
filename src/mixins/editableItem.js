/**
 * Nextcloud - Tasks
 *
 * @author Raimund Schlüßler
 *
 * @copyright 2021 Raimund Schlüßler <raimund.schluessler@mailbox.org>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library. If not, see <http://www.gnu.org/licenses/>.
 *
 */
import Task from '../models/task.js'

import { NcActions, NcActionButton } from '@nextcloud/vue'

import Check from 'vue-material-design-icons/Check.vue'
import Delete from 'vue-material-design-icons/Delete.vue'

import ClickOutside from 'v-click-outside'

export default {
	components: {
		NcActions,
		NcActionButton,
		Check,
		Delete,
	},
	directives: {
		clickOutside: ClickOutside.directive,
	},
	props: {
		/**
		 * Is the value read only?
		 */
		readOnly: {
			type: Boolean,
			default: false,
		},
		/**
		 * The string to show when
		 * editing is not active
		 */
		propertyString: {
			type: String,
			default: '',
		},
		/**
		 * The task to edit
		 */
		task: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			newValue: this.value,
			editing: false,
		}
	},
	/**
	 * Save possible edits before destroying the component
	 * (e.g. when the sidebar is hidden)
	 */
	beforeDestroy() {
		this.setValue()
	},
	watch: {
		/**
		 * We have to watch the task for changes,
		 * so we can save possible edits before
		 * navigating away.
		 *
		 * @param {Task} newTask The task to navigate to
		 * @param {Task} oldTask The task to navigate from
		 */
		task(newTask, oldTask) {
			this.setValue(oldTask)
		},
	},
	methods: {
		/**
		 * Emits the current value to the parent component
		 * when editing ends
		 *
		 * @param {Task} task The task for which to set the value
		 */
		setValue(task = this.task) {
			// Set the property if editing is active.
			if (this.editing) {
				this.$emit('set-value', { task, value: this.newValue })
			}
			this.setEditing(false)
		},
		/**
		 * Removes the value
		 */
		clearValue() {
			this.$emit('set-value', { task: this.task, value: null })
			this.setEditing(false)
		},
		/**
		 * Sets the editing mode if allowed.
		 *
		 * @param {boolean} editing If editing is enabled
		 * @param {object} $event The event which triggered the function
		 */
		setEditing(editing, $event) {
			if (this.readOnly) { return }

			if ($event?.target.tagName === 'A') {
				return
			}

			// If we just start editing, we sync value
			// and new value
			if (!this.editing && editing) {
				this.newValue = this.value
			}

			this.editing = editing
			this.$emit('editing', this.editing)

			this.editingEnabled()
		},

		/**
		 * Function to call after editing is enabled
		 * (important for notes item)
		 */
		editingEnabled() {},
	},
}

/**
 * Nextcloud - Tasks
 *
 * @author Raimund Schlüßler
 * @copyright 2021 Raimund Schlüßler <raimund.schluessler@mailbox.org>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
import Actions from '@nextcloud/vue/dist/Components/Actions'
import ActionButton from '@nextcloud/vue/dist/Components/ActionButton'

import Check from 'vue-material-design-icons/Check.vue'
import Delete from 'vue-material-design-icons/Delete.vue'

import ClickOutside from 'v-click-outside'

export default {
	components: {
		Actions,
		ActionButton,
		Check,
		Delete,
	},
	directives: {
		clickOutside: ClickOutside.directive,
	},
	props: {
		/**
		 * Is the date read only?
		 */
		readOnly: {
			type: Boolean,
			default: false,
		},
		/**
		 * The datetime string to show when
		 * editing is not active
		 */
		propertyString: {
			type: String,
			default: '',
		},
		/**
		 * Whether we show the delete button on hover
		 */
		clearable: {
			type: Boolean,
			default: false,
		},
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
				this.$emit('setValue', { task, value: this.newValue })
			}
			this.setEditing(false)
		},
		/**
		 * Removes the value
		 */
		clearValue() {
			this.$emit('setValue', { task: this.task, value: null })
			this.setEditing(false)
		},
		/**
		 * Sets the editing mode if allowed.
		 *
		 * @param {Boolean} editing If editing is enabled
		 */
		setEditing(editing) {
			if (this.readOnly) { return }

			// If we just start editing, we sync value
			// and new value
			if (!this.editing && editing) {
				this.newValue = this.value
			}

			this.editing = editing
			this.$emit('editing', this.editing)
		},
	},
}

/**
 * Nextcloud - Tasks
 *
 * @author Raimund Schlüßler
 *
 * @copyright 2023 Raimund Schlüßler <raimund.schluessler@mailbox.org>
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

export default {
	methods: {
		openNewTask(task) {
			// Only open the details view if there is enough space or if it is already open.
			if (this.$route.value !== undefined && (document.documentElement.clientWidth >= 768 || this.$route.value?.params.taskId !== undefined)) {
				// Open the details view for the new task
				const calendarId = this.$route.value.params.calendarId
				const collectionId = this.$route.value.params.collectionId
				if (calendarId) {
					this.$router.push({ name: 'calendarsTask', params: { calendarId, taskId: task.uri } })
				} else if (collectionId) {
					if (collectionId === 'week') {
						this.$router.push({
							name: 'collectionsParamTask',
							params: { collectionId, taskId: task.uri, collectionParam: '0' },
						})
					} else {
						this.$router.push({ name: 'collectionsTask', params: { collectionId, taskId: task.uri } })
					}
				}
			}
		},
	},
}

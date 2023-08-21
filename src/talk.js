/**
 * Nextcloud - Tasks
 *
 * @author Julius Härtl
 *
 * @copyright 2021 Julius Härtl <jus@bitgrid.net>
 *
 * @author Jakob Röhrl
 *
 * @copyright 2021 Jakob Röhrl <jakob.roehrl@web.de>
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

import TaskCreateDialog from './components/TaskCreateDialog.vue'
import { buildSelector } from './helpers/selector.js'

import { translate as t, translatePlural as n } from '@nextcloud/l10n'
import { generateUrl } from '@nextcloud/router'

import Vue from 'vue'

Vue.prototype.t = t
Vue.prototype.n = n
Vue.prototype.$OC = OC
Vue.prototype.$OCA = OCA
Vue.prototype.$appVersion = appVersion

window.addEventListener('DOMContentLoaded', () => {
	if (!window.OCA?.Talk?.registerMessageAction) {
		return
	}

	window.OCA.Talk.registerMessageAction({
		label: t('tasks', 'Create a task'),
		icon: 'icon-tasks',
		async callback({ message: { message, messageParameters, actorDisplayName }, metadata: { name: conversationName, token: conversationToken } }) {
			const parsedMessage = message.replace(/{[a-z0-9-_]+}/gi, function(parameter) {
				const parameterName = parameter.substr(1, parameter.length - 2)

				if (messageParameters[parameterName]) {
					if (messageParameters[parameterName].type === 'file' && messageParameters[parameterName].path) {
						return messageParameters[parameterName].path
					}
					if (messageParameters[parameterName].type === 'user' || messageParameters[parameterName].type === 'call') {
						return '@' + messageParameters[parameterName].name
					}
					if (messageParameters[parameterName].name) {
						return messageParameters[parameterName].name
					}
				}

				// Do not replace so insert with curly braces again
				return parameter
			})

			const shortenedMessageCandidate = parsedMessage.replace(/^(.{255}[^\s]*).*/, '$1')
			const shortenedMessage = shortenedMessageCandidate === '' ? parsedMessage.substr(0, 255) : shortenedMessageCandidate
			try {
				await buildSelector(TaskCreateDialog, {
					title: shortenedMessage,
					description: parsedMessage + '\n\n' + '['
						+ t('tasks', 'Message from {author} in {conversationName}', { author: actorDisplayName, conversationName })
						+ '](' + generateUrl('/call/' + conversationToken) + ')',
				})
			} catch (e) {
				console.debug('Task creation dialog was canceled')
			}
		},
	})
})

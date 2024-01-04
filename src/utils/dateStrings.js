/**
 * Nextcloud - Tasks
 *
 * @author Raimund Schlüßler
 *
 * @copyright 2024 Raimund Schlüßler <raimund.schluessler@mailbox.org>
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

/**
 * Returns a formatted string for the due date
 *
 * @param {Task} task The task
 * @return {string} The formatted due date string
 */
export function dueDateString(task) {
	if (task.allDay) {
		return task.dueMoment.calendar(null, {
			// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
			sameDay: t('tasks', '[Due today]'),
			// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
			nextDay: t('tasks', '[Due tomorrow]'),
			// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LL" will be replaced with a date, e.g. 'September 4 1986'. Please translate the string and keep the brackets and the "LL".
			nextWeek: t('tasks', '[Due on] LL'),
			// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string, but keep the brackets.
			lastDay: t('tasks', '[Was due yesterday]'),
			// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LL" will be replaced with a date, e.g. 'September 4 1986'. Please translate the string, but keep the brackets and the "LL".
			lastWeek: t('tasks', '[Was due on] LL'),
			sameElse(now) {
				if (this.isBefore(now)) {
					// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string, but keep the brackets and the "LL".
					return t('tasks', '[Was due on] LL')
				} else {
					// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string, but keep the brackets and the "LL".
					return t('tasks', '[Due on] LL')
				}
			},
		})
	} else {
		return task.dueMoment.calendar(null, {
			sameDay(now) {
				if (this.isBefore(now)) {
					// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LT" will be replaced with a time, e.g. '08:30 PM'. Please translate the string and keep the brackets and the "LT".
					return t('tasks', '[Was due today at] LT')
				} else {
					// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LT" will be replaced with a time, e.g. '08:30 PM'. Please translate the string and keep the brackets and the "LT".
					return t('tasks', '[Due today at] LT')
				}
			},
			// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LT" will be replaced with a time, e.g. '08:30 PM'. Please translate the string and keep the brackets and the "LT".
			nextDay: t('tasks', '[Due tomorrow at] LT'),
			// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LT" will be replaced with a time, e.g. '08:30 PM'. Please translate the string and keep the brackets and the "LT".
			nextWeek: t('tasks', '[Due on] LL [at] LT'),
			// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LT" will be replaced with a time, e.g. '08:30 PM'. Please translate the string and keep the brackets and the "LT".
			lastDay: t('tasks', '[Was due yesterday at] LT'),
			// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LL" will be replaced with a date, e.g. 'September 4 1986' and "LT" will be replaced with a time, e.g. '08:30 PM'. Please translate the string and keep the brackets the "LL" and the "LT".
			lastWeek: t('tasks', '[Was due on] LL [at] LT'),
			sameElse(now) {
				if (this.isBefore(now)) {
					// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LL" will be replaced with a date, e.g. 'September 4 1986' and "LT" will be replaced with a time, e.g. '08:30 PM'. Please translate the string and keep the brackets the "LL" and the "LT".
					return t('tasks', '[Was due on] LL [at] LT')
				} else {
					// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LL" will be replaced with a date, e.g. 'September 4 1986' and "LT" will be replaced with a time, e.g. '08:30 PM'. Please translate the string and keep the brackets the "LL" and the "LT".
					return t('tasks', '[Due on] LL [at] LT')
				}
			},
		})
	}
}

/**
 * Returns a formatted string for the start date
 *
 * @param {Task} task The task
 * @return {string} The formatted start date string
 */
export function startDateString(task) {
	if (task.allDay) {
		return task.startMoment.calendar(null, {
			// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
			sameDay: t('tasks', '[Starts today]'),
			// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
			nextDay: t('tasks', '[Starts tomorrow]'),
			// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LL" will be replaced with a date, e.g. 'September 4 1986'. Please translate the string, and keep the brackets and the "LL".
			nextWeek: t('tasks', '[Starts on] LL'),
			// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. Please translate the string and keep the brackets.
			lastDay: t('tasks', '[Started yesterday]'),
			// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LL" will be replaced with a date, e.g. 'September 4 1986'. Please translate the string, and keep the brackets and the "LL".
			lastWeek: t('tasks', '[Started on] LL'),
			sameElse(now) {
				if (this.isBefore(now)) {
					// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LL" will be replaced with a date, e.g. 'September 4 1986'. Please translate the string, and keep the brackets and the "LL".
					return t('tasks', '[Started on] LL')
				} else {
					// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LL" will be replaced with a date, e.g. 'September 4 1986'. Please translate the string, and keep the brackets and the "LL".
					return t('tasks', '[Starts on] LL')
				}
			},
		})
	} else {
		return task.startMoment.calendar(null, {
			sameDay(now) {
				if (this.isBefore(now)) {
					// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LT" will be replaced with a time, e.g. '08:30 PM'. Please translate the string and keep the brackets and the "LT".
					return t('tasks', '[Started today at] LT')
				} else {
					// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LT" will be replaced with a time, e.g. '08:30 PM'. Please translate the string and keep the brackets and the "LT".
					return t('tasks', '[Starts today at] LT')
				}
			},
			// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LT" will be replaced with a time, e.g. '08:30 PM'. Please translate the string and keep the brackets and the "LT".
			nextDay: t('tasks', '[Starts tomorrow at] LT'),
			// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LL" will be replaced with a date, e.g. 'September 4 1986' and "LT" will be replaced with a time, e.g. '08:30 PM'. Please translate the string and keep the brackets the "LL" and the "LT".
			nextWeek: t('tasks', '[Starts on] LL [at] LT'),
			// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LT" will be replaced with a time, e.g. '08:30 PM'. Please translate the string and keep the brackets and the "LT".
			lastDay: t('tasks', '[Started yesterday at] LT'),
			// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LL" will be replaced with a date, e.g. 'September 4 1986' and "LT" will be replaced with a time, e.g. '08:30 PM'. Please translate the string and keep the brackets the "LL" and the "LT".
			lastWeek: t('tasks', '[Started on] LL [at] LT'),
			sameElse(now) {
				if (this.isBefore(now)) {
					// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LL" will be replaced with a date, e.g. 'September 4 1986' and "LT" will be replaced with a time, e.g. '08:30 PM'. Please translate the string and keep the brackets the "LL" and the "LT".
					return t('tasks', '[Started on] LL [at] LT')
				} else {
					// TRANSLATORS This is a string for moment.js. The square brackets escape the string from moment.js. "LL" will be replaced with a date, e.g. 'September 4 1986' and "LT" will be replaced with a time, e.g. '08:30 PM'. Please translate the string and keep the brackets the "LL" and the "LT".
					return t('tasks', '[Starts on] LL [at] LT')
				}
			},
		})
	}
}

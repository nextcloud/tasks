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

import { translate as t, translatePlural as n } from '@nextcloud/l10n'
import moment from '@nextcloud/moment'
import { convertTimeZone } from './alarms.js'

/**
 * Returns a formatted string for the due date
 *
 * @param {import('../models/task.js').Task} task The task
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
 * @param {import('../models/task.js').Task} task The task
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

/**
 * Formats an alarm
 *
 * @param {object} alarm The alarm object to format
 * @param {boolean} isAllDay Whether or not the event is all-day
 * @param {string} currentUserTimezone The current timezone of the user
 * @param {string} locale The locale to format it in
 * @return {string}
 */
export function formatAlarm(alarm, isAllDay, currentUserTimezone, locale) {
	if (alarm.relativeTrigger !== null) {
		// Relative trigger
		if (isAllDay && alarm.relativeIsRelatedToStart && alarm.relativeTrigger < 86400) {
			if (alarm.relativeTrigger === 0) {
				return t('tasks', 'Midnight on the day the task starts')
			}

			const date = new Date()
			date.setHours(alarm.relativeHoursAllDay)
			date.setMinutes(alarm.relativeMinutesAllDay)
			date.setSeconds(0)
			date.setMilliseconds(0)
			const formattedHourMinute = moment(date).locale(locale).format('LT')

			if (alarm.relativeTrigger < 0) {
				if (alarm.relativeUnitAllDay === 'days') {
					return n('tasks',
						'%n day before the task at {formattedHourMinute}',
						'%n days before the task at {formattedHourMinute}',
						alarm.relativeAmountAllDay, {
							formattedHourMinute,
						})
				} else {
					return n('tasks',
						'%n week before the task at {formattedHourMinute}',
						'%n weeks before the task at {formattedHourMinute}',
						alarm.relativeAmountAllDay, {
							formattedHourMinute,
						})
				}
			}
			return t('tasks', 'on the day of the task at {formattedHourMinute}', {
				formattedHourMinute,
			})
		} else {
			// Alarms at the task's start or end
			if (alarm.relativeTrigger === 0) {
				if (alarm.relativeIsRelatedToStart) {
					return t('tasks', 'at the task\'s start')
				} else {
					return t('tasks', 'when the task is due')
				}
			}

			const time = moment.duration(Math.abs(alarm.relativeTrigger), 'seconds').locale(locale).humanize()

			if (alarm.relativeTrigger < 0) {
				if (alarm.relativeIsRelatedToStart) {
					return t('tasks', '{time} before the task starts', { time })
				} else {
					return t('tasks', '{time} before the task is due', { time })
				}
			}

			if (alarm.relativeIsRelatedToStart) {
				return t('tasks', '{time} after the task starts', { time })
			} else {
				return t('tasks', '{time} after the task is due', { time })
			}
		}
	} else {
		// Absolute trigger
		// There are no timezones in the VALARM component, since dates can only be relative or saved as UTC.
		const currentUserTimezoneDate = convertTimeZone(alarm.absoluteDate, currentUserTimezone)
		return moment(currentUserTimezoneDate).locale(locale).calendar(null, {
			sameElse: 'LLL', // Overwrites the default `DD/MM/YYYY` (which misses the time)
		})
	}
}

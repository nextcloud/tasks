/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { translate as t, translatePlural as n } from '@nextcloud/l10n'

/**
 * Get translated ordinal number (first, second, third, etc.)
 *
 * @param {number} ordinal The ordinal number (1-5 for first-fifth, -1 for last, -2 for second to last)
 * @return {string} Translated ordinal string
 */
export function getTranslatedOrdinalNumber(ordinal) {
	switch (ordinal) {
	case 1:
		return t('tasks', 'first')
	case 2:
		return t('tasks', 'second')
	case 3:
		return t('tasks', 'third')
	case 4:
		return t('tasks', 'fourth')
	case 5:
		return t('tasks', 'fifth')
	case -1:
		return t('tasks', 'last')
	case -2:
		return t('tasks', 'second to last')
	default:
		return String(ordinal)
	}
}

/**
 * Get translated frequency string
 *
 * @param {string} frequency The frequency (DAILY, WEEKLY, MONTHLY, YEARLY)
 * @param {number} interval The interval
 * @return {string} Translated frequency string
 */
function getTranslatedFrequency(frequency, interval) {
	switch (frequency) {
	case 'DAILY':
		return n('tasks', 'day', 'days', interval)
	case 'WEEKLY':
		return n('tasks', 'week', 'weeks', interval)
	case 'MONTHLY':
		return n('tasks', 'month', 'months', interval)
	case 'YEARLY':
		return n('tasks', 'year', 'years', interval)
	default:
		return frequency
	}
}

/**
 * Get translated day name
 *
 * @param {string} day The day abbreviation (MO, TU, WE, TH, FR, SA, SU)
 * @return {string} Translated day name
 */
function getTranslatedDayName(day) {
	const dayNames = {
		MO: t('tasks', 'Monday'),
		TU: t('tasks', 'Tuesday'),
		WE: t('tasks', 'Wednesday'),
		TH: t('tasks', 'Thursday'),
		FR: t('tasks', 'Friday'),
		SA: t('tasks', 'Saturday'),
		SU: t('tasks', 'Sunday'),
	}
	return dayNames[day] || day
}

/**
 * Get translated month name
 *
 * @param {number} month The month number (1-12)
 * @return {string} Translated month name
 */
function getTranslatedMonthName(month) {
	const monthNames = [
		t('tasks', 'January'),
		t('tasks', 'February'),
		t('tasks', 'March'),
		t('tasks', 'April'),
		t('tasks', 'May'),
		t('tasks', 'June'),
		t('tasks', 'July'),
		t('tasks', 'August'),
		t('tasks', 'September'),
		t('tasks', 'October'),
		t('tasks', 'November'),
		t('tasks', 'December'),
	]
	return monthNames[month - 1] || String(month)
}

/**
 * Format a recurrence rule into a human-readable string
 *
 * @param {object} recurrenceRule The recurrence rule object
 * @param {string} locale The locale (unused, kept for API compatibility)
 * @return {string} Human-readable recurrence description
 */
export default function formatRecurrenceRule(recurrenceRule, locale) {
	if (!recurrenceRule || recurrenceRule.frequency === 'NONE') {
		return t('tasks', 'Does not repeat')
	}

	const { frequency, interval, byDay, byMonthDay, byMonth, bySetPosition, count, until } = recurrenceRule

	let result = ''

	// Build the base frequency string
	if (interval === 1) {
		switch (frequency) {
		case 'DAILY':
			result = t('tasks', 'Daily')
			break
		case 'WEEKLY':
			result = t('tasks', 'Weekly')
			break
		case 'MONTHLY':
			result = t('tasks', 'Monthly')
			break
		case 'YEARLY':
			result = t('tasks', 'Yearly')
			break
		default:
			result = frequency
		}
	} else {
		result = t('tasks', 'Every {interval} {frequency}', {
			interval,
			frequency: getTranslatedFrequency(frequency, interval),
		})
	}

	// Add by-day information for weekly
	if (frequency === 'WEEKLY' && byDay && byDay.length > 0) {
		const dayNames = byDay.map(getTranslatedDayName).join(', ')
		result += ' ' + t('tasks', 'on {days}', { days: dayNames })
	}

	// Add by-month-day or by-set-position information for monthly
	if (frequency === 'MONTHLY') {
		if (byMonthDay && byMonthDay.length > 0) {
			result += ' ' + t('tasks', 'on day {days}', { days: byMonthDay.join(', ') })
		} else if (bySetPosition !== null && byDay && byDay.length > 0) {
			const ordinal = getTranslatedOrdinalNumber(bySetPosition)
			const dayNames = byDay.map(getTranslatedDayName).join(', ')
			result += ' ' + t('tasks', 'on the {ordinal} {dayNames}', { ordinal, dayNames })
		}
	}

	// Add by-month information for yearly
	if (frequency === 'YEARLY' && byMonth && byMonth.length > 0) {
		const monthNames = byMonth.map(getTranslatedMonthName).join(', ')
		result += ' ' + t('tasks', 'in {months}', { months: monthNames })
	}

	// Add end condition
	if (count !== null) {
		result += ', ' + n('tasks', '{count} time', '{count} times', count, { count })
	} else if (until !== null) {
		const untilDate = until instanceof Date ? until : new Date(until)
		result += ', ' + t('tasks', 'until {date}', { date: untilDate.toLocaleDateString() })
	}

	return result
}

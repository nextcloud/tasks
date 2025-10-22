/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import moment from '@nextcloud/moment'

/**
 * Get the factor for a given unit
 *
 * @param {string} unit The name of the unit to get the factor of
 * @return {number}
 */
export function getFactorForAlarmUnit(unit) {
	switch (unit) {
	case 'seconds':
		return 1

	case 'minutes':
		return 60

	case 'hours':
		return 60 * 60

	case 'days':
		return 24 * 60 * 60

	case 'weeks':
		return 7 * 24 * 60 * 60

	default:
		return 1
	}
}

/**
 * Gets the amount of days / weeks, unit from total seconds
 *
 * @param {number} totalSeconds Total amount of seconds
 * @return {{amount: number, unit: string}}
 */
export function getAmountAndUnitForTimedEvents(totalSeconds) {
	// Before or after the event is handled somewhere else,
	// so make sure totalSeconds is positive
	totalSeconds = Math.abs(totalSeconds)

	// Handle the special case of 0, so we don't show 0 weeks
	if (totalSeconds === 0) {
		return {
			amount: 0,
			unit: 'minutes',
		}
	}

	if (totalSeconds % (7 * 24 * 60 * 60) === 0) {
		return {
			amount: totalSeconds / (7 * 24 * 60 * 60),
			unit: 'weeks',
		}
	}
	if (totalSeconds % (24 * 60 * 60) === 0) {
		return {
			amount: totalSeconds / (24 * 60 * 60),
			unit: 'days',
		}
	}
	if (totalSeconds % (60 * 60) === 0) {
		return {
			amount: totalSeconds / (60 * 60),
			unit: 'hours',
		}
	}
	if (totalSeconds % (60) === 0) {
		return {
			amount: totalSeconds / (60),
			unit: 'minutes',
		}
	}

	return {
		amount: totalSeconds,
		unit: 'seconds',
	}
}

/**
 * Gets the amount of days / weeks, unit, hours and minutes from total seconds
 *
 * @param {number} totalSeconds Total amount of seconds
 * @return {{amount: *, unit: *, hours: *, minutes: *}}
 */
export function getAmountHoursMinutesAndUnitForAllDayEvents(totalSeconds) {
	const dayFactor = getFactorForAlarmUnit('days')
	const hourFactor = getFactorForAlarmUnit('hours')
	const minuteFactor = getFactorForAlarmUnit('minutes')
	const isNegative = totalSeconds < 0
	totalSeconds = Math.abs(totalSeconds)

	let dayPart = Math.floor(totalSeconds / dayFactor)
	const hourPart = totalSeconds % dayFactor

	if (hourPart !== 0) {
		if (isNegative) {
			dayPart++
		}
	}

	let amount = 0
	let unit = null
	if (dayPart === 0) {
		unit = 'days'
	} else if (dayPart % 7 === 0) {
		amount = dayPart / 7
		unit = 'weeks'
	} else {
		amount = dayPart
		unit = 'days'
	}

	let hours = Math.floor(hourPart / hourFactor)
	const minutePart = hourPart % hourFactor
	let minutes = Math.floor(minutePart / minuteFactor)

	if (isNegative) {
		hours = 24 - hours

		if (minutes !== 0) {
			hours--
			minutes = 60 - minutes
		}
	}

	return {
		amount,
		unit,
		hours,
		minutes,
	}
}

/**
 * Get the total amount of seconds for all-day events
 *
 * @param {number} amount amount of unit
 * @param {number} hours Time of reminder
 * @param {number} minutes Time of reminder
 * @param {string} unit days/weeks
 * @return {number}
 */
export function getTotalSecondsFromAmountHourMinutesAndUnitForAllDayEvents(amount, hours, minutes, unit) {
	if (unit === 'weeks') {
		amount *= 7
		unit = 'days'
	}

	// 0 is on the same day of the all-day event => positive
	// 1 ... n before the event is negative
	const isNegative = amount > 0

	if (isNegative) {
		// If it's negative, we need to subtract one day
		amount--
		// Convert days to seconds
		amount *= getFactorForAlarmUnit(unit)

		let invertedHours = 24 - hours
		let invertedMinutes = 0

		if (minutes !== 0) {
			invertedHours--
			invertedMinutes = 60 - minutes
		}

		amount += (invertedHours * getFactorForAlarmUnit('hours'))
		amount += (invertedMinutes * getFactorForAlarmUnit('minutes'))

		amount *= -1
	} else {
		// Convert days to seconds
		amount *= getFactorForAlarmUnit('days')

		amount += (hours * getFactorForAlarmUnit('hours'))
		amount += (minutes * getFactorForAlarmUnit('minutes'))
	}

	return amount
}

/**
 * @param {boolean} allDay Is all day?
 */
export function getDefaultAlarms(allDay = false) {
	if (allDay) {
		return [
			9 * 60 * 60, // On the day of the event at 9am
			-15 * 60 * 60, // 1 day before at 9am
			-39 * 60 * 60, // 2 days before at 9am
			-159 * 60 * 60, // 1 week before at 9am
		]
	} else {
		return [
			0, // At the time of the event
			-10 * 60, // 10 minutes before
			-30 * 60, // 30 minutes before
			-1 * 60 * 60, // 1 hour before
			-2 * 60 * 60, // 2 hour before
			-1 * 24 * 60 * 60, // 1 day before
			-2 * 24 * 60 * 60, // 2 days before
		]
	}
}

/**
 * @return {Date[]}
 */
export function getDefaultAbsoluteAlarms() {
	return [
		moment().add(1, 'day').startOf('day').add(9, 'hours').toDate(),
	]
}

/**
 *
 * @param {Date} date The date of the alarm
 * @param {string} timeZone The current user timezone
 * @return {Date}
 */
export function convertTimeZone(date, timeZone) {
	const utcDate = new Date(Date.UTC(
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
		date.getHours(),
		date.getMinutes(),
		date.getSeconds(),
		date.getMilliseconds(),
	))

	return new Date(utcDate.toLocaleString('en-US', { timeZone }))
}

/**
 * Gets a date object based on the given DateTimeValue
 * Ignores given timezone-information
 *
 * @typedef {import('@nextcloud/calendar-js').DateTimeValue} DateTimeValue
 * @param {DateTimeValue} dateTimeValue Value to get date from
 * @return {Date}
 */
export function getDateFromDateTimeValue(dateTimeValue) {
	return new Date(
		dateTimeValue.year,
		dateTimeValue.month - 1,
		dateTimeValue.day,
		dateTimeValue.hour,
		dateTimeValue.minute,
		0,
		0,
	)
}

/**
 * Takes the related date and the relative trigger of an alarm and
 * calculates the absolute date-time when the alarm will trigger.
 *
 * @param {Date} relatedDate Related date
 * @param {number} relativeTrigger Relative trigger in seconds
 */
export function calculateAbsoluteDateFromRelativeTrigger(relatedDate, relativeTrigger) {
	return new Date(((relatedDate.valueOf() / 1000) + relativeTrigger) * 1000)
}

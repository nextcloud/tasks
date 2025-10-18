/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import {
	getAmountAndUnitForTimedEvents,
	getAmountHoursMinutesAndUnitForAllDayEvents,
	getDateFromDateTimeValue,
} from '../utils/alarms.js'
import { AlarmComponent } from '@nextcloud/calendar-js'
import ICAL from 'ical.js'

/**
 * Creates a complete alarm object based on given props
 *
 * @param {object} props The alarm properties already provided
 * @return {object}
 */
const getDefaultAlarmObject = (props = {}) => Object.assign({}, {
	// The calendar-js alarm component
	alarmComponent: null,
	// Type of alarm: DISPLAY, EMAIL, AUDIO
	type: null,
	// Whether or not the alarm is relative
	isRelative: false,
	// Date object of an absolute alarm (if it's absolute, it must be DATE-TIME and UTC)
	absoluteDate: null,
	// Whether or not the relative alarm is before the event
	relativeIsBefore: null,
	// Whether or not the alarm is relative to the event's start
	relativeIsRelatedToStart: null,
	// TIMED EVENTS:
	// Unit (seconds, minutes, hours, ...) if this alarm is inside a timed event
	relativeUnitTimed: null,
	// The amount of unit if this alarm is inside a timed event
	relativeAmountTimed: null,
	// ALL-DAY EVENTS:
	// Unit (seconds, minutes, hours, ...) if this alarm is inside an all-day event
	relativeUnitAllDay: null,
	// The amount of unit if this alarm is inside an all-day event
	relativeAmountAllDay: null,
	// The hours to display alarm for in an all-day event (e.g. 1 day before at 9:00 am)
	relativeHoursAllDay: null,
	// The minutes to display alarm for in an all-day event (e.g. 1 day before at 9:30 am)
	relativeMinutesAllDay: null,
	// The total amount of seconds for a relative alarm
	relativeTrigger: null,
}, props)

/**
 * Map an alarm component to our alarm object
 *
 * @param {AlarmComponent} alarmComponent The calendar.js alarm-component to turn into an alarm object
 * @return {object}
 */
const mapAlarmComponentToAlarmObject = (alarmComponent) => {
	if (alarmComponent.trigger.isRelative()) {
		const relativeIsBefore = alarmComponent.trigger.value.isNegative
		const relativeIsRelatedToStart = alarmComponent.trigger.related === 'START'

		const {
			amount: relativeAmountTimed,
			unit: relativeUnitTimed,
		} = getAmountAndUnitForTimedEvents(alarmComponent.trigger.value.totalSeconds)

		const {
			unit: relativeUnitAllDay,
			amount: relativeAmountAllDay,
			hours: relativeHoursAllDay,
			minutes: relativeMinutesAllDay,
		} = getAmountHoursMinutesAndUnitForAllDayEvents(alarmComponent.trigger.value.totalSeconds)

		const relativeTrigger = alarmComponent.trigger.value.totalSeconds

		return getDefaultAlarmObject({
			alarmComponent,
			type: alarmComponent.action,
			isRelative: alarmComponent.trigger.isRelative(),
			relativeIsBefore,
			relativeIsRelatedToStart,
			relativeUnitTimed,
			relativeAmountTimed,
			relativeUnitAllDay,
			relativeAmountAllDay,
			relativeHoursAllDay,
			relativeMinutesAllDay,
			relativeTrigger,
		})
	} else {
		const absoluteDate = getDateFromDateTimeValue(alarmComponent.trigger.value)

		return getDefaultAlarmObject({
			alarmComponent,
			type: alarmComponent.action,
			isRelative: alarmComponent.trigger.isRelative(),
			absoluteDate,
		})
	}
}

/**
 * @param {Array<ICAL.Component>} alarms ICAL.js alarms
 */
export function mapICALAlarmsToAlarmObjects(alarms) {
	return alarms.map((alarm) => {
		try {
			return mapAlarmComponentToAlarmObject(AlarmComponent.fromICALJs(alarm))
		} catch (e) {
			// Instead of breaking the whole page when parsing an invalid alarm,
			// we just print a warning on the console.
			console.warn(e)
			return false
		}
	}).filter(Boolean)
}

/**
 * @param {number} time Total amount of seconds for the trigger
 * @param {boolean} relatedToStart If the alarm is related to the start of the event
 * @return {object} The alarm object
 */
export function getAlarmObjectFromTriggerTime(time, relatedToStart) {
	const timedData = getAmountAndUnitForTimedEvents(time)
	const allDayData = getAmountHoursMinutesAndUnitForAllDayEvents(time)

	return getDefaultAlarmObject({
		isRelative: true,
		relativeTrigger: time,
		relativeIsBefore: time < 0,
		relativeIsRelatedToStart: relatedToStart,
		relativeUnitTimed: timedData.unit,
		relativeAmountTimed: timedData.amount,
		relativeUnitAllDay: allDayData.unit,
		relativeAmountAllDay: allDayData.amount,
		relativeHoursAllDay: allDayData.hours,
		relativeMinutesAllDay: allDayData.minutes,
	})
}

/**
 * @param {Date} date The alarm date
 * @return {object} The alarm object
 */
export function getAlarmObjectFromDateTime(date) {
	return getDefaultAlarmObject({
		isRelative: false,
		relativeTrigger: null,
		absoluteDate: date,
	})
}

export { mapAlarmComponentToAlarmObject }

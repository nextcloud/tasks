/**
 * SPDX-FileCopyrightText: 2026 YouCha <chanha0406@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import ICAL from 'ical.js'
import { describe, expect, it } from 'vitest'

import {
	formatAppleProximityAlarm,
	getAppleProximityFromIcalAlarm,
} from '../../../../src/utils/appleProximity.js'

/**
 * @param {string} icsSnippet VALARM fragment
 * @return {ICAL.Component}
 */
function alarmFrom(icsSnippet) {
	const jCal = ICAL.parse(`BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VTODO\nUID:test\nSUMMARY:t\n${icsSnippet}\nEND:VTODO\nEND:VCALENDAR`)
	const vtodo = new ICAL.Component(jCal).getFirstSubcomponent('vtodo')
	return vtodo.getFirstSubcomponent('valarm')
}

const t = (app, str, vars = {}) => str.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`)

describe('utils/appleProximity', () => {
	it('reads a car CONNECT reminder without a place', () => {
		const alarm = alarmFrom(`BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:Reminder
TRIGGER;VALUE=DATE-TIME:19760401T005545Z
X-APPLE-PROXIMITY:CONNECT
END:VALARM`)

		expect(getAppleProximityFromIcalAlarm(alarm)).toEqual({
			type: 'CONNECT',
			location: '',
		})
		expect(formatAppleProximityAlarm(getAppleProximityFromIcalAlarm(alarm), t))
			.toBe('When getting in the car')
	})

	it('reads DEPART with a structured location title', () => {
		const alarm = alarmFrom(`BEGIN:VALARM
ACTION:DISPLAY
TRIGGER;VALUE=DATE-TIME:19760401T005545Z
X-APPLE-PROXIMITY:DEPART
X-APPLE-STRUCTURED-LOCATION;VALUE=URI;X-ADDRESS=;X-APPLE-RADIUS=1192.046111510581;X-TITLE=대한민국 경기도 수원시 16677:geo:37.255199,127.050757
END:VALARM`)

		expect(getAppleProximityFromIcalAlarm(alarm)).toEqual({
			type: 'DEPART',
			location: '대한민국 경기도 수원시 16677',
		})
		expect(formatAppleProximityAlarm(getAppleProximityFromIcalAlarm(alarm), t))
			.toBe('When leaving 대한민국 경기도 수원시 16677')
	})

	it('reads ARRIVE and flattens a folded address', () => {
		const alarm = alarmFrom(`BEGIN:VALARM
ACTION:DISPLAY
TRIGGER;VALUE=DATE-TIME:19760401T005545Z
X-APPLE-PROXIMITY:ARRIVE
X-APPLE-STRUCTURED-LOCATION;VALUE=URI;X-ADDRESS=대한민국\\n경기도\\n수원시\\n16677;X-TITLE=대한민국 경기도 수원시 16677:geo:37.255199,127.050757
END:VALARM`)

		expect(getAppleProximityFromIcalAlarm(alarm)).toEqual({
			type: 'ARRIVE',
			location: '대한민국 경기도 수원시 16677',
		})
		expect(formatAppleProximityAlarm(getAppleProximityFromIcalAlarm(alarm), t))
			.toBe('When arriving at 대한민국 경기도 수원시 16677')
	})

	it('ignores ordinary timed alarms', () => {
		const alarm = alarmFrom(`BEGIN:VALARM
ACTION:DISPLAY
TRIGGER;VALUE=DATE-TIME:20261026T030000Z
END:VALARM`)

		expect(getAppleProximityFromIcalAlarm(alarm)).toBeNull()
		expect(formatAppleProximityAlarm(null, t)).toBeNull()
	})
})

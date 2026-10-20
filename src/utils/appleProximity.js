/**
 * SPDX-FileCopyrightText: 2026 YouCha <chanha0406@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const PROXIMITY_TYPES = new Set(['ARRIVE', 'DEPART', 'CONNECT', 'DISCONNECT'])
const APPLE_SENTINEL_TRIGGER = '19760401T005545'

/**
 * @param {string|string[]|undefined} value Parameter or property value
 * @return {string}
 */
function firstString(value) {
	if (Array.isArray(value)) {
		return value.map((entry) => firstString(entry)).filter(Boolean).join(' ')
	}
	return value == null ? '' : String(value)
}

/**
 * @param {string} value Raw Apple address or title
 * @return {string}
 */
function collapseLocationText(value) {
	return firstString(value)
		.replace(/\\n/gi, ' ')
		.replace(/[\n\r]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
}

/**
 * @param {import('ical.js').Property|null} property Structured location property
 * @return {string}
 */
function locationFromProperty(property) {
	if (!property) {
		return ''
	}
	const title = collapseLocationText(property.getParameter('x-title'))
	if (title) {
		return title
	}
	return collapseLocationText(property.getParameter('x-address'))
}

/**
 * True when the VALARM uses Apple's dummy DATE-TIME for a location/car reminder.
 *
 * @param {import('ical.js').Component} alarm ICAL.js VALARM
 * @return {boolean}
 */
function hasAppleSentinelTrigger(alarm) {
	const trigger = alarm.getFirstProperty('trigger')
	if (!trigger) {
		return false
	}
	const value = trigger.getFirstValue()
	const encoded = typeof value?.toICALString === 'function'
		? value.toICALString()
		: firstString(value)
	return encoded.replace(/[-:]/g, '').includes(APPLE_SENTINEL_TRIGGER)
}

/**
 * Read Apple proximity metadata from a VALARM.
 *
 * @param {import('ical.js').Component} alarm ICAL.js VALARM
 * @return {{ type: string, location: string }|null}
 */
export function getAppleProximityFromIcalAlarm(alarm) {
	if (!alarm || typeof alarm.getFirstPropertyValue !== 'function') {
		return null
	}

	const type = firstString(alarm.getFirstPropertyValue('x-apple-proximity')).trim().toUpperCase()
	const location = locationFromProperty(alarm.getFirstProperty('x-apple-structured-location'))

	if (PROXIMITY_TYPES.has(type)) {
		return { type, location }
	}

	if (hasAppleSentinelTrigger(alarm)) {
		return {
			type: location ? 'ARRIVE' : 'LOCATION',
			location,
		}
	}

	return null
}

/**
 * @param {{ type: string, location: string }|null|undefined} proximity Parsed Apple proximity
 * @param {Function} t Nextcloud translate function
 * @return {string|null}
 */
export function formatAppleProximityAlarm(proximity, t) {
	if (!proximity?.type) {
		return null
	}

	switch (proximity.type) {
	case 'CONNECT':
		return t('tasks', 'When getting in the car')
	case 'DISCONNECT':
		return t('tasks', 'When getting out of the car')
	case 'ARRIVE':
		return proximity.location
			? t('tasks', 'When arriving at {location}', { location: proximity.location })
			: t('tasks', 'When arriving at a location')
	case 'DEPART':
		return proximity.location
			? t('tasks', 'When leaving {location}', { location: proximity.location })
			: t('tasks', 'When leaving a location')
	default:
		return t('tasks', 'Location reminder')
	}
}

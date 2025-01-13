/**
 * @copyright Copyright (c) 2019 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
import { translate as t, translatePlural as n, getDayNames, getMonthNames } from '@nextcloud/l10n'
import moment from '@nextcloud/moment'

/**
 * Formats a recurrence-rule
 *
 * @param {object} recurrenceRule The recurrence-rule to format
 * @return {string}
 */
export default (recurrenceRule) => {
	if (recurrenceRule.frequency === 'NONE') {
		return t('tasks', 'Does not repeat')
	}

	let freqPart = ''
	if (recurrenceRule.interval === 1) {
		switch (recurrenceRule.frequency) {
		case 'DAILY':
			freqPart = t('tasks', 'Daily')
			break

		case 'WEEKLY':
			freqPart = t('tasks', 'Weekly')
			break

		case 'MONTHLY':
			freqPart = t('tasks', 'Monthly')
			break

		case 'YEARLY':
			freqPart = t('tasks', 'Yearly')
			break
		}
	} else {
		switch (recurrenceRule.frequency) {
		case 'DAILY':
			freqPart = n('tasks', 'Every %n day', 'Every %n days', recurrenceRule.interval)
			break

		case 'WEEKLY':
			freqPart = n('tasks', 'Every %n week', 'Every %n weeks', recurrenceRule.interval)
			break

		case 'MONTHLY':
			freqPart = n('tasks', 'Every %n month', 'Every %n months', recurrenceRule.interval)
			break

		case 'YEARLY':
			freqPart = n('tasks', 'Every %n year', 'Every %n years', recurrenceRule.interval)
			break
		}
	}

	let limitPart = ''
	if (recurrenceRule.frequency === 'WEEKLY' && recurrenceRule.byDay.length !== 0) {
		const formattedDays = getTranslatedByDaySet(recurrenceRule.byDay)

		limitPart = n('tasks', 'on {weekday}', 'on {weekdays}', recurrenceRule.byDay.length, {
			weekday: formattedDays,
			weekdays: formattedDays,
		})
	} else if (recurrenceRule.frequency === 'MONTHLY') {
		if (recurrenceRule.byMonthDay.length !== 0) {
			const dayOfMonthList = recurrenceRule.byMonthDay.join(', ')

			limitPart = n('tasks', 'on day {dayOfMonthList}', 'on days {dayOfMonthList}', recurrenceRule.byMonthDay.length, {
				dayOfMonthList,
			})
		} else {
			const ordinalNumber = getTranslatedOrdinalNumber(recurrenceRule.bySetPosition)
			const byDaySet = getTranslatedByDaySet(recurrenceRule.byDay)

			limitPart = t('tasks', 'on the {ordinalNumber} {byDaySet}', {
				ordinalNumber,
				byDaySet,
			})
		}
	} else if (recurrenceRule.frequency === 'YEARLY') {
		const monthNames = getTranslatedMonths(recurrenceRule.byMonth)

		if (recurrenceRule.byDay.length === 0) {
			limitPart = t('tasks', 'in {monthNames}', {
				monthNames,
			})
		} else {
			const ordinalNumber = getTranslatedOrdinalNumber(recurrenceRule.bySetPosition)
			const byDaySet = getTranslatedByDaySet(recurrenceRule.byDay)

			limitPart = t('tasks', 'in {monthNames} on the {ordinalNumber} {byDaySet}', {
				monthNames,
				ordinalNumber,
				byDaySet,
			})
		}
	}

	let endPart = ''
	if (recurrenceRule.until !== null) {
		const untilDate = moment(recurrenceRule.until).format('L')

		endPart = t('tasks', 'until {untilDate}', {
			untilDate,
		})
	} else if (recurrenceRule.count !== null) {
		endPart = n('tasks', '%n time', '%n times', recurrenceRule.count)
	}

	return [
		freqPart,
		limitPart,
		endPart,
	].join(' ').replace(/\s{2,}/g, ' ').trim()
}

/**
 * Gets the byDay list as formatted list of translated weekdays
 *
 * @param {string[]} byDayList The by-day-list to get formatted
 * @return {string}
 */
function getTranslatedByDaySet(byDayList) {
	const byDayNames = []
	const allByDayNames = getDayNames()

	// TODO: This should be sorted by first day of week
	// TODO: This should summarise:
	//  - SA, SU to weekend
	//  - MO, TU, WE, TH, FR to weekday
	//  - MO, TU, WE, TH, FR, SA, SU to day

	if (byDayList.includes('MO')) {
		byDayNames.push(allByDayNames[1])
	}
	if (byDayList.includes('TU')) {
		byDayNames.push(allByDayNames[2])
	}
	if (byDayList.includes('WE')) {
		byDayNames.push(allByDayNames[3])
	}
	if (byDayList.includes('TH')) {
		byDayNames.push(allByDayNames[4])
	}
	if (byDayList.includes('FR')) {
		byDayNames.push(allByDayNames[5])
	}
	if (byDayList.includes('SA')) {
		byDayNames.push(allByDayNames[6])
	}
	if (byDayList.includes('SU')) {
		byDayNames.push(allByDayNames[0])
	}

	return byDayNames.join(', ')
}

/**
 * Gets the byMonth list as formatted list of translated month-names
 *
 *
 * @param {string[]} byMonthList The by-month list to get formatted
 * @return {string}
 */
function getTranslatedMonths(byMonthList) {
	const sortedByMonth = byMonthList.slice().map((n) => parseInt(n, 10))
	sortedByMonth.sort((a, b) => a - b)

	const monthNames = []
	const allMonthNames = getMonthNames()

	for (const month of sortedByMonth) {
		monthNames.push(allMonthNames[month - 1])
	}

	return monthNames.join(', ')
}

/**
 * Gets the translated ordinal number for by-set-position
 *
 * @param {number} bySetPositionNum The by-set-position number to get the translation of
 * @return {string}
 */
function getTranslatedOrdinalNumber(bySetPositionNum) {
	switch (bySetPositionNum) {
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

	case -2:
		return t('tasks', 'second to last')

	case -1:
		return t('tasks', 'last')

	default:
		return ''
	}
}

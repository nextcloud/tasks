/**
 * Nextcloud - Tasks
 *
 * @author Raimund Schlüßler
 * @copyright 2018 Raimund Schlüßler <raimund.schluessler@mailbox.org>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
'use strict'

export default ({
	calendars: {
		'test-1': {
			uri: 'test-1',
			displayname: 'Test 1',
			color: '#ff0000',
			writable: true,
			url: '/nextcloud/remote.php/dav/calendars/raimund.schluessler/test-1',
			caldav: 'caldav-url',
			tasks: [
				{
					calendar: {
						writable: true,
						color: '#ff0000'
					},
					uid: 'ydf95848mn',
					uri: 'ydf95848mn.ics',
					// construct dates for tomorrow
					due: moment().add(1, 'days').format('YYYYMMDDTHHmmss'),
					start: moment().add(1, 'days').format('YYYYMMDDTHHmmss'),
					summary: 'Test 1 - Task 1',
					complete: 0,
					completed: true,
					priority: 1,
					categories: [
						{
							id: 1,
							name: 'Test 1 Category 1'
						},
						{
							id: 2,
							name: 'Test 1 Category 2'
						},
						{
							id: 3,
							name: 'Test 1 Category 3'
						},
						{
							id: 4,
							name: 'Test 1 Category 4'
						},
						{
							id: 5,
							name: 'Test 1 Category 5'
						},
						{
							id: 6,
							name: 'Test 1 Category 6'
						}
					],
					note: 'Migrate this app to vue.',
					hideSubtasks: false,
					allDay: false
				},
				{
					calendar: {
						writable: true,
						color: '#ff0000'
					},
					uid: 'ydf95748mn',
					uri: 'ydf95748mn.ics',
					// construct dates for yesterday
					due: moment().subtract(1, 'days').format('YYYYMMDDTHHmmss'),
					start: moment().subtract(1, 'days').format('YYYYMMDDTHHmmss'),
					summary: 'Test 1 - Task 2',
					complete: 20,
					completed: false,
					priority: 5,
					categories: [],
					note: 'Migrate this app to vue.',
					hideSubtasks: false,
					allDay: false
				},
				{
					calendar: {
						writable: true,
						color: '#ff0000'
					},
					uid: 'ydf95849mn',
					uri: 'ydf95849mn.ics',
					// construct dates for last week
					due: moment().subtract(5, 'days').format('YYYYMMDDTHHmmss'),
					start: moment().subtract(5, 'days').format('YYYYMMDDTHHmmss'),
					summary: 'Test 1 - Task 3',
					complete: 60,
					completed: false,
					priority: 7,
					categories: [],
					note: 'Migrate this app to vue.',
					related: 'ydf95748mn',
					hideSubtasks: false,
					allDay: false
				},
				{
					calendar: {
						writable: true,
						color: '#ff0000'
					},
					uid: 'rtf95849mn',
					uri: 'rtf95849mn.ics',
					// construct dates for next week
					due: moment().add(5, 'days').format('YYYYMMDDTHHmmss'),
					start: moment().add(5, 'days').format('YYYYMMDDTHHmmss'),
					summary: 'Test 1 - Task 4',
					complete: 0,
					completed: false,
					priority: 7,
					categories: [],
					note: 'Migrate this app to vue.',
					related: 'ydf95748mn',
					hideSubtasks: false,
					allDay: false
				},
				{
					calendar: {
						writable: true,
						color: '#ff0000'
					},
					uid: 'yaf92889mn',
					uri: 'yaf92889mn.ics',
					// construct dates for today future
					due: moment().add(1, 'hours').format('YYYYMMDDTHHmmss'),
					start: moment().add(1, 'hours').format('YYYYMMDDTHHmmss'),
					summary: 'Test 1 - Task 5',
					complete: 80,
					completed: false,
					priority: 7,
					categories: [],
					note: 'Migrate this app to vue.',
					related: 'ydf95849mn',
					hideSubtasks: false,
					allDay: false
				}
			]
		},
		'test-2': {
			uri: 'test-2',
			displayname: 'Test 2',
			color: '#eef',
			writable: false,
			url: '/nextcloud/remote.php/dav/calendars/raimund.schluessler/test-2',
			tasks: [
				{
					calendar: {
						writable: false,
						color: '#eef'
					},
					uid: 'ydf91848mn',
					uri: 'ydf91848mn.ics',
					// construct dates for today past
					due: moment().subtract(1, 'hours').format('YYYYMMDDTHHmmss'),
					start: moment().subtract(1, 'hours').format('YYYYMMDDTHHmmss'),
					summary: 'Test 2 - Task 1',
					complete: 90,
					completed: true,
					priority: 1,
					categories: [],
					note: 'Migrate this app to vue.',
					hideSubtasks: false,
					allDay: false
				},
				{
					calendar: {
						writable: false,
						color: '#eef'
					},
					uid: 'yef91848mn',
					uri: 'yef91848mn.ics',
					// construct dates for far future
					due: moment().add(5, 'years').format('YYYYMMDDTHHmmss'),
					start: moment().add(5, 'years').format('YYYYMMDDTHHmmss'),
					summary: 'Test 2 - Task 2',
					complete: 0,
					completed: false,
					priority: 5,
					categories: [],
					note: 'Migrate this app to vue.',
					hideSubtasks: false,
					allDay: false
				},
				{
					calendar: {
						writable: false,
						color: '#eef'
					},
					uid: 'yff91848mn',
					uri: 'yff91848mn.ics',
					// construct dates for far past
					due: moment().subtract(5, 'years').format('YYYYMMDDTHHmmss'),
					start: moment().subtract(5, 'years').format('YYYYMMDDTHHmmss'),
					summary: 'Test 2 - Task 3',
					complete: 6,
					completed: true,
					priority: 7,
					categories: [],
					note: 'Migrate this app to vue.',
					hideSubtasks: false,
					allDay: false
				},
				{
					calendar: {
						writable: false,
						color: '#eef'
					},
					uid: 'ydg91848mn',
					uri: 'ydg91848mn.ics',
					// construct dates for tomorrow, date only
					due: moment().add(1, 'days').format('YYYYMMDD'),
					start: moment().add(1, 'days').format('YYYYMMDD'),
					summary: 'Test 2 - Task 4',
					complete: 6,
					completed: false,
					priority: 7,
					categories: [],
					note: 'Migrate this app to vue.',
					hideSubtasks: false,
					allDay: true
				},
				{
					calendar: {
						writable: false,
						color: '#eef'
					},
					uid: 'ydh91848mn',
					uri: 'ydh91848mn.ics',
					// construct dates for yesterday, date only
					due: moment().subtract(1, 'days').format('YYYYMMDD'),
					start: moment().subtract(1, 'days').format('YYYYMMDD'),
					summary: 'Test 2 - Task 5',
					complete: 6,
					completed: false,
					priority: 7,
					categories: [],
					note: 'Migrate this app to vue.',
					hideSubtasks: false,
					allDay: true
				}
			]
		},
		'test-3': {
			uri: 'test-3',
			displayname: 'Test 3',
			color: '#112233',
			writable: true,
			url: '/nextcloud/remote.php/dav/calendars/raimund.schluessler/test-3',
			tasks: [

				{
					calendar: {
						writable: true,
						color: '#112233'
					},
					uid: 'ydi92848mn',
					uri: 'ydi92848mn.ics',
					// construct dates for last week, date only
					due: moment().subtract(5, 'days').format('YYYYMMDD'),
					start: moment().subtract(5, 'days').format('YYYYMMDD'),
					summary: 'Test 3 - Task 1',
					complete: 1,
					completed: false,
					priority: 1,
					categories: [],
					note: 'Migrate this app to vue.',
					hideSubtasks: false,
					allDay: true
				},
				{
					calendar: {
						writable: true,
						color: '#112233'
					},
					uid: 'ydj91848mn',
					uri: 'ydj91848mn.ics',
					// construct dates for next week, date only
					due: moment().add(5, 'days').format('YYYYMMDD'),
					start: moment().add(5, 'days').format('YYYYMMDD'),
					summary: 'Test 3 - Task 2',
					complete: 3,
					completed: true,
					priority: 5,
					categories: [],
					note: 'Migrate this app to vue.',
					hideSubtasks: false,
					allDay: true
				},
				{
					calendar: {
						writable: true,
						color: '#112233'
					},
					uid: 'ydk91848mn',
					uri: 'ydk91848mn.ics',
					// construct dates for today future, date only
					due: moment().add(1, 'hours').format('YYYYMMDD'),
					start: moment().add(1, 'hours').format('YYYYMMDD'),
					summary: 'Test 3 - Task 3',
					complete: 6,
					completed: false,
					priority: 7,
					categories: [],
					note: 'Migrate this app to vue.',
					hideSubtasks: false,
					allDay: true
				},
				{
					calendar: {
						writable: true,
						color: '#112233'
					},
					uid: 'ydl91848mn',
					uri: 'ydl91848mn.ics',
					// construct dates for today past, date only
					due: moment().subtract(1, 'hours').format('YYYYMMDD'),
					start: moment().subtract(1, 'hours').format('YYYYMMDD'),
					summary: 'Test 3 - Task 4',
					complete: 6,
					completed: false,
					priority: 7,
					categories: [],
					note: 'Migrate this app to vue.',
					hideSubtasks: false,
					allDay: true
				},
				{
					calendar: {
						writable: true,
						color: '#112233'
					},
					uid: 'ydl913r8mn',
					uri: 'ydl913r8mn.ics',
					// construct dates for today past, date only
					due: '',
					start: '',
					summary: 'Test 3 - Task 5',
					complete: 6,
					completed: false,
					priority: 7,
					categories: [],
					note: 'Migrate this app to vue.',
					hideSubtasks: false,
					allDay: false
				},
				{
					calendar: {
						writable: true,
						color: '#112233'
					},
					uid: 'y2w913r8mn',
					uri: 'y2w913r8mn.ics',
					summary: 'Test 3 - Task 6',
					complete: 6,
					completed: false,
					priority: 7,
					categories: [],
					note: 'Migrate this app to vue.',
					hideSubtasks: false,
					allDay: false
				}
			]
		},
		'test-4': {
			uri: 'test-4',
			displayname: 'Test 4',
			color: '#112245',
			writable: true,
			url: '/nextcloud/remote.php/dav/calendars/raimund.schluessler/test-4',
			tasks: []
		},
		'a-list': {
			uri: 'a-list',
			displayname: 'A list',
			color: '#dd2245',
			writable: true,
			url: '/nextcloud/remote.php/dav/calendars/raimund.schluessler/a-list',
			tasks: [
				{
					calendar: {
						writable: true,
						color: '#dd2245'
					},
					uid: 'ydl92pr8mn',
					uri: 'ydl92pr8mn.ics',
					// construct dates for today past, date only
					due: '',
					start: '',
					summary: 'A list - Task 1',
					complete: 0,
					completed: false,
					priority: 0,
					categories: [],
					note: 'Migrate this app to vue.',
					hideSubtasks: false,
					allDay: false
				}
			]
		}
	}
})

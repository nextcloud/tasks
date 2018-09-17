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
			color: '#eef',
			writable: true,
			url: '/nextcloud/remote.php/dav/calendars/raimund.schluessler/test-1',
			caldav: 'caldav-url',
			tasks: [
				{
					calendar: {
						writable: true
					},
					uid: 'ydf95848mn',
					uri: 'ydf95848mn.ics',
					due: '20180902T200933',
					summary: 'Test 1 - Task 1',
					complete: 1,
					completed: true,
					priority: 1,
					categories: ['Test 1 Category 1', 'Test 1 Category 2'],
					note: 'Migrate this app to vue.'
				},
				{
					calendar: {
						writable: true
					},
					uid: 'ydf95748mn',
					uri: 'ydf95748mn.ics',
					due: '20180901T200926',
					summary: 'Test 1 - Task 2',
					complete: 3,
					completed: false,
					priority: 5,
					categories: [],
					note: 'Migrate this app to vue.'
				},
				{
					calendar: {
						writable: true
					},
					uid: 'ydf95849mn',
					uri: 'ydf95849mn.ics',
					due: '20170903T200916',
					summary: 'Test 1 - Task 3',
					complete: 6,
					completed: false,
					priority: 7,
					categories: [],
					note: 'Migrate this app to vue.',
					related: 'ydf95748mn'
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
						writable: true
					},
					uid: 'ydf91848mn',
					uri: 'ydf91848mn.ics',
					due: '20180929T200912',
					start: '20171003T100912',
					summary: 'Test 2 - Task 1',
					complete: 1,
					completed: true,
					priority: 1,
					categories: [],
					note: 'Migrate this app to vue.'
				},
				{
					calendar: {
						writable: true
					},
					uid: 'yef91848mn',
					uri: 'yef91848mn.ics',
					due: '20181003T200912',
					start: '20171003T200912',
					summary: 'Test 2 - Task 2',
					complete: 3,
					completed: false,
					priority: 5,
					categories: [],
					note: 'Migrate this app to vue.'
				},
				{
					calendar: {
						writable: true
					},
					uid: 'yff91848mn',
					uri: 'yff91848mn.ics',
					due: '',
					start: '',
					summary: 'Test 2 - Task 3',
					complete: 6,
					completed: true,
					priority: 7,
					categories: [],
					note: 'Migrate this app to vue.'
				},
				{
					calendar: {
						writable: true
					},
					uid: 'ydg91848mn',
					uri: 'ydg91848mn.ics',
					due: '20180907T200912',
					summary: 'Test 2 - Task 4',
					complete: 6,
					completed: false,
					priority: 7,
					categories: [],
					note: 'Migrate this app to vue.'
				},
				{
					calendar: {
						writable: true
					},
					uid: 'ydh91848mn',
					uri: 'ydh91848mn.ics',
					summary: 'Test 2 - Task 5',
					complete: 6,
					completed: false,
					priority: 7,
					categories: [],
					note: 'Migrate this app to vue.'
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
						writable: true
					},
					uid: 'ydi92848mn',
					uri: 'ydi92848mn.ics',
					summary: 'Test 3 - Task 1',
					complete: 1,
					completed: false,
					priority: 1,
					categories: [],
					note: 'Migrate this app to vue.'
				},
				{
					calendar: {
						writable: true
					},
					uid: 'ydj91848mn',
					uri: 'ydj91848mn.ics',
					summary: 'Test 3 - Task 2',
					complete: 3,
					completed: true,
					priority: 5,
					categories: [],
					note: 'Migrate this app to vue.'
				},
				{
					calendar: {
						writable: true
					},
					uid: 'ydk91848mn',
					uri: 'ydk91848mn.ics',
					summary: 'Test 3 - Task 3',
					complete: 6,
					completed: false,
					priority: 7,
					categories: [],
					note: 'Migrate this app to vue.'
				},
				{
					calendar: {
						writable: true
					},
					uid: 'ydl91848mn',
					uri: 'ydl91848mn.ics',
					summary: 'Test 3 - Task 4',
					complete: 6,
					completed: false,
					priority: 7,
					categories: [],
					note: 'Migrate this app to vue.'
				}
			]
		}
	}
})

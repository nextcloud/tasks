/**
 * @author Bader Zaidan
 *
 * @copyright 2022 Bader Zaidan <bader@zaidan.pw>
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

import { CalendarComponent, ToDoComponent, RecurrenceManager } from '@nextcloud/calendar-js'

const createStandardToDoComponent = (appVersion) => {
	const todo = new ToDoComponent('VTODO')
	const calendar = new CalendarComponent('VCALENDAR')
	calendar.productId = '-//Nextcloud Tasks v' + appVersion
	todo.recurrenceManager = new RecurrenceManager(todo)
	calendar.addComponent(todo)

	return todo
}

export { createStandardToDoComponent }

/**
 * ownCloud - Calendar App
 *
 * @author Raghu Nayyar
 * @author Georg Ehrke
 * @copyright 2016 Raghu Nayyar <beingminimal@gmail.com>
 * @copyright 2016 Georg Ehrke <oc.list@georgehrke.com>
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

angular.module('Tasks').factory('VTodo', ['$filter', 'ICalFactory', 'RandomStringService', '$timeout', 'VTodoService',
	function($filter, icalfactory, RandomStringService, $timeout, _$vtodoservice) {
	'use strict';

	function VTodo(calendar, props, uri) {
		var _this = this;

		angular.extend(this, {
			calendar: calendar,
			data: props['{urn:ietf:params:xml:ns:caldav}calendar-data'],
			uri: uri,
			etag: props['{DAV:}getetag'] || null,
			timers: []
		});

		this.jCal = ICAL.parse(this.data);
		this.components = new ICAL.Component(this.jCal);

		if (this.components.jCal.length === 0) {
			throw "invalid calendar";
		}
	}

	VTodo.prototype = {
		get calendaruri() {
			return this.calendar.uri;
		},
		get summary() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			return vtodos[0].getFirstPropertyValue('summary');
		},
		set summary(summary) {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			vtodos[0].updatePropertyWithValue('summary', summary);
			this.data = this.components.toString();
			if (this.timers['summary']) {
				$timeout.cancel(this.timers['summary']);
			}
			this.timers['summary'] = $timeout(function(task) {
				_$vtodoservice.update(task);
			}, 3000, true, this);
		},
		get priority() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			var priority = vtodos[0].getFirstPropertyValue('priority');
			return (10 - priority) % 10;
		},
		set priority(priority) {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			vtodos[0].updatePropertyWithValue('priority', (10 - priority) % 10);
			this.data = this.components.toString();
			if (this.timers['priority']) {
				$timeout.cancel(this.timers['priority']);
			}
			this.timers['priority'] = $timeout(function(task) {
				_$vtodoservice.update(task);
			}, 1000, true, this);
		},
		get complete() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			return vtodos[0].getFirstPropertyValue('percent-complete') || 0;
		},
		set complete(complete) {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			vtodos[0].updatePropertyWithValue('percent-complete', complete);
			this.data = this.components.toString();
			if (this.timers['percent-complete']) {
				$timeout.cancel(this.timers['percent-complete']);
			}
			this.timers['percent-complete'] = $timeout(function(task) {
				_$vtodoservice.update(task);
			}, 1000, true, this);
		},
		get completed() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			var comp = vtodos[0].getFirstPropertyValue('completed');
			if (comp) {
				return true;
			} else {
				return false;
			}
		},
		set completed(completed) {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			if (completed) {
				vtodos[0].updatePropertyWithValue('completed', completed);
			} else {
				vtodos[0].removeProperty('completed');
			}
			this.data = this.components.toString();
		},
		get completed_date() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			var comp = vtodos[0].getFirstPropertyValue('completed');
			if (comp) {
				return comp.toJSDate();
			} else {
				return null;
			}
		},
		get status() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			return vtodos[0].getFirstPropertyValue('status');
		},
		set status(status) {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			vtodos[0].updatePropertyWithValue('status', status);
			this.data = this.components.toString();
		},
		get note() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			return vtodos[0].getFirstPropertyValue('description') || '';
		},
		set note(note) {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			vtodos[0].updatePropertyWithValue('description', note);
			this.data = this.components.toString();
			if (this.timers['description']) {
				$timeout.cancel(this.timers['description']);
			}
			this.timers['description'] = $timeout(function(task) {
				_$vtodoservice.update(task);
			}, 3000, true, this);
		},
		get uid() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			return vtodos[0].getFirstPropertyValue('uid') || '';
		},
		get related() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			return vtodos[0].getFirstPropertyValue('related-to') || null;
		},
		get hideSubtasks() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			return +vtodos[0].getFirstPropertyValue('x-oc-hidesubtasks') || 0;
		},
		set hideSubtasks(hide) {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			vtodos[0].updatePropertyWithValue('x-oc-hidesubtasks', +hide);
			this.data = this.components.toString();
		},
		get reminder() {
			return null;
		},
		get categories() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			var categories = vtodos[0].getFirstProperty('categories');
			if (categories) {
				return categories.getValues();
			} else {
				return [];
			}
		},
		set categories(cats) {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			var categories = vtodos[0].getFirstProperty('categories');
			if (cats.length > 0) {
				if (categories) {
					categories.setValues(cats);
				} else {
					var prop = new ICAL.Property('categories');
					prop.setValues(cats);
					categories = vtodos[0].addProperty(prop);
				}
			} else {
				vtodos[0].removeProperty('categories');
			}
			this.data = this.components.toString();
			_$vtodoservice.update(this);
		},
		get start() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			return vtodos[0].getFirstPropertyValue('dtstart');
		},
		set start(start) {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			if (start) {
				vtodos[0].updatePropertyWithValue('dtstart', start);
			} else {
				vtodos[0].removeProperty('dtstart');
			}
			this.data = this.components.toString();
			_$vtodoservice.update(this);
		},
		get due() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			return vtodos[0].getFirstPropertyValue('due');
		},
		set due(due) {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			if (due) {
				vtodos[0].updatePropertyWithValue('due', due);
			} else {
				vtodos[0].removeProperty('due');
			}
			this.data = this.components.toString();
			_$vtodoservice.update(this);
		},
		get comments() {
			return null;
		},
	}

	VTodo.create = function(task) {
		var comp = icalfactory.new();

		var vtodo = new ICAL.Component('vtodo');
		comp.addSubcomponent(vtodo);
		vtodo.updatePropertyWithValue('created', ICAL.Time.now());
		vtodo.updatePropertyWithValue('dtstamp', ICAL.Time.now());
		vtodo.updatePropertyWithValue('last-modified', ICAL.Time.now());
		vtodo.updatePropertyWithValue('uid', RandomStringService.generate());
		vtodo.updatePropertyWithValue('summary', task.summary);
		vtodo.updatePropertyWithValue('priority', task.priority);
		vtodo.updatePropertyWithValue('percent-complete', task.complete);
		vtodo.updatePropertyWithValue('x-oc-hidesubtasks', 0);
		if (task.related) {
			vtodo.updatePropertyWithValue('related-to', task.related);
		}
		if (task.note) {
			vtodo.updatePropertyWithValue('description', task.note);
		}

		return new VTodo(task.calendar, {
			'{urn:ietf:params:xml:ns:caldav}calendar-data': comp.toString(),
			'{DAV:}getetag': null
		}, null);
	};

	return VTodo;
}]);

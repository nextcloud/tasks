/**
 * Nextcloud - Tasks
 *
 * @author Raghu Nayyar
 * @author Georg Ehrke
 * @author Raimund Schlüßler
 * @copyright 2017 Raghu Nayyar <beingminimal@gmail.com>
 * @copyright 2017 Georg Ehrke <oc.list@georgehrke.com>
 * @copyright 2017 Raimund Schlüßler <raimund.schluessler@googlemail.com>
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

angular.module('Tasks').factory('VTodo', ['$filter', 'ICalFactory', 'RandomStringService',
	function($filter, icalfactory, RandomStringService) {
	'use strict';

	function VTodo(calendar, props, uri) {
		var _this = this;

		angular.extend(this, {
			calendar: calendar,
			data: props['{urn:ietf:params:xml:ns:caldav}calendar-data'],
			uri: uri,
			etag: props['{DAV:}getetag'] || null,
			timers: [],
			loaded: false
		});

		this.jCal = ICAL.parse(this.data);
		this.components = new ICAL.Component(this.jCal);

		if (this.components.jCal.length === 0) {
			throw "invalid calendar";
		}
	}

	VTodo.prototype = {
		get summary() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			return vtodos[0].getFirstPropertyValue('summary');
		},
		set summary(summary) {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			vtodos[0].updatePropertyWithValue('summary', summary);
			this.updateLastModified();
			this.data = this.components.toString();
		},
		get priority() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			var priority = vtodos[0].getFirstPropertyValue('priority');
			return (10 - priority) % 10;
		},
		set priority(priority) {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			vtodos[0].updatePropertyWithValue('priority', (10 - priority) % 10);
			this.updateLastModified();
			this.data = this.components.toString();
		},
		get complete() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			return vtodos[0].getFirstPropertyValue('percent-complete') || 0;
		},
		set complete(complete) {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			vtodos[0].updatePropertyWithValue('percent-complete', complete);
			this.updateLastModified();
			this.data = this.components.toString();
			if (complete < 100) {
				this.completed = null;
				if (complete === 0) {
					this.status = 'NEEDS-ACTION';
				} else {
					this.status = 'IN-PROCESS';
				}
			} else {
				this.completed = ICAL.Time.now();
				this.status = 'COMPLETED';
			}
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
			this.updateLastModified();
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
			this.updateLastModified();
			this.data = this.components.toString();
		},
		get note() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			return vtodos[0].getFirstPropertyValue('description') || '';
		},
		set note(note) {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			vtodos[0].updatePropertyWithValue('description', note);
			this.updateLastModified();
			this.data = this.components.toString();
		},
		get uid() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			return vtodos[0].getFirstPropertyValue('uid') || '';
		},
		get related() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			return vtodos[0].getFirstPropertyValue('related-to') || null;
		},
		set related(related) {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			if (related) {
				vtodos[0].updatePropertyWithValue('related-to', related);
			} else {
				vtodos[0].removeProperty('related-to');
			}
			this.updateLastModified();
			this.data = this.components.toString();
		},
		get hideSubtasks() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			return +vtodos[0].getFirstPropertyValue('x-oc-hidesubtasks') || 0;
		},
		set hideSubtasks(hide) {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			vtodos[0].updatePropertyWithValue('x-oc-hidesubtasks', +hide);
			this.updateLastModified();
			this.data = this.components.toString();
		},
		get hideChecklists() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			return +vtodos[0].getFirstPropertyValue('x-oc-hidechecklists') || 0;
		},
		set hideChecklists(hide) {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			vtodos[0].updatePropertyWithValue('x-oc-hidechecklists', +hide);
			this.updateLastModified();
			this.data = this.components.toString();
		},
		get hideCompletedSubtasks() {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			return +vtodos[0].getFirstPropertyValue('x-oc-hidecompletedsubtasks') || 0;
		},
		set hideCompletedSubtasks(hide) {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			vtodos[0].updatePropertyWithValue('x-oc-hidecompletedsubtasks', +hide);
			this.updateLastModified();
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
			this.updateLastModified();
			this.data = this.components.toString();
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
			this.updateLastModified();
			this.data = this.components.toString();
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
			this.updateLastModified();
			this.data = this.components.toString();
		},
 		get allDay() {
 			var vtodos = this.components.getAllSubcomponents('vtodo');
 			var start = vtodos[0].getFirstPropertyValue('dtstart');
 			var due = vtodos[0].getFirstPropertyValue('due');
 			var d = due ? due : start;
 			return d!==null && d.isDate;
 		},
 		set allDay(allDay) {
 			var vtodos = this.components.getAllSubcomponents('vtodo');
 			var start = vtodos[0].getFirstPropertyValue('dtstart');
 			if(start) {
 				start.isDate = allDay;
 				vtodos[0].updatePropertyWithValue('dtstart', start);
 			}
 			var due = vtodos[0].getFirstPropertyValue('due');
 			if(due) {
 				due.isDate = allDay;
 				vtodos[0].updatePropertyWithValue('due', due);
 			}
 			this.updateLastModified();
 			this.data = this.components.toString();
 		},
		get comments() {
			return null;
		},
		get loadedCompleted () {
			return this.loaded;
		},
		set loadedCompleted (loadedCompleted) {
			this.loaded = loadedCompleted;
		},
		updateLastModified () {
			var vtodos = this.components.getAllSubcomponents('vtodo');
			vtodos[0].updatePropertyWithValue('last-modified', ICAL.Time.now());
			vtodos[0].updatePropertyWithValue('dtstamp', ICAL.Time.now());
		}
	};

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
		vtodo.updatePropertyWithValue('x-oc-hidechecklists', 0);
		if (task.related) {
			vtodo.updatePropertyWithValue('related-to', task.related);
		}
		if (task.note) {
			vtodo.updatePropertyWithValue('description', task.note);
		}
		if (task.due) {
			vtodo.updatePropertyWithValue('due', task.due);
		}
		if (task.start) {
			vtodo.updatePropertyWithValue('dtstart', task.start);
		}

		return new VTodo(task.calendar, {
			'{urn:ietf:params:xml:ns:caldav}calendar-data': comp.toString(),
			'{DAV:}getetag': null
		}, null);
	};

	return VTodo;
}]);

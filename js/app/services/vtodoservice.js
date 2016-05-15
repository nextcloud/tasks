/**
 * ownCloud - Tasks
 *
 * @author Raghu Nayyar
 * @author Georg Ehrke
 * @author Raimund Schlüßler
 * @copyright 2016 Raghu Nayyar <beingminimal@gmail.com>
 * @copyright 2016 Georg Ehrke <oc.list@georgehrke.com>
 * @copyright 2016 Raimund Schlüßler <raimund.schluessler@googlemail.com>
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

angular.module('Tasks').service('VTodoService', ['DavClient', 'RandomStringService', '$timeout', function(DavClient, RandomStringService, $timeout) {
	'use strict';

	var _this = this;

	this.getAll = function(calendar, completed, parent) {
		if (completed === null) {
			completed = false;
		}
		if (parent === null) {
			parent = false;
		}
		var xmlDoc = document.implementation.createDocument('', '', null);
		var cCalQuery = xmlDoc.createElement('c:calendar-query');
		cCalQuery.setAttribute('xmlns:c', 'urn:ietf:params:xml:ns:caldav');
		cCalQuery.setAttribute('xmlns:d', 'DAV:');
		cCalQuery.setAttribute('xmlns:a', 'http://apple.com/ns/ical/');
		cCalQuery.setAttribute('xmlns:o', 'http://owncloud.org/ns');
		xmlDoc.appendChild(cCalQuery);

		var dProp = xmlDoc.createElement('d:prop');
		cCalQuery.appendChild(dProp);

		var dGetEtag = xmlDoc.createElement('d:getetag');
		dProp.appendChild(dGetEtag);

		var cCalendarData = xmlDoc.createElement('c:calendar-data');
		dProp.appendChild(cCalendarData);

		var cFilter = xmlDoc.createElement('c:filter');
		cCalQuery.appendChild(cFilter);

		var cCompFilterVCal = xmlDoc.createElement('c:comp-filter');
		cCompFilterVCal.setAttribute('name', 'VCALENDAR');
		cFilter.appendChild(cCompFilterVCal);

		var cCompFilterVTodo = xmlDoc.createElement('c:comp-filter');
		cCompFilterVTodo.setAttribute('name', 'VTODO');
		cCompFilterVCal.appendChild(cCompFilterVTodo);

		var cPropFilterCompleted = xmlDoc.createElement('c:prop-filter');
		cPropFilterCompleted.setAttribute('name', 'COMPLETED');
		cCompFilterVTodo.appendChild(cPropFilterCompleted);

		if (!completed) {
			var cIsNotDefined = xmlDoc.createElement('c:is-not-defined');
			cPropFilterCompleted.appendChild(cIsNotDefined);
		}

		if (parent) {
			console.log('parent');
			var cPropFilterRelated = xmlDoc.createElement('c:prop-filter');
			cPropFilterRelated.setAttribute('name', 'RELATED-TO');
			cCompFilterVTodo.appendChild(cPropFilterRelated);
			var cTextMatch = xmlDoc.createElement('c:text-match');
			// cTextMatch.setAttribute('negate-condition', 'yes');
			var cTextMatchValue = xmlDoc.createTextNode(parent.uid);
			cTextMatch.appendChild(cTextMatchValue);
			cPropFilterRelated.appendChild(cTextMatch);
		}

		// var cPropFilterStatus = xmlDoc.createElement('c:prop-filter');
		// cPropFilterStatus.setAttribute('name', 'STATUS');
		// cCompFilterVTodo.appendChild(cPropFilterStatus);

		// var cTextMatch = xmlDoc.createElement('c:text-match');
		// cTextMatch.setAttribute('negate-condition', 'yes');
		// var cTextMatchValue = xmlDoc.createTextNode('CANCELLED');
		// cTextMatch.appendChild(cTextMatchValue);
		// cPropFilterStatus.appendChild(cTextMatch);

		// var cTimeRange = xmlDoc.createElement('c:time-range');
		// cTimeRange.setAttribute('start', this._getTimeRangeStamp(start));
		// cTimeRange.setAttribute('end', this._getTimeRangeStamp(end));
		// cCompFilterVTodo.appendChild(cTimeRange);

		var url = calendar.url;
		var headers = {
			'Content-Type': 'application/xml; charset=utf-8',
			'Depth': 1,
			'requesttoken': OC.requestToken
		};
		var body = cCalQuery.outerHTML;

		return DavClient.request('REPORT', url, headers, body).then(function(response) {
			if (!DavClient.wasRequestSuccessful(response.status)) {
				//TODO - something went wrong
				return;
			}

			var vTodos = [];

			for (var i in response.body) {
				var object = response.body[i];
				var properties = object.propStat[0].properties;

				var uri = object.href.substr(object.href.lastIndexOf('/') + 1);

				var vTodo = {
					calendar: calendar,
					properties: properties,
					uri: uri
				};
				vTodos.push(vTodo);
			}

			return vTodos;
		});
	};

	this.get = function(calendar, uri) {
		var url = calendar.url + uri;
		return DavClient.request('GET', url, {'requesttoken' : OC.requestToken}, '').then(function(response) {
			var vTodo = {
				calendar: calendar,
				properties: {
					'{urn:ietf:params:xml:ns:caldav}calendar-data': response.body,
					'{DAV:}getetag': response.xhr.getResponseHeader('ETag')},
				uri: uri
			};
			return vTodo;
		});
	};

	this.create = function(calendar, data, returnTodo) {
		if (typeof returnTodo === 'undefined') {
			returnTodo = true;
		}

		var headers = {
			'Content-Type': 'text/calendar; charset=utf-8',
			'requesttoken': OC.requestToken
		};
		var uri = this._generateRandomUri();
		var url = calendar.url + uri;

		return DavClient.request('PUT', url, headers, data).then(function(response) {
			if (!DavClient.wasRequestSuccessful(response.status)) {
				console.log(response);
				return false;
				// TODO - something went wrong, do smth about it
			}

			return returnTodo ?
				_this.get(calendar, uri) :
				true;
		});
	};

	this.update = function(task) {
		var url = task.calendar.url + task.uri;
		var headers = {
			'Content-Type': 'text/calendar; charset=utf-8',
			'If-Match': task.etag,
			'requesttoken': OC.requestToken
		};
		$timeout.cancel(task.timers.update);
		return DavClient.request('PUT', url, headers, task.data).then(function(response) {
			task.etag = response.xhr.getResponseHeader('ETag');
			return DavClient.wasRequestSuccessful(response.status);
		});
	};

	this.delete = function(task) {
		var url = task.calendar.url + task.uri;
		var headers = {
			'If-Match': task.etag,
			'requesttoken': OC.requestToken
		};

		return DavClient.request('DELETE', url, headers, '').then(function(response) {
			return DavClient.wasRequestSuccessful(response.status);
		});
	};

	this._generateRandomUri = function() {
		var uri = 'ownCloud-';
		uri += RandomStringService.generate();
		uri += RandomStringService.generate();
		uri += '.ics';

		return uri;
	};

	// this._getTimeRangeStamp = function(momentObject) {
	// 	return momentObject.format('YYYYMMDD') + 'T' + momentObject.format('HHmmss') + 'Z';
	// };

}]);

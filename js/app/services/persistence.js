/**
 * Nextcloud - Tasks
 *
 * @author Raimund Schlüßler
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

angular.module('Tasks').factory('Persistence', [
	'Request', 'Loading', '$rootScope', '$q', 'CalendarService', function(Request, Loading, $rootScope, $q, CalendarService) {
		'use strict';
		var Persistence = (function() {
			function Persistence(_request, _Loading, _$rootScope, _CalendarService) {
				this._request = _request;
				this._Loading = _Loading;
				this._$rootScope = _$rootScope;
				this._CalendarService = _CalendarService;
			}

			Persistence.prototype.init = function() {
				var successCallback,
				_this = this;
				this.deferred = $q.defer();
				successCallback = function() {
					return _this.deferred.resolve();
				};
				this.getCollections();
				this.getSettings();
				return this.deferred.promise;
			};

			Persistence.prototype.getCollections = function(onSuccess, showLoading) {
				var failureCallbackWrapper, params, successCallbackWrapper,
				_this = this;
				if (showLoading === null) {
					showLoading = true;
				}
				if (!onSuccess) {
					onSuccess = function() {};
				}
				if (showLoading) {
					this._Loading.increase();
					successCallbackWrapper = function(data) {
						onSuccess();
						return _this._Loading.decrease();
					};
					failureCallbackWrapper = function(data) {
						return _this._Loading.decrease();
					};
				} else {
					successCallbackWrapper = function(data) {
						return onSuccess();
					};
					failureCallbackWrapper = function(data) {};
				}
				params = {
					onSuccess: successCallbackWrapper,
					onFailure: failureCallbackWrapper
				};
				return this._request.get('/apps/tasks/collections', params);
			};

			Persistence.prototype.getSettings = function(onSuccess, showLoading) {
				var failureCallbackWrapper, params, successCallbackWrapper,
				_this = this;
				if (showLoading === null) {
					showLoading = true;
				}
				if (!onSuccess) {
					onSuccess = function() {};
				}
				if (showLoading) {
					this._Loading.increase();
					successCallbackWrapper = function(data) {
						onSuccess();
						return _this._Loading.decrease();
					};
					failureCallbackWrapper = function(data) {
						return _this._Loading.decrease();
					};
				} else {
					successCallbackWrapper = function(data) {
						return onSuccess();
					};
					failureCallbackWrapper = function(data) {};
				}
				params = {
					onSuccess: successCallbackWrapper,
					onFailure: failureCallbackWrapper
				};
				return this._request.get('/apps/tasks/settings', params);
			};

			Persistence.prototype.setVisibility = function(collectionID, visibility) {
				var params = {
					routeParams: {
						collectionID: collectionID,
						visibility: visibility
					}
				};
				return this._request.post('/apps/tasks/collection/{collectionID}/visibility/{visibility}', params);
			};

			Persistence.prototype.setting = function(type, setting, value) {
				var params = {
					routeParams: {
						type: type,
						setting: setting,
						value: value
					}
				};
				return this._request.post('/apps/tasks/settings/{type}/{setting}/{value}', params);
			};
		return Persistence;
	  })();
	  return new Persistence(Request, Loading, $rootScope, CalendarService);
	}
]);

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

angular.module('Tasks').factory('Request', [
	'$http', 'Publisher', function($http, Publisher) {
		'use strict';
		var Request = (function() {
			function Request($http, publisher) {
				this.$http = $http;
				this.publisher = publisher;
				this.count = 0;
				this.initialized = false;
				this.shelvedRequests = [];
				this.initialized = true;
				this._executeShelvedRequests();
			}

			Request.prototype.request = function(route, data) {
				var defaultConfig, defaultData, url;
				if (data === null) {
					data = {};
				}
				defaultData = {
					routeParams: {},
					data: {},
					onSuccess: function() {
						return {};
					},
					onFailure: function() {
						return {};
					},
					config: {}
				};
				angular.extend(defaultData, data);
				if (!this.initialized) {
					this._shelveRequest(route, defaultData);
					return;
				}
				url = OC.generateUrl(route, defaultData.routeParams);
				defaultConfig = {
					url: url,
					data: defaultData.data
				};
				angular.extend(defaultConfig, defaultData.config);
				if (defaultConfig.method === 'GET') {
					defaultConfig.params = defaultConfig.data;
				}
				return this.$http(defaultConfig).then((function(_this) {
					return function(response) {
						var name, ref, value;
						ref = response.data.data;
						for (name in ref) {
							value = ref[name];
							_this.publisher.publishDataTo(value, name);
						}
						return defaultData.onSuccess(response.data, response.status, response.headers, response.config);
					};
				})(this)).catch(function(response) {
					return defaultData.onFailure(response.data, response.status, response.headers, response.config);
				});
			};

			Request.prototype.post = function(route, data) {
				if (data === null) {
					data = {};
				}
				if (!data.config) {
					data.config = {};
				}
				data.config.method = 'POST';
				return this.request(route, data);
			};

			Request.prototype.get = function(route, data) {
				if (data === null) {
					data = {};
				}
				if (!data.config) {
					data.config = {};
				}
				data.config.method = 'GET';
				return this.request(route, data);
			};

			Request.prototype.put = function(route, data) {
				if (data === null) {
					data = {};
				}
				if (!data.config) {
					data.config = {};
				}
				data.config.method = 'PUT';
				return this.request(route, data);
			};

			Request.prototype["delete"] = function(route, data) {
				if (data === null) {
					data = {};
				}
				if (!data.config) {
					data.config = {};
				}
				data.config.method = 'DELETE';
				return this.request(route, data);
			};

			Request.prototype._shelveRequest = function(route, data) {
				var request = {
					route: route,
					data: data
				};
				return this.shelvedRequests.push(request);
			};

			Request.prototype._executeShelvedRequests = function() {
				var r, ref, results, _i, _len;
				ref = this.shelvedRequests;
				results = [];
				for (_i = 0, _len = ref.length; _i < _len; _i++) {
					r = ref[_i];
					results.push(this.request(r.route, r.data));
				}
				return results;
			};
			return Request;
		})();
	return new Request($http, Publisher);
	}
]);

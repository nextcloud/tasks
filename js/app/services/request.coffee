###

ownCloud - Tasks

@author Raimund Schlüßler
@copyright 2015

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
License as published by the Free Software Foundation; either
version 3 of the License, or any later version.

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU AFFERO GENERAL PUBLIC LICENSE for more details.

You should have received a copy of the GNU Affero General Public
License along with this library.  If not, see <http://www.gnu.org/licenses/>.

###
angular.module('Tasks').factory 'Request',
[ '$http', 'Publisher', ($http, Publisher) ->

	class Request

		constructor: (@$http, @publisher) ->
			@count = 0
			@initialized = false
			@shelvedRequests = []
			@initialized = true
			@_executeShelvedRequests()

		request: (route, data) ->
			if data == null
				data = {}

			# Wrapper to do a normal request to the server. This needs to
			# be done to hook the publisher into the requests and to handle
			# requests, that come in before routes have been loaded

			# route: the routename data can contain the following
			# data.routeParams: object with parameters for the route
			# data.data: ajax data objec which is passed to PHP
			# data.onSuccess: callback for successful requests
			# data.onFailure: callback for failed requests
			# data.config: a config which should be passed to $http
			defaultData = {
			  routeParams: {},
			  data: {},
			  onSuccess: () -> {},
			  onFailure: () -> {},
			  config: {}
			}
			angular.extend(defaultData, data)
			if !@initialized
				@_shelveRequest(route, defaultData)
				return

			url = OC.generateUrl(route, defaultData.routeParams)
			defaultConfig = {
				url: url,
				data: defaultData.data
			}
			angular.extend(defaultConfig, defaultData.config)
			if defaultConfig.method == 'GET'
				defaultConfig.params = defaultConfig.data
			
			return @$http(defaultConfig)
			.success(
				do (_this = @) ->
					return (data, status, headers, config) ->
						ref = data.data
						for name of ref
							value = ref[name]
							_this.publisher.publishDataTo(value, name)
						return defaultData.onSuccess(data, status, headers, config)
			)
			.error(
				(data, status, headers, config) ->
					return defaultData.onFailure(data, status, headers, config)
			)

		post: (route, data) ->
			if data == null
				data = {}
			data.config || (data.config = {})
			data.config.method = 'POST'
			return @request(route, data)

		get: (route, data) ->
			if data == null
				data = {}
			data.config || (data.config = {})
			data.config.method = 'GET'
			return @request(route, data)

		put: (route, data) ->
			if data == null
				data = {}
			data.config || (data.config = {})
			data.config.method = 'PUT'
			return @request(route, data)

		delete: (route, data) ->
			if data == null
				data = {}
			data.config || (data.config = {})
			data.config.method = 'DELETE'
			return @request(route, data)

		_shelveRequest: (route, data) ->
			request = {
				route: route,
				data: data
			}
			return @shelvedRequests.push(request)

		_executeShelvedRequests: () ->
			ref = @shelvedRequests
			results = []
			for r in ref
				results.push(@request(r.route, r.data))
			return results

	return new Request($http, Publisher)

]

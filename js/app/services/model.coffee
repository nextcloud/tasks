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
angular.module('Tasks').factory '_Model',
[() ->

	class Model

		constructor: () ->
			@_data = []
			@_dataMap = {}
			@_filterCache = {}

		handle: (data) ->
			_results = []
			for item in data
				_results.push(@add(item))
			return _results

		add: (data, clearCache=true) ->
			if (clearCache)
				@_invalidateCache()

			if (angular.isDefined(@_dataMap[data.id]))
				return @update(data, clearCache)
			else
				@_data.push(data)
				return @_dataMap[data.id] = data

		update: (data, clearCache=true) ->
			if clearCache
				@_invalidateCache()

			entry = @getById(data.id)
			_results = []
			for key of data
				value = data[key]
				if (key == 'id')
					continue
				else
					_results.push(entry[key] = value)
			return _results

		getById: (id) ->
			return @_dataMap[id]

		getAll: () ->
			return @_data

		removeById: (id, clearCache=true) ->
			for entry, counter in @_data
				if entry.id == id
					@_data.splice(counter, 1)
					data = @_dataMap[id]
					delete @_dataMap[id]
					if clearCache
						@_invalidateCache()
					return data

		clear: () ->
			@_data.length = 0
			@_dataMap = {}
			return @_invalidateCache()

		_invalidateCache: () ->
			return @_filterCache = {}

		get: (query) ->
			hash = query.hashCode()
			if (!angular.isDefined(@_filterCache[hash]))
				@_filterCache[hash] = query.exec(@_data)
			return @_filterCache[hash]

		size: () ->
			return @_data.length

	return Model

]

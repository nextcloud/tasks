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
angular.module('Tasks').factory 'Publisher',
['ListsModel', 'TasksModel', 'CollectionsModel', 'SettingsModel',
(ListsModel, TasksModel, CollectionsModel, SettingsModel) ->

	class Publisher

		constructor: (@_$listsmodel,@_$tasksmodel,@_$collectionsmodel,
			@_$settingsmodel) ->
			@_subscriptions = {}
			@subscribeObjectTo(@_$collectionsmodel, 'collections')
			@subscribeObjectTo(@_$settingsmodel, 'settings')
			@subscribeObjectTo(@_$listsmodel, 'lists')
			@subscribeObjectTo(@_$tasksmodel, 'tasks')

		subscribeObjectTo: (object, name) ->
			(base = @_subscriptions)[name] || (base[name] = [])
			return @_subscriptions[name].push(object)

		publishDataTo: (data, name) ->
			ref = @_subscriptions[name] || []
			results = []
			for subscriber in ref
				results.push(subscriber.handle(data))
			return results

	return new Publisher(ListsModel, TasksModel,
		CollectionsModel, SettingsModel)

]

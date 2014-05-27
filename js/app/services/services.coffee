###

ownCloud - Tasks

@author Raimund Schlüßler
@copyright 2013

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


# request related stuff
angular.module('Tasks').factory 'Request',
['_Request', '$http', 'Publisher', 'Router',
(_Request, $http, Publisher, Router) ->
	return new _Request($http, Publisher, Router)
]

angular.module('Tasks').factory 'Loading', ['_Loading', (_Loading) ->
	return new _Loading()
]

# angular.module('Tasks').factory 'ModelsLoading', ['_Loading', (_Loading) ->
# 	return new _Loading()
# ]

angular.module('Tasks').factory 'Publisher',
['_Publisher', 'ListsModel', 'TasksModel', 'CollectionsModel', 'SettingsModel',
(_Publisher, ListsModel, TasksModel, CollectionsModel, SettingsModel) ->

	# register items at publisher to automatically add incoming items
	publisher = new _Publisher()
	publisher.subscribeObjectTo(CollectionsModel, 'collections')
	publisher.subscribeObjectTo(SettingsModel, 'settings')
	publisher.subscribeObjectTo(ListsModel, 'lists')
	publisher.subscribeObjectTo(TasksModel, 'tasks')

	return publisher
]


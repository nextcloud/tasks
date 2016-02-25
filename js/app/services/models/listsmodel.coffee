###

ownCloud - Tasks

@author Raimund Schlüßler
@copyright 2016

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

angular.module('Tasks').factory 'ListsModel',
['TasksModel', '_Model',
(TasksModel, _Model) ->
	class ListsModel extends _Model

		constructor: (@_$tasksmodel) ->
			@_tmpIdCache = {}
			super()

		insert: (cal) ->
			calendar =
				id: @size()
				url: cal.url
				enabled: cal.props['{http://owncloud.org/ns}calendar-enabled']=='1'
				displayname: cal.props['{DAV:}displayname'] || 'Unnamed'
				color: cal.props['{http://apple.com/ns/ical/}calendar-color'] || '#1d2d44'
				order: parseInt(
					cal.props['{http://apple.com/ns/ical/}calendar-order'])	|| 0
				components:
					vevent: false
					vjournal: false
					vtodo: false
				writable: cal.props.canWrite
				shareable: cal.props.canWrite
				sharedWith:
					users: []
					groups: []
				owner: ''

			components = cal.props['{urn:ietf:params:xml:ns:caldav}'+
			'supported-calendar-component-set']
			for component in components
				name = component.attributes.getNamedItem('name').textContent.toLowerCase()
				if (calendar.components.hasOwnProperty(name))
					calendar.components[name] = true


			shares = cal.props['{http://owncloud.org/ns}invite']
			if (typeof shares != 'undefined')
				for share in shares
					href = share.getElementsByTagNameNS('DAV:', 'href')
					if (href.length == 0)
						continue
					href = href[0].textContent

					access = share.getElementsByTagNameNS('http://owncloud.org/ns', 'access')
					if (access.length == 0)
						continue
					access = access[0]

					readWrite = access
						.getElementsByTagNameNS('http://owncloud.org/ns', 'read-write')
					readWrite = readWrite.length != 0

					if (href.startsWith('principal:principals/users/'))
						this.sharedWith.users.push(
							id: href.substr(27)
							displayname: href.substr(27)
							writable: readWrite
						)
					else if (href.startsWith('principal:principals/groups/'))
						this.sharedWith.groups.push(
							id: href.substr(28)
							displayname: href.substr(28)
							writable: readWrite
						)

			owner = cal.props['{DAV:}owner']
			if (typeof owner != 'undefined' && owner.length != 0)
				owner = owner[0].textContent.slice(0, -1)
				if (owner.startsWith('/remote.php/dav/principals/users/'))
					this.owner = owner.substr(33)

			@add(calendar)
			return calendar

		add: (list, clearCache=true) ->

			tmplist = @_tmpIdCache[list.tmpID]

			updateById = angular.isDefined(list.id) and
			angular.isDefined(@getById(list.id))

			updateByTmpId = angular.isDefined(tmplist) and
			angular.isUndefined(tmplist.id)

			if updateById or updateByTmpId
				@update(list, clearCache)
			else
				if angular.isDefined(list.id)
					super(list, clearCache)
				else
					@_tmpIdCache[list.tmpID] = list
					@_data.push(list)
					if clearCache
						@_invalidateCache()

		update: (list, clearCache=true) ->
			tmplist = @_tmpIdCache[list.tmpID]

			if angular.isDefined(list.id) and
			angular.isDefined(tmplist) and
			angular.isUndefined(tmplist.id)
				tmplist.id = list.id
				@_dataMap[list.id] = tmplist
			
			list.void = false
			super(list, clearCache)

		removeById: (listID) ->
			super(listID)

		voidAll: () ->
			lists = @getAll()
			for list in lists
				list.void = true

		removeVoid: () ->
			lists = @getAll()
			listIDs = []
			for list in lists
				if list.void
					listIDs.push list.id
			for id in listIDs
				@removeById(id)

		getStandardList: () ->
			if @size()
				lists = @getAll()
				return lists[0].id

		checkName: (listName, listID=undefined) ->
			lists = @getAll()
			ret = true
			for list in lists
				if list.displayname == listName &&
				listID != list.id
					ret = false
			return ret

		getCount: (listID,collectionID,filter='') ->
			count = 0
			tasks = @_$tasksmodel.filteredTasks(filter)
			for task in tasks
				count += (@_$tasksmodel.filterTasks(task, collectionID) &&
					task.calendarid == listID &&
					!task.related)
			if (collectionID == 'completed' && filter == '')
				count += @notLoaded(listID)
			return count

		notLoaded: (listID) ->
			if angular.isUndefined(@getById(listID))
				return 0
			else
				return @getById(listID).notLoaded

		loadedAll: (listID) ->
			return !@notLoaded(listID)

		getColor: (listID) ->
			if angular.isUndefined(@getById(listID))
				return '#CCCCCC'
			else
				return @getById(listID).calendarcolor

		getName: (listID) ->
			if angular.isUndefined(@getById(listID))
				return ''
			else
				return @getById(listID).displayname

	return new ListsModel(TasksModel)
]

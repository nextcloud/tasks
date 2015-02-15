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


angular.module('Tasks').factory 'SettingsBusinessLayer',
['Persistence', 'SettingsModel',
(Persistence, SettingsModel) ->

	class SettingsBusinessLayer

		constructor: (@_persistence, @_$settingsmodel) ->

		updateModel: () ->
			success = () =>
				
			@_persistence.getCollections(success, true)

		setVisibility: (collectionID, visibility) ->
			@_persistence.setVisibility(collectionID, visibility)

		toggle: (type, setting) ->
			@_$settingsmodel.toggle(type, setting)
			value = @_$settingsmodel.getById(type)[setting]
			@_persistence.setting(type, setting, value)

		set: (type, setting, value) ->
			@_persistence.setting(type, setting, value)

	return new SettingsBusinessLayer(Persistence, SettingsModel)

]
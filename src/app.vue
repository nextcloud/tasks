<!--
Nextcloud - Tasks

@author Raimund Schlüßler
@copyright 2018 Raimund Schlüßler <raimund.schluessler@mailbox.org>

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

-->

<template>
	<div id="content" class="app-tasks">
		<div id="app-navigation">
			<theList />
			<theSettings />
		</div>

		<div id="app-content">
			<div class="content-wrapper">
				<router-view />
			</div>
		</div>

		<div id="app-sidebar" :class="{disappear: $route.params.taskId === undefined}">
			<theDetails />
		</div>
	</div>
</template>

<script>
import TheList from './components/TheList'
import TheSettings from './components/TheSettings'
import TheDetails from './components/TheDetails'

export default {
	name: 'App',
	components: {
		'theSettings': TheSettings,
		'theList': TheList,
		'theDetails': TheDetails
	}
}
</script>

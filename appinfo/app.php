<?php

/**
* ownCloud - Tasks
*
* @author Raimund Schlüßler
* @copyright 2013 Raimund Schlüßler raimund.schluessler@googlemail.com
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
namespace OCA\Tasks\AppInfo;

if(\OCP\App::isEnabled('calendar')) {
	\OCP\App::addNavigationEntry(array(
		// the string under which your app will be referenced in owncloud
		'id' => 'tasks',

		'order' => 100,

		'href' => \OCP\Util::linkToRoute('tasks.page.index'),

		'icon' => \OCP\Util::imagePath('tasks', 'tasks.svg'),

		'name' => \OC_L10N::get('tasks')->t('Tasks')
	));
} else {
	$msg = 'Can not enable the Tasks app because the Calendar App is disabled.';
	\OCP\Util::writeLog('tasks', $msg, \OCP\Util::ERROR);
}
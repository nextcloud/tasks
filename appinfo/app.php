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
namespace OCA\Tasks_enhanced;

use \OC\AppFramework\Core\API;

// dont break owncloud when the appframework is not enabled
if(\OCP\App::isEnabled('calendar')){

	// $api = new API('tasks_enhanced');

//   $api->addNavigationEntry(array(

//     // the string under which your app will be referenced in owncloud
//     'id' => $api->getAppName(),

//     // sorting weight for the navigation. The higher the number, the higher
//     // will it be listed in the navigation
//     'order' => 100,

//     // the route that will be shown on startup
//     'href' => $api->linkToRoute('tasks_enhanced_index'),

//     // the icon that will be shown in the navigation
//     // this file needs to exist in img/example.png
//     'icon' => $api->imagePath('tasks.svg'),
  
// //	  'icon' => $api->imagePath('core', 'places/music.svg'),

//     // the title of your application. This will be used in the
//     // navigation or on the settings page of your app
//     'name' => $api->getTrans()->t('Tasks')

//   ));
  \OC::$server->getNavigationManager()->add(array(
    'id' => 'tasks_enhanced',
    'order' => 100,
    'href' => \OCP\Util::linkToRoute('tasks_enhanced_index'),
    'icon' => \OCP\Util::imagePath( 'tasks_enhanced', 'tasks.svg' ),
    'name' => \OCP\Util::getL10N('tasks_enhanced')->t('Tasks')
    )
  );

} else {
  $msg = 'Can not enable the Tasks app because the Calendar App is disabled.';
  \OCP\Util::writeLog('tasks_enhanced', $msg, \OCP\Util::ERROR);
}
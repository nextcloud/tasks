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

namespace OCA\Tasks_enhanced\DependencyInjection;

use \OCA\AppFramework\DependencyInjection\DIContainer as BaseContainer;

use \OCA\Tasks_enhanced\Controller\PageController;
use \OCA\Tasks_enhanced\Controller\ListsController;
use \OCA\Tasks_enhanced\Controller\TasksController;

use \OCA\Tasks_enhanced\BusinessLayer\ListsBusinessLayer;
use \OCA\Tasks_enhanced\BusinessLayer\TasksBusinessLayer;

use \OCA\Tasks_enhanced\Db\ListsMapper;
use \OCA\Tasks_enhanced\Db\TasksMapper;

use \OCA\Tasks_enhanced\Core\API;

class DIContainer extends BaseContainer {

    public function __construct(){
        parent::__construct('tasks_enhanced');

        $this['API'] = $this->share(function($c){
            return new API($c['AppName']);
        });

        // use this to specify the template directory
        $this['TwigTemplateDirectory'] = __DIR__ . '/../templates';
		

        $this['PageController'] = $this->share(function($c){
            return new PageController($c['API'], $c['Request']);
        });

        $this['ListsController'] = $this->share(function($c){
            return new ListsController($c['API'], $c['Request'],
                $c['ListsBusinessLayer']);
        });

        $this['TasksController'] = $this->share(function($c){
            return new TasksController($c['API'], $c['Request'],
                $c['TasksBusinessLayer']);
        });

        $this['ListsBusinessLayer'] = $this->share(function($c){
            return new ListsBusinessLayer(
                $c['ListsMapper'],
                $c['API']);
        });

        $this['TasksBusinessLayer'] = $this->share(function($c){
            return new TasksBusinessLayer(
                $c['TasksMapper'],
                $c['API']);
        });

        $this['ListsMapper'] = $this->share(function($c){
            return new ListsMapper($c['API']);
        });

        $this['TasksMapper'] = $this->share(function($c){
            return new TasksMapper($c['API']);
        });

    }

}
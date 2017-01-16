# Tasks

[![Build Status](https://scrutinizer-ci.com/g/nextcloud/tasks/badges/build.png?b=master)](https://scrutinizer-ci.com/g/nextcloud/tasks/build-status/master) [![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/nextcloud/tasks/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/nextcloud/tasks/?branch=master) [![Code Coverage](https://scrutinizer-ci.com/g/nextcloud/tasks/badges/coverage.png?b=master)](https://scrutinizer-ci.com/g/nextcloud/tasks/?branch=master)

**A tasks app for [Nextcloud](http://nextcloud.com). Easily sync tasks from various devices with your Nextcloud and edit them online.**

![tasks](https://raw.githubusercontent.com/nextcloud/tasks/master/screenshots/tasks-1.png)

## Features

* add and delete tasks, edit their title, description, start and due dates, set their priority and status
* support for subtasks
* smart collections showing you your important, current and upcoming tasks
* simply drag and drop tasks to other calendars or make them subtasks

## Installation

In your Nextcloud, simply navigate to »Apps«, choose the category »Organization«, find the Tasks app and enable it.
Then open the Tasks app from the app menu.

## Maintainers

[Raimund Schlüßler](https://github.com/raimund-schluessler) [and many more](https://github.com/nextcloud/tasks/graphs/contributors)

If you’d like to join, just go through the [issue list](https://github.com/nextcloud/tasks/issues?q=is%3Aopen+is%3Aissue+label%3A%22starter+issue%22) and fix some. :)

## Developer setup info

Just clone this repo into your apps directory (Nextcloud server installation needed). Additionally,  [nodejs and npm](https://nodejs.org/en/download/package-manager/) are needed for installing JavaScript dependencies.

Once node and npm are installed, PHP and JavaScript dependencies can be installed by running
```bash
$ make
```
Please execute this command with your ordinary user account and neither root nor sudo.

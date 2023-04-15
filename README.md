# Tasks
![Downloads](https://img.shields.io/github/downloads/nextcloud/tasks/total.svg) [![Build Status](https://scrutinizer-ci.com/g/nextcloud/tasks/badges/build.png?b=master)](https://scrutinizer-ci.com/g/nextcloud/tasks/build-status/master) [![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/nextcloud/tasks/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/nextcloud/tasks/?branch=master) [![Code coverage](https://img.shields.io/codecov/c/github/nextcloud/tasks.svg)](https://codecov.io/gh/nextcloud/tasks/) [![Dependabot status](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg?longCache=true&logo=dependabot)](https://dependabot.com)

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

## Apps which sync with Nextcloud Tasks (using CalDAV)

* Apple Reminders (iOS, MacOS)
* [2Do](https://www.2doapp.com/) (Android, iOS, MacOS)
* [Davx5](https://www.davx5.com/) (Android)
* [OpenTasks](https://opentasks.app/) [(Android)](https://play.google.com/store/apps/details?id=org.dmfs.tasks)
* [Outlook Caldav Synchronizer](https://caldavsynchronizer.org/)  (Windows)
* [Tasks: Astrid Todo List Clone](https://tasks.org/)  [(Android)](https://play.google.com/store/apps/details?id=org.tasks&pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1) (Requires subscription if not downloaded via F-Droid)
* [Qownnotes](https://www.qownnotes.org/) (Read-only, Cross Platform Desktop App)
* [Thunderbird Lightning](https://www.thunderbird.net/en-US/calendar/) (Cross Platform Desktop App)
* [Vdirsyncer](https://vdirsyncer.pimutils.org/en/stable/) (Linux)
* [BusyCal](https://www.busymac.com/busycal) (MacOS)
* [aCalendar+](https://acalendar.tapirapps.de/de/support/home) (via Davx5) [(Android)](https://play.google.com/store/apps/details?id=org.withouthat.acalendarplus)
* [GNOME Todo](https://wiki.gnome.org/Apps/Todo) (via [GNOME Online Accounts](https://wiki.gnome.org/Design/SystemSettings/OnlineAccounts)) (Linux)
* [Kalendar](https://apps.kde.org/kalendar/) (Linux)
* [vdirsyncer](https://vdirsyncer.pimutils.org/en/stable/) (Linux and BSD)


## ETag (or: problem with non-existing conflicts)

This app uses `ETag` HTTP header to work properly (mostly for detecting conflicts). If `ETag`s are modified or removed, the app will report non-existing conflicts.

Some anti-tracking client side extensions are known to remove/replace `ETag` header to avoid tracking via cache (e.g., [CleanURLs is known to create problems](https://github.com/nextcloud/tasks/issues/2077)). You'll need to add an exception for NC Tasks.

Also, `ETag` may be modified by a server-side configuration. If you manage your server you'll need to change its configuration (see https://github.com/nextcloud/tasks/issues/167).

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

## 0.9.5 - 2017-03-02
### Fixed
- Show category delete icon again #31
- Update readme #36, #61
- Adjust app-navigation-entry menu for NC 11.0.2+ #52, #53, #54
- Improve app-sidebar to better work with other apps #59


## 0.9.4 - 2016-12-14
### Added
- Compatible with Nextcloud 11
- Allow all-day tasks @korelstar
- Open detail view after a new task is created @korelstar
- Add a confirmation dialog before deleting a calendar
- Allow to hide completed subtasks

### Fixed
- Fix ordering of tasks @korelstar
- Fix creation of important, due and current tasks

## 0.9.3 - 2016-08-11
### Added
- Enable changing color of calendars
- Show CalDAV-Url
- Download calendars as ics files
- Style improvements

### Fixed
- Fix favicon
- Update last-modified and dtstamp property on task edit

## 0.9.2 - 2016-07-26
### Added
- add a valid certificate for app signing

### Fixed
- fix calendar color with alpha value
- fix loading of completed tasks
- small style fixes

## 0.9.1 - 2016-05-25
### Fixed
- don't break global owncloud search
- small style improvements

## 0.9 - 2016-05-18
### Added
- Nearly complete rewrite for oC9 support
- Tasks is now a CalDAV client and uses the CalDAV server built into oC core
- It is a Standalone app now!
- Reminder, Comments and Search is not yet implemented, this will come with the next releases
- parse links in title, notes and comments
- temporally show subtasks when parent task is opened

## 0.8.1 - 2015-11-21
### Added
- increase compatible version for oC8.2

## 0.8 - 2015-09-10
### Added
- implement support for subtasks (click on the plus icon to add a subtask or drag and drop a task)
- reworked drag and drop support (change lists and make tasks a subtask)
- faster app loading
- custom favicon
- improved backend code

### Fixed
- several style improvements and fixes
- fixed search

## 0.7.1 - 2015-07-10
### Fixed
- fix update script

## 0.7 - 2015-07-09
### Added
- requires oC8.1
- supports categories
- supports finer priorities
- adapts to owncloud look

### Fixed
- fixes problems with escaping of commata and semicolons

## 0.6 - 2015-04-07
### Added
- works with oC8
- implement global oc search box

### Fixed
- fix problems with other task clients ("Mirakel" and "eM Client")
- fix problems with reminder
- fix problems with comments in the TaskSync Android App

## 0.5 - 2014-11-10
### Added
- rename the app to "tasks"
- only load last five completed tasks per list (load remaining ones by user request)
- URLs and emails in notes are parsed as clickable links
- show list name in week view
- start and due date are considered for showing up in today, week and current view
- various new languages (french, portuguese, italian, japanese, german, russian and many more), better translation in general

### Fixed
- due and start date can be deleted again
- various other bugfixes

## 0.4.1 - 2014-07-26
### Added
- responsive design for oC7

### Fixed
- bugfixes

## 0.4 - 2014-07-22
### Added
- enable commenting for tasks

### Fixed
- smaller style fixes

## 0.3 - 2014-07-16
### Added
- set percent completed for each task
- option to automatical/hide/show smart collections
- chose first day of week

### Fixed
- various bug fixes

## 0.2 - 2014-05-06
### Added
- new design
- implemented setting of reminders
- new collection view for current tasks
- show color of calendar in list view
- removed dependence of the appframework app

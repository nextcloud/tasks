## 0.11.0 - 2019-06-25
### Added
- Implement sharing task lists with other users #410
- Allow to delete all completed (root) tasks #414
- Allow to select a privacy classification for a task #412
- Updated preview screenshot for appstore #413
- Updated translations

### Fixed
- Regression: Open a new task after its creation #397
- Regression: Always show subtasks when task is open in details view #422
- Regression: Fix editing task properties in details view #405
- Fix scrolling task lists on mobile #421
- Better drag and drop experience #425
- Percentage complete value not visible in Chrome #411
- Better compatibility with MS Edge #401

## 0.10.1 - 2019-05-10
### Added
- Updated translations

### Fixed
- Correctly handle all numeric UIDs #394

## 0.10.0 - 2019-05-08
The front end of the app was completely rewritten in Vue.js.

### Added
- Move the app to Vue.js #194 which should speedup the app #27
- Add support for dark theme #218
- Sort tasks by last-modified, created or completed date #183, #313
- Sort calendar list alphabetically #152
- Implement colorpicker for list color selection #110
- Allow to change list of a task in details view #97
- Markdown support for task notes field #76
- Display dates according to the locale #45
- Allow to chose a default list #26
- Add synchronisation indicator showing the state of saving a task
- Show last-modified, created and completed date in details view footer
- Updated translations

### Fixed
- Fix drag and drop #78
- No glitching on app load #160
- Fix invalid priority date #180
- Fix saving due date after task creation #167
- Fix date input format #21
- Fix creating lists withouth latin characters #148

## 0.9.8 - 2018-11-21
### Fixed
- Fixed smart collections usability on Chrome #77
- Adjust calendar delete confirmation text #196
- Improve highlight of selected task #104
- Fix client-side search #22

## 0.9.7 - 2018-09-06
### Fixed
- Compatiblity with Nextcloud 14
- Fix creation of new list on mobile

## 0.9.6 - 2018-02-07
### Fixed
- Compatiblity with Nextcloud 13
- Visual fixes and cleaned up icons

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

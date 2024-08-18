## 0.16.1 - 2024-08-18

### Added
- Display error dialog to user when creating calendar for new list fails #2607

### Changed
- Updated translations
- Updated dependencies

### Fixed
- Fix selecting color when creating list #2635
- Fix selecting all-day and wrong time zone #2636
- Correctly handle timezone of created, modified and complete dates #2638
- Bring back titles in sidebar #2639
- Fix `this.$refs.menuButton is null` error #2634

## 0.16.0 - 2024-05-08

This version of Tasks is only compatible with Nextcloud server 28 and newer.

### Breaking
- Hard-links to tasks or lists have changed, because the app now uses router web history instead of web hash history mode #2480

### Added
- Implement bulk task creation #2273
- Extract tags from task summary #2425
- Implement filtering by tags #2427
- Allow to clear global search in filter menu #2431
- Show link to Deck for deck cards #2436
- Show start date as label in task body #2438
- Implement sorting trash bin items #2440
- Implement setting task location #2442
- Implement setting task URL #2443 

### Changed
- Migrate the app to vue 3 #1971
- Use router web history instead of web hash history mode #2480
- Unify style of tags in task body with sidebar #2426
- Use circular progress bar instead of linear bar #2464
- Treat tasks with `STATUS:COMPLETED` as completed #2429
- Use `TagMultiple` icon consistently #2432
- Sort tags in dropdown alphabetically #2433
- Use `NcButton` component to toggle completed tasks visibility #2434
- Update issue templates #2363
- Migrate from webpack to vite #2321
- Migrate from jest to vitest #2409
- Updated translations
- Updated dependencies

### Fixed
- Correctly handle timezones #2446
- Fix missing tasks icon in talk app #2364
- Do not use the router in the store #2362
- Don't set percent to `0` for `NEEDS-ACTION` #2365
- Correctly show task body corners when tasks are hidden #2430
- Correctly translate the loading completed tooltip #2435
- Don't show empty category for empty `CATEGORIES` param #2437
- Use `NcDateTime` to show time in trashbin #2439
- Show correct calendar weeks in date picker #2366
- Show completed button label correctly #2558
- Remove margin from link in task body summary #2559

## 0.15.0 - 2023-05-16

This version of Tasks is only compatible with Nextcloud server 25 and newer.

### Added
- Adjust style for Nextcloud 25 and above #2166 #2168
- Use `NcTextField` for task create input, show submit button on the right #2226 

### Changed
- Adjust task list sharing interface #2219
- Sort tasks by priority before sorting alphabetically #2210
- Migrate from `NcMultiselect` to `NcSelect` #2193 #2197 #2217
- Code cleanup #2192 #2218 #2254

### Fixed
- Fix closing tag list after selection #1796
- Don't occlude sort order dropdown by sidebar #2227 
- Correctly import `NcProgressBar` #2187
- Fix Tasks icon color in Dashboard widget #2186
- Fix markdown checkbox style #2206
- Show notes equally in editing and preview mode #2209
- Fix inconsistent property `X-ALT-DESC` #2240
- Fix TaskStatusDisplay #2256

## 0.14.5 - 2022-10-19

### Added
- Compatibility with Nextcloud server 25 #2114
- Allow to double click task title or notes icon to edit title and notes in AppSidebar #2112

### Changed
- User border-radius-large for task body #2104
- Indicate tasks with future start date #1998
- Update to nextcloud/vue@6 #2127
- Use `NcTextfield` for new calendar name input #2086
- Use `NcProgressBar` instead of HTML progress #2082
- Use `CounterBubble` instead of `NcAppNavigationCounter` #2081
- Use nextcloud/vue buttons #1820
- Migrate to DashboardWidget from nextcloud/vue #1985
- Adjust server versions to test PHP code for #2073 
- Updated translations
- Updated dependencies
- Code cleanup #1963 #1964 #1974 #1975 #2016 #2113

### Fixed
- Check that taskUri is defined before searching #1973
- Fix sharing tooltip #2090
- Fix talk integration #1999
- Fix the task status display animation #1979
- Don't show dashboard actions for read-only tasks #2017

## 0.14.4 - 2022-03-19

### Fixed
- Don't open sidebar when completing task #1948

## 0.14.3 - 2022-03-18

### Added
- Allow to complete tasks from the Dashboard #1790
- Allow to empty the trash bin #1802

### Changed
- Increase size of load all completed tasks button #1777
- Always show sharing icon for shared lists #1877
- Adjust material design icon size to 20 #1789
- Use material design checkboxes #1933
- Rename download to export #1941
- Updated translations
- Updated dependencies
- Code cleanup #1763 #1775 #1795 #1804 #1814 #1837 #1871 #1887 #1914

### Fixed
- Confirm slider value by pressing enter #1769
- Don't reset date when setting time with keyboard #1819
- Use material design icon for group avatar #1762
- Fix calendar picker style in dashboard #1764
- Fix sort order direction icon position #1815
- Fix undefined Tasks version when creating a task from Dashboard or Talk #1797
- Track calendars by url in Multiselect #1872
- Don't break trash bin if calendar is undefined #1873
- Load all calendars for trash bin #1943
- Fix locale en_SG #1938
- Correctly show untitled items in trash bin #1876
- Correctly align plus icon in task input field #1895

## 0.14.2 - 2021-08-29

### Added
- Show created, modified and completed date in AppSidebar subtitle tooltip #1746

### Changed
- Updated translations
- Updated dependencies

### Fixed
- Send correct content type for PUT requests https://github.com/nextcloud/cdav-library/issues/539

## 0.14.1 - 2021-08-02

### Added
- Restore ancestors and children when restoring a task #1728
- Show task title in appsidebar title tooltip #1702
- Open notes tab in appsidebar on notes icon click #1703
- Allow to add task from dashboard #1688
- Improve task creation dialog styling #1709
- Add plus icon to task input field #1705

### Changed
- Don't show trash bin header while loading or empty #1720
- Code cleanup #1690 #1706 #1735

### Fixed
- Don't overwrite title if navigating while editing #1716
- Fix task creation from talk message #1708
- Properly decode sharee name in sharee search #1734
- Correctly align settings label #1719
- Use correct icon for dark theme dashboard #1718

## 0.14.0 - 2021-07-18

### Added
- Completely new AppSidebar using Nextcloud style #1030
- Added GUI for the trash bin #1675
- Dashboard widget #1641
- Allow to create tasks from Talk messages #1649
- Show week number in date picker #1556
- Allow to download/export a single task #103
- Add link to calendar for tasks with due date #803

### Changed
- Treat cancelled tasks as completed #1553
- Allow to remove status property #1510
- Move task delete action into dropdown menu #1328
- Adjust the app-navigation-toggle alignment #1668
- Rename categories to tags #1526
- Require Nextcloud server v20 or newer #1655
- Use NPM7 and simplify build configuration #1638
- Use Codecov action instead of bash uploader #1594
- Updated translations
- Updated dependencies

### Fixed
- Correctly show sunday column in Datepicker #935
- Fix moving tasks between calendars #1581

## 0.13.6 - 2020-11-11

### Added
- Updated translations
- Updated dependencies

### Fixed
- Only moved dragged task #1329 #1330

## 0.13.5 - 2020-10-20

### Added
- Reduce subtasks container padding on mobile #1250 #1280
- Updated translations
- Updated dependencies

### Fixed
- Fix opening calendar edit input #1276 #1283
- Improve sorting calendars on mobile #1278 #1285
- Improve calendar deletion wording #1279 #1290
- Fix hide-subtasks popover icon #1282 #1284
- Fix task sort-order icons on dark theme #1288 #1289 
- Fix webpack5 build #1286
- Remove unused component #1277 #1281
- Fix stylelint #1304

## 0.13.4 - 2020-10-11

### Added
- Allow to adjust the calendar order #15 #1155
- Adjust app to unified search of Nextcloud 20 #1202 #1226
- Updated translations
- Updated dependencies

### Fixed
- Fix failing SCSS compilation #1251 #1262
- Improve calculating new task sort order #1169
- Better indicate dropping on empty completed list #1170
- Fix actions menus #1225

## 0.13.3 - 2020-07-30

### Added
- Update the design of the task list #1136
- Updated translations
- Updated dependencies

### Fixed
- Fix double escaping of calendar names, needs NC 18.0.5 or 19.0.1 onwards #1123
- Allow dragging to parent tasks which have their subtasks hidden #1150
- Fix opacity of completed tasks dropdown menu #1136 #1145
- Fix Internal Server Error when not logged in #1138
- Fix unused import of css file #1125
- Add SCSS stylelint, fix SCSS style issues #1139 #1144

## 0.13.2 - 2020-07-13

### Added
- Show completed date in task body #1078
- Updated translations
- Updated dependencies

### Fixed
- Don't close task details when selecting sort order #1046
- Properly handle multiple categories properties #1114
- Add comments for translators fd01755acb939d1cf4f07c2291e353845172af6d

## 0.13.1 - 2020-05-15

### Added
- Only open details view for new tasks if there is enough space #1037 #1039
- Update screenshot #1041
- Updated translations

### Fixed
- Various style fixes for Tasks on mobile #1036
- Fix overflowing section in right sidebar #1040

## 0.13.0 - 2020-05-11

### Added
- Implement manual sorting of tasks #237
- Allow sharing with circles #995
- Propose categories of all available tasks #998
- Remember last view #989
- Make task input field stick to the top #1027
- Allow to close left sidebar on desktop #965
- Show due time in task body on large screens #992
- Show calendar color in front of calendar name in task list #1013
- Adjust task-body hover and active background-color to new Nextcloud standard #1014
- Use initial state api #987
- Updated translations
- Updated dependencies
- Code cleanup #990 #1015

## 0.12.2 - 2020-04-27

### Added
- Updated translations
- Updated dependencies
- Update Github actions #939, #952, #958
- Code cleanup #974

### Fixed
- Don't show subscriptions anymore #942
- Fix interpreting RELTYPE=CHILD/SIBLING as parent relation #972
- Don't cut off task title in task body #917
- Don't use deprecated globals #953, #963

## 0.12.1 - 2020-03-08

### Fixed
- Don't break the app by subscribed calendars #911

## 0.12.0 - 2020-03-08

### Added
- Properly show all tasks matching a collection (including subtasks) #83 #431
- Implement pinning a task, works with [OpenTasks](https://github.com/dmfs/opentasks) #695
- Allow to set task status #655
- Save last value of all-day setting and apply to new dates #657
- Load tasks from server if not found locally #608
- Adjust sort-order dropdown style #736
- Navigate to newly created calendar after creation #825
- Allow strike-through and italic in notes field #682 #702
- Use new icons for start and due date in details view #865
- Show user avatars for shared lists and in share view #862
- Move task body actions into dropdown #866
- Move to Github actions #844
- Move app-navigation to vue-components #818
- Remove padding on content area for small screens #900
- Updated translations
- Updated dependencies
- Code cleanup #632 #696 #698 #712 #713 #721 #722 #723 #843 #846 #853 #868

### Fixed
- Regression: Don't open detail view when toggling completed state #681
- Prevent editing non-public tasks in lists shared with me #862
- Prevent moving non-public tasks to lists shared with me #902
- Increase size of clickable area to 44x44 px to follow Nextcloud standard #734 #735
- Fix color of checked checkboxes in dark mode #679
- Fix error when clicking successful sync status #699
- Prevent adding a sharee twice #782
- Set primary color on default calendar creation #839
- Fix issues with very long task titles #840
- Prevent read-only calendars as default calendar #841
- Hide superfluous scrollbar in task list #842
- Better handle calendars without assigned color #904

## 0.11.3 - 2019-09-17

### Added
- Updated translations
- Updated dependencies

### Fixed
- Minor design fix for checkboxes on Nextcloud 16 #605
- Fix scrolling on Android #613

## 0.11.2 - 2019-09-10
### Added
- Support for Nextcloud 17 #579
- Adjust checkbox design to match overall Nextcloud style #572
- Rework task item layout #598
- Updated translations
- Updated dependencies

### Fixed
- Fix problems with Chrome 77 #593
- Don't show raw JSON when adding categories #416
- Only show toggle-all-day checkbox when a date is set #576
- Fix the key in `v-for` for tasks #578
- Slightly reduced the bundlesize #571
- Properly scope instance properties #586
- Use built-in replace functionality for translations #591
- Remove legacy code #600

## 0.11.1 - 2019-08-08
### Added
- Add possibility to drop tasks on calendars and collections in left sidebar #399
- Updated translations
- Updated dependencies
- Added unit- and integration tests for PHP code #511

### Fixed
- Enable showing calendars with percent-encoded characters in their URI #480
- Fix double-encoded calendar names and task name placeholders #486
- Correctly handle tasks in read-only calendars #523, #529

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

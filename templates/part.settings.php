<div id="settings_modal" stop-event="click">
    <div class="header">
        <h2><?php p($l->t('Settings')); ?></h2>
        <div class="button" ng-click="ok()">
            <text><?php p($l->t('Done')); ?></text>
        </div>
    </div>
    <div class="content">
        <tabset justified="true">
            <tab>
                <tab-heading><?php p($l->t('General')); ?></tab-heading>
                <text><?php p($l->t('General Settings')); ?></text>
                <ul>
                    <li>
                        <span class="icon none"></span>
                        <span class="title"><text><?php p($l->t('Start of week')); ?></text></span>
                        <span>
                            <select ng-change="setStartOfWeek()" ng-model="settingsmodel.getById('various').startOfWeek" ng-options="startOfWeekOption.id as startOfWeekOption.name for startOfWeekOption in startOfWeekOptions"></select>
                        </span>
                    </li>
                </ul>
            </tab>
            <tab>
                <tab-heading><?php p($l->t('Smart Collections')); ?></tab-heading>
                <text><?php p($l->t('Visibility of Smart Collections')); ?></text>
                <ul>
                    <li ng-repeat="collection in collections">
                        <span class="icon collection-{{ collection.id }}"><text ng-show="collection.id=='today'"><?php p($_['DOM']); ?></text></span>
                        <span class="title"><text>{{ collection.displayname }}</text></span>
                        <span>
                            <select ng-change="setVisibility(collection.id)" ng-model="collection.show" ng-options="collectionOption.id as collectionOption.name for collectionOption in collectionOptions"></select>
                        </span>
                    </li>
                </ul>
            </tab>
        </tabset>
    </div>
</div>
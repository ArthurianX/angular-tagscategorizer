angular.module('tagsCategorizer').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('angular-tagscategorizer.html',
    "<div class=\"ar-tags-categorizer\">\n" +
    "    <div class=\"row\">\n" +
    "\n" +
    "        <div class=\"groups-list col-md-6\">\n" +
    "\n" +
    "            <div class=\"add-group\">\n" +
    "                <form name=\"groupName\">\n" +
    "\n" +
    "                    <input type=\"text\"\n" +
    "                           ng-model=\"newGroup\"\n" +
    "                           placeholder=\"{{i18n.newgroup}}\"\n" +
    "                           ng-keypress=\"checkAddNew($event)\"\n" +
    "                           ng-pattern=\"nameRx\"\n" +
    "                           name=\"gName\">\n" +
    "                    <button ng-click=\"addNewGroup()\"\n" +
    "                            ng-disabled=\"groupName.gName.$error.pattern\">\n" +
    "                        <i class=\"fa fa-plus\"></i>\n" +
    "                    </button>\n" +
    "\n" +
    "                </form>\n" +
    "\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"add-group error\" ng-if=\"refreshDataError\">\n" +
    "                <i class=\"fa fa-exclamation-triangle\"></i> {{i18n.operationError}} <i class=\"fa fa-exclamation-triangle\"></i>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"bags\" ng-init=\"makeVisible(0)\">\n" +
    "                <div\n" +
    "                     ng-repeat=\"group in tagsGroups track by $index\"\n" +
    "                     class=\"bag clearfix bag{{$index}}\"\n" +
    "                     id=\"bag bag{{$index}}\"\n" +
    "                     ng-click=\"makeVisible($index)\"\n" +
    "                     ng-class=\"{'waiting': group.waitOperation}\"\n" +
    "                     data-gid=\"{{group.id}}\"\n" +
    "                     data-index=\"{{$index}}\">\n" +
    "                    <!--ng-init=\"hookGroups($last)\"-->\n" +
    "                    <div class=\"title clearfix\">\n" +
    "\n" +
    "                        <span ng-if=\"!renameGroup[$index]\">{{group.name}}</span>\n" +
    "                        <input type=\"text\" class=\"rename\"\n" +
    "                               ng-model=\"group.name\"\n" +
    "                               ng-click=\"stopEvent($event)\"\n" +
    "                               ng-pattern=\"nameRx\"\n" +
    "                               ng-keypress=\"checkRenameGroup($event, $index, group.name)\"\n" +
    "                               ng-if=\"renameGroup[$index] && group.open\">\n" +
    "                        <div class=\"pull-right\">\n" +
    "                            <button class=\"edit-group\"\n" +
    "                                    ng-if=\"group.open\"\n" +
    "                                    ng-disabled=\"deleteConf > 0\"\n" +
    "                                    ng-click=\"editGroup($event, $index)\"><i class=\"fa fa-pencil-square-o\"></i></button>\n" +
    "\n" +
    "                            <button class=\"remove-group confirm\"\n" +
    "                                  ng-if=\"deleteConf && group.open\"\n" +
    "                                  ng-disabled=\"renameGroup[$index]\"\n" +
    "                                  ng-click=\"deleteTagGroup($event, $index, true)\">\n" +
    "                                <i class=\"fa fa-check\"></i>\n" +
    "                            </button>\n" +
    "                            <button class=\"remove-group\"\n" +
    "                                  ng-class=\"{'confirm-deletion': deleteConf > 0}\"\n" +
    "                                  ng-if=\"group.open\"\n" +
    "                                  ng-disabled=\"renameGroup[$index]\"\n" +
    "                                  ng-click=\"deleteTagGroup($event, $index)\">\n" +
    "                                <i class=\"fa fa-times\"></i>\n" +
    "                            </button>\n" +
    "\n" +
    "                            <button type=\"button\" class=\"btn btn-info nr-tags\">{{group.tags.length}} <i class=\"fa fa-tags\"></i></button>\n" +
    "\n" +
    "                            <i class=\"arrow glyphicon\" ng-class=\"{'glyphicon-chevron-down': group.open, 'glyphicon-chevron-right': !group.open}\"></i>\n" +
    "                        </div>\n" +
    "\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"tags clearfix\"\n" +
    "                         ng-show=\"group.open\"\n" +
    "                         ng-class=\"{'confirm-deletion': deleteConf > 0}\">\n" +
    "\n" +
    "                          <span class=\"tag\"\n" +
    "                                ng-repeat=\"tag in group.tags track by $index\"\n" +
    "                                data-tag=\"{{tag}}\"\n" +
    "                                data-index=\"{{$index}}\">\n" +
    "                              <!--ng-init=\"hookTags($last)\"-->\n" +
    "                            <i class=\"fa fa-tag\"></i> {{tag}} <i ng-click=\"removeAssignedTag(group, $index)\" class=\"glyphicon glyphicon-remove\"></i>\n" +
    "                          </span>\n" +
    "                    </div>\n" +
    "\n" +
    "                </div>\n" +
    "            </div>\n" +
    "\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"ungrouped-tags col-md-6\">\n" +
    "            <h4>{{i18n.uncateg}}</h4>\n" +
    "            <span class=\"unsel-tag\"\n" +
    "                  ng-repeat=\"tag in ungroupedTags track by $index\"\n" +
    "                  data-tag=\"{{tag}}\"\n" +
    "                  data-index=\"{{$index}}\"\n" +
    "                  ng-click=\"addTagToGroup($index)\"\n" +
    "                    >\n" +
    "                <i class=\"fa fa-tag\"></i> {{tag}} <i ng-click=\"removeAssignedTag(group.tags, $index)\" class=\"glyphicon glyphicon-remove\"></i>\n" +
    "            </span>\n" +
    "        </div>\n" +
    "\n" +
    "    </div>\n" +
    "</div>"
  );

}]);

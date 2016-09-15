"use strict";


if (typeof dragula == 'undefined') {
    var dragula;
    throw "Exception: dragula.js is undefined. Please add the library as a dependency to your project";
}

angular.module('tagsCategorizer',[]);

angular.module('tagsCategorizer')
    .directive('tagsCategorizer',['$parse', '$document', '$http', '$timeout', '$compile','$templateCache',
        function($parse, $document, $http, $timeout, $compile, $templateCache){
            return {
                restrict: 'E',
                scope: {
                    tagsGroups: '=tagsGroups',
                    ungroupedTags: '=ungroupedTags',
                    addGroup: '&addGroup',
                    updateGroup: '&updateGroup',
                    deleteGroup: '&deleteGroup',
                    translations: '=translations',
                    resolveOperation: '=resolveOperation',
                    refreshData: '&refreshData'
                },
                templateUrl: 'angular-tagscategorizer.html',
                controller: ['$scope', function tagsCategorizerCtrl($scope){

                    // Synchronisation System Logic

                    var ID = function () {
                        // Math.random should be unique because of its seeding algorithm.
                        // Convert it to base 36 (numbers + letters), and grab the first 9 characters
                        // after the decimal.
                        return '_' + Math.random().toString(36).substr(2, 9);
                    };

                    $scope.operationsControl = [];

                    $scope.refreshDataError = false;
                    var operationError;
                    var handleError = function(){
                        $scope.refreshData();
                    };

                    $scope.operationManagement = {

                        editGroup: function(group){
                            $timeout.cancel(operationError);
                            operationError = $timeout(function() {
                                $scope.refreshDataError = true;
                                handleError();
                            }, 4000);

                            var genID = ID();
                            group.waitOperation = genID;
                            $scope.operationsControl.push(genID);
                            return genID;
                        },

                        deleteGroup: function(index, group){

                            operationError = $timeout(function() {
                                $scope.refreshDataError = true;
                                handleError();
                            }, 4000);

                            var genID = ID();
                            group.waitOperation = genID;
                            $scope.operationsControl.push(genID);
                            return genID;
                        },

                        moveTag: function(tag, place){
                            // track tags new position
                        },
                        resolve: function(resolver){

                            //Cancel the error.
                            $timeout.cancel(operationError);

                            var code = resolver[0];

                            if (code === '') {
                                return false;
                            }
                            var indexOfCode = $scope.operationsControl.indexOf(code);

                            if (indexOfCode > -1) {

                                // Search for the code in groups names
                                $scope.tagsGroups.forEach(function(val, index){

                                    if (val.waitOperation === code) {
                                        if (resolver[1]){
                                            //Delete operation
                                            $scope.tagsGroups.splice(index, 1);
                                            $scope.operationsControl.splice(indexOfCode, 1);
                                            // Open the first group
                                            $scope.makeVisible(0);
                                            return false;
                                        } else {
                                            val.waitOperation = false;
                                            $scope.operationsControl.splice(indexOfCode, 1);
                                            return false;
                                        }
                                    }

                                    if (val.tags) {
                                        val.tags.forEach(function(tag){
                                            if (tag.waitOperation === code) {
                                                tag.waitOperation = false;
                                                $scope.operationsControl.splice(indexOfCode, 1);
                                            }
                                        });
                                    }
                                });

                                // Search for the code in ungrouped tags
                                $scope.ungroupedTags.forEach(function(val){
                                    if (val.waitOperation === code) {
                                        val.waitOperation = false;
                                        $scope.operationsControl.splice(indexOfCode, 1);
                                    }
                                });

                            }
                        }
                    };

                    // Init
                    $scope.newGroup = '';
                    $scope.renameGroup = [];
                    $scope.i18n = $scope.translations || {uncateg: 'Uncategorized tags', newgroup: 'Add new Group', operationError: 'Operation error, refreshing all data.'};

                    // Input Validation
                    $scope.nameRx = /^[a-zA-Z0-9 ]{3,25}$/;

                    //Actions
                    $scope.addNewGroup = function(){
                        if (($scope.newGroup !== undefined)&&($scope.newGroup.length > 3)) {
                            //$scope.tagsGroups.unshift({name: $scope.newGroup, tags: [], short: $scope.newGroup.toLowerCase()});
                            $scope.addGroup(
                                {
                                    group: {name: $scope.newGroup, tags: [], short: $scope.newGroup.toLowerCase()}
                                }
                            );
                            $scope.newGroup = '';
                        }
                    };

                    $scope.checkAddNew = function(event){
                        if (event.keyCode == 13) {
                            $scope.addNewGroup();
                        }
                    };

                    $scope.checkRenameGroup = function(event, index){
                        if (angular.element(event.srcElement).hasClass('ng-invalid-pattern') && event.keyCode == 13) {
                            $timeout(function(){
                                $scope.$digest();
                            }, 100);
                            return false;
                        }

                        if (event.keyCode == 13) {
                            $scope.editGroup(event, index);
                        }


                    };

                    $scope.editGroup = function(e, index){
                        e.preventDefault();
                        e.stopPropagation();
                        if ($scope.renameGroup[index]){
                            //Means we're closing the edit ?
                            if ($scope.tagsGroups[index].name === '') {
                                return false;
                            }
                            $scope.updateGroup(
                                {
                                    group: $scope.tagsGroups[index],
                                    operationId: $scope.operationManagement.editGroup($scope.tagsGroups[index])
                                }
                            );
                        }
                        $scope.renameGroup[index] = !$scope.renameGroup[index];
                    };

                    $scope.stopEvent = function(e) {
                        e.stopPropagation();
                        e.preventDefault();
                    };

                    $scope.deleteConf = 0;
                    $scope.deleteTagGroup = function(e, index, checker){
                        $scope.deleteConf += 1;

                        if ($scope.deleteConf >= 2 && checker) {
                            $scope.ungroupedTags = $scope.ungroupedTags.concat($scope.tagsGroups[index].tags);
                            $scope.deleteGroup(
                                {
                                    group: $scope.tagsGroups[index],
                                    operationId: $scope.operationManagement.deleteGroup(index, $scope.tagsGroups[index])
                                }
                            );
                            $scope.deleteConf = 0;
                        }

                        if ($scope.deleteConf >= 2 && !checker) {
                            $scope.deleteConf = 0;
                        }
                    };

                    $scope.makeVisible = function(index) {

                        if ($scope.renameGroup.indexOf(true) > -1) {
                            return false;
                        }

                        if ($scope.tagsGroups === undefined || $scope.tagsGroups.length === 0) {
                            return false;
                        }

                        $scope.tagsGroups.forEach(function(val){
                            val.open = false;
                        });

                        if ($scope.tagsGroups[index]) {
                            $scope.tagsGroups[index].open = true;
                        }
                    };

                    $scope.removeAssignedTag = function(group, index) {
                        $scope.ungroupedTags.push(group.tags[index]);
                        group.tags.splice(index, 1);
                        $scope.updateGroup(
                            {
                                group: group,
                                operationId: $scope.operationManagement.editGroup(group)
                            }
                        );
                    };

                    $scope.addTagToGroup = function(index) {
                        $scope.tagsGroups.forEach(function(group, gIndex){
                            if (group.open) {
                                group.tags.push($scope.ungroupedTags[index]);
                                $scope.ungroupedTags.splice(index, 1);
                                $scope.updateGroup(
                                    {
                                        group: $scope.tagsGroups[gIndex],
                                        operationId: $scope.operationManagement.editGroup($scope.tagsGroups[gIndex])

                                    }
                                );
                            }
                        });
                    };

                    /* Drag and Drop To Model Logic */

                    $scope.modelActions = function(type, tag, source, dest, before) {
                        var groupChange;

                        var pushSpecific = function(arr, el, index) {
                            if (index) {
                                // Push to specific position in array
                                arr.splice(index, 0, el);
                            } else {
                                arr.push(el);
                            }
                        };

                        if (type) {

                            $scope.tagsGroups[source].tags.splice(tag[0], 1);
                            pushSpecific($scope.ungroupedTags, tag[1], before);

                            groupChange = $scope.tagsGroups[source];
                        } else {
                            pushSpecific($scope.tagsGroups[dest].tags, tag[1], before);
                            $scope.ungroupedTags.splice(tag[0], 1);

                            groupChange = $scope.tagsGroups[dest];
                        }

                        $timeout(function(){
                            $scope.$apply();
                        }, 80);

                        $scope.updateGroup(
                            {
                                group: groupChange,
                                operationId: $scope.operationManagement.editGroup(groupChange)
                            }
                        );
                        // At the end of the operations delete the "COPIED" tag
                        //$scope.removeTag();

                    };

                }],
                link: function(scope, element, attrs) {

                    // Main Logic
                    var currEl;

                    var applyToModel = function(el, target, source, sibling) {
                        currEl = angular.element(el);
                        var tagsToUnused, bagDest, bagSource, pushBefore;
                        var tag = [angular.element(el).attr('data-index'), angular.element(el).attr('data-tag')];

                        if (angular.element(target).hasClass('ungrouped-tags')) {
                            tagsToUnused = true;
                            bagSource = angular.element(source).parent().attr('data-index');
                            bagDest = 'unused';
                        } else {
                            tagsToUnused = false;
                            bagDest = angular.element(target).parent().attr('data-index');
                            bagSource = 'unused';
                        }

                        if (sibling) {
                            pushBefore = angular.element(sibling).attr('data-index');
                        }

                        scope.modelActions(tagsToUnused, tag, bagSource, bagDest, pushBefore);

                    };

                    scope.removeTag = function(){
                        // We will delete the element that has been dragged after the controller logic is OK
                        currEl.remove();
                    };

                    // Instantiate dragula
                    var drake = dragula({
                        isContainer: function (el) {
                            return false; // only elements in drake.containers will be taken into account
                        },
                        moves: function (el, source, handle, sibling) {
                            return true; // elements are always draggable by default
                        },
                        accepts: function (el, target, source, sibling) {
                            return true; // elements can be dropped in any of the `containers` by default
                        },
                        invalid: function (el, target) {
                            return false; // don't prevent any drags from initiating by default
                        },
                        direction: 'vertical',             // Y axis is considered when determining where an element would be dropped
                        copy: false,                       // elements are moved by default, not copied
                        copySortSource: false,             // elements in copy-source containers can be reordered
                        revertOnSpill: true,              // spilling will put the element back where it was dragged from, if this is true
                        removeOnSpill: false,              // spilling will `.remove` the element, if this is true
                        mirrorContainer: document.body,    // set the element that gets mirror elements appended
                        ignoreInputTextSelection: true     // allows users to select input text, see details below
                    });

                    // Events
                    drake
                        .on('drag', function (el) {
                            // Indicate drag
                        })
                        .on('shadow', function (el, container, source) {
                            //console.log('Shadow', el, container, source);
                            // Indicate drag
                        })
                        .on('remove', function (el, container, source) {
                            //console.log('Remove', el, container, source);
                            // Indicate drag
                        })
                        .on('drop', function (el, target, source, sibling) {
                            // Work the model instead of just leaving the elements
                            if (target == source) {
                                return false;
                            } else {
                                applyToModel(el, target, source, sibling);
                            }
                            drake.cancel(true);

                        }).on('over', function (el, container) {
                            angular.element(container).addClass('ar-tags-over');
                        }).on('out', function (el, container) {
                            angular.element(container).removeClass('ar-tags-over');
                        });

                    /* Bad Watchers - REFACTOR */
                    scope.$watchCollection(
                        "tagsGroups",
                        function( newValue, oldValue ) {

                            //When there's new data coming in, automatically turn off the error message
                            scope.refreshDataError = false;

                            if (newValue !== undefined && newValue.length > 0 && angular.isArray(newValue)) {
                                $timeout(function(){
                                    for (var i=0; i < newValue.length; i++) {
                                        drake.containers.push(document.querySelector('.bag' + i + ' .tags'));
                                    }
                                }, 100);
                            }
                        }
                    );

                    scope.$watchCollection(
                        "ungroupedTags",
                        function( newValue, oldValue ) {

                            //When there's new data coming in, automatically turn off the error message
                            scope.refreshDataError = false;

                            if (newValue !== undefined && newValue.length > 0) {
                                $timeout(function(){
                                    var tags = angular.element(element.children().children().children()[1])[0];
                                    drake.containers.push(tags);
                                }, 100);
                            } else {
                                // Means the array is probably empty
                                scope.ungroupedTags = [];
                            }
                        }
                    );

                    scope.$watch(
                        "resolveOperation",
                        function( newValue, oldValue ) {
                            scope.operationManagement.resolve(newValue);
                        }
                    );

                }
            };
        }
    ]);


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

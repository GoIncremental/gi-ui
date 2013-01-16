
/*global angular
*/

angular.module('app').directive('modal', [
  function() {
    return {
      restrict: 'E',
      scope: {
        title: '@',
        visible: '='
      },
      transclude: true,
      templateUrl: '/views/gint-ui/modal.html',
      controller: [
        '$scope', '$element', '$transclude', function($scope, $element, $transclude) {
          return $transclude(function(clone) {
            var bodyBlock, footerBlock, transcludedBody, transcludedFooter;
            bodyBlock = $element.find('div.modal-body');
            transcludedBody = clone.filter('div.body');
            angular.forEach(transcludedBody, function(e) {
              return bodyBlock.append(angular.element(e));
            });
            footerBlock = $element.find('div.modal-footer');
            transcludedFooter = clone.filter('div.footer');
            angular.forEach(transcludedFooter, function(e) {
              return footerBlock.append(angular.element(e));
            });
            $element.addClass('modal hide');
            $scope.$watch('visible', function(value) {
              var showModal;
              showModal = value ? 'show' : 'hide';
              return $element.modal(showModal);
            });
            return $scope.hide = function() {
              return $scope.visible = false;
            };
          });
        }
      ]
    };
  }
]);


angular.module('app').directive('datatable', [
  '$filter', '$timeout', function($filter, $timeout) {
    return {
      restrict: 'E',
      templateUrl: '/views/gint-ui/dataTable.html',
      transclude: true,
      scope: {
        items: '=',
        selectedItems: '=',
        sortDirection: '=',
        sortProperty: '=',
        options: '=',
        search: '&',
        sort: '&',
        destroy: '&',
        view: '&',
        altView: '&',
        edit: '&'
      },
      compile: function($elem, $attrs, $transcludeFn) {
        $transcludeFn($elem, function(clone) {
          var body, bodyBlock, header, headerBlock;
          headerBlock = $elem.find('table thead tr');
          header = clone.filter('div.header');
          angular.forEach(header.children(), function(e) {
            return headerBlock.append('<th>' + e.innerText + '</th>');
          });
          bodyBlock = $elem.find('table tbody');
          bodyBlock.append('<tr ng-repeat="item in pagedItems[currentPage]" ng-class="{info: item.selected}"><td><input type="checkbox" ng-model="item.selected" ng-click="select()"></td></tr>');
          body = clone.filter('div.body');
          return angular.forEach(body.children(), function(e) {
            var elem, html, property;
            elem = angular.element(e);
            if (elem.hasClass('property-link')) {
              property = elem.attr('gi-property');
              html = angular.element(e.innerHTML).append('{{item.' + property + '}}');
              return bodyBlock.children().append('<td>' + html[0].outerHTML + '</td>');
            } else if (elem.hasClass('property-mailto')) {
              property = elem.attr('gi-property');
              return bodyBlock.children().append('<td><a ng-href="mailto:{{item.' + property + '}}"">{{item.' + property + '}}</a></td>');
            } else if (elem.hasClass('property')) {
              return bodyBlock.children().append('<td>{{item.' + e.innerText + '}}</td>');
            } else if (elem.hasClass('literal')) {
              return bodyBlock.children().append('<td>' + e.innerHTML + '</td>');
            } else if (elem.hasClass('expression')) {
              return bodyBlock.children().append('<td>{{' + e.innerText + '}}</td>');
            }
          });
        });
        return function($scope) {
          var aPromise;
          $scope.filteredItems = [];
          $scope.groupedItems = [];
          $scope.itemsPerPage = 20;
          $scope.pagedItems = [];
          $scope.currentPage = 0;
          $scope.selectAll = "All";
          $scope.$watch('items.length', function() {
            return $scope.refresh();
          });
          $scope.$watch('sortProperty', function() {
            return $scope.refresh();
          });
          aPromise = null;
          $scope.$watch('query', function() {
            if (aPromise) {
              $timeout.cancel(aPromise);
            }
            aPromise = $timeout($scope.refresh, 500);
            return aPromise;
          });
          $scope.toggleSelectAll = function() {
            if ($scope.selectAll === "All") {
              angular.forEach($scope.items, function(item) {
                return item.selected = true;
              });
              $scope.selectedItems = $scope.items;
              return $scope.selectAll = "None";
            } else {
              angular.forEach($scope.items, function(item) {
                return item.selected = false;
              });
              $scope.selectedItems = [];
              return $scope.selectAll = "All";
            }
          };
          $scope.select = function() {
            return $scope.selectedItems = $filter('filter')($scope.items, function(item) {
              return item.selected;
            });
          };
          $scope.refresh = function() {
            var sortDir;
            if ($scope.options.customSearch) {
              $scope.filteredItems = $scope.search({
                query: $scope.query
              });
            } else {
              $scope.filteredItems = $scope.items;
            }
            $scope.filteredItems = $filter('filter')($scope.filteredItems, function(item) {
              var found;
              if (!$scope.query) {
                return true;
              }
              found = false;
              angular.forEach($scope.options.searchProperties, function(property) {
                if (!found) {
                  if ($filter('lowercase')(item[property]).indexOf($filter('lowercase')($scope.query)) !== -1) {
                    found = true;
                  }
                }
                return found;
              });
              return found;
            });
            sortDir = $scope.sortProperty === "asc" ? true : false;
            $scope.filteredItems = $filter('orderBy')($scope.filteredItems, function(item) {
              return item[$scope.sortProperty];
            }, sortDir);
            if ($scope.options.customSort) {
              $scope.filteredItems = $scope.sort({
                items: $scope.filteredItems
              });
            }
            $scope.currentPage = 0;
            return $scope.groupToPages();
          };
          $scope.groupToPages = function() {
            var i, thing, _i, _len, _ref, _results;
            $scope.pagedItems = [];
            _ref = $scope.filteredItems;
            _results = [];
            for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
              thing = _ref[i];
              if (i % $scope.itemsPerPage === 0) {
                _results.push($scope.pagedItems[Math.floor(i / $scope.itemsPerPage)] = [$scope.filteredItems[i]]);
              } else {
                _results.push($scope.pagedItems[Math.floor(i / $scope.itemsPerPage)].push($scope.filteredItems[i]));
              }
            }
            return _results;
          };
          $scope.range = function(currentPage) {
            var end, max, num, result, start, _i;
            max = $scope.pagedItems.length - 1;
            if (max < 1) {
              return [];
            }
            end = max > currentPage + 1 ? currentPage + 2 : void 0;
            start = currentPage - 2;
            if (currentPage < 3) {
              start = 0;
              if (max > 3) {
                end = 4;
              }
            }
            if (currentPage > max - 3) {
              end = max;
              if (max > 3) {
                start = max - 4;
              }
            }
            result = [];
            for (num = _i = start; start <= end ? _i <= end : _i >= end; num = start <= end ? ++_i : --_i) {
              result.push(num);
            }
            return result;
          };
          $scope.prevPage = function() {
            if ($scope.currentPage > 0) {
              return $scope.currentPage = $scope.currentPage - 1;
            }
          };
          $scope.nextPage = function() {
            if ($scope.currentPage < $scope.pagedItems.length - 1) {
              return $scope.currentPage = $scope.currentPage + 1;
            }
          };
          $scope.setPage = function(n) {
            return $scope.currentPage = n;
          };
          return $scope.refresh();
        };
      }
    };
  }
]);

;
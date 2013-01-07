

angular.module('app').directive('modal', [
  function($timeout) {
    return {
      restrict: 'E',
      templateUrl: '/views/gint-ui/modal.html',
      transclude: true,
      scope: {
        title: '@',
        level: '@',
        visible: '=ngModel',
        onOk: '&'
      },
      link: function(scope, elem, attrs) {
        elem.addClass('modal hide');
        scope.$watch('visible', function(value) {
          var showModal;
          showModal = value ? 'show' : 'hide';
          return elem.modal(showModal);
        });
        return scope.hide = function() {
          return scope.visible = false;
        };
      }
    };
  }
]);


angular.module('app').directive('datatable', [
  '$filter', function($filter) {
    return {
      restrict: 'E',
      templateUrl: '/views/gint-ui/dataTable.html',
      transclude: true,
      scope: {
        items: '=',
        selectedItems: '=',
        destroy: '&',
        view: '&'
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
          bodyBlock.append('<tr ng-repeat="item in pagedItems[currentPage]"><td><input type="checkbox" ng-model="item.selected" ng-click="select()"></td></tr>');
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
          $scope.$watch('items.length', function() {
            return $scope.search();
          });
          $scope.filteredItems = [];
          $scope.groupedItems = [];
          $scope.itemsPerPage = 20;
          $scope.pagedItems = [];
          $scope.currentPage = 0;
          $scope.things = $scope.items;
          $scope.selectAll = "All";
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
          $scope.search = function() {
            $scope.filteredItems = $filter('filter')($scope.items, function(item) {
              if (!$scope.query) {
                return true;
              }
              if ($filter('lowercase')(item.name).indexOf($filter('lowercase')($scope.query)) !== -1) {
                return true;
              }
              return false;
            });
            $scope.filteredItems = $filter('orderBy')($scope.filteredItems, function(item) {
              return item.name;
            }, false);
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
          $scope.range = function(start, end) {
            var num, ret, _i;
            ret = [];
            if (!end) {
              end = start;
              start = 0;
            }
            for (num = _i = start; start <= end ? _i <= end : _i >= end; num = start <= end ? ++_i : --_i) {
              ret.push(num);
            }
            return ret;
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
          return $scope.search();
        };
      }
    };
  }
]);

;
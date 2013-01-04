

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
        items: '='
      },
      link: function($scope, element, attrs) {
        $scope.$watch('items.length', function(val, old_val) {
          return $scope.search();
        });
        $scope.filteredItems = [];
        $scope.groupedItems = [];
        $scope.itemsPerPage = 20;
        $scope.pagedItems = [];
        $scope.currentPage = 0;
        $scope.things = $scope.items;
        $scope.search = function() {
          console.log(' datatable scope search');
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
      },
      controller: [
        '$scope', '$element', '$transclude', function($scope, $element, $transclude) {
          console.log('datatable scope id = ' + $scope.$id);
          console.log('datatable parent scope id = ' + $scope.$parent.$id);
          return $transclude(function(clone) {
            var header, headerBlock;
            console.log('transclude scope id = ' + clone.scope().$id);
            console.log('transclude parent scope id= ' + clone.scope().$parent.$id);
            headerBlock = $element.find('table thead');
            header = clone.filter('div.header');
            return angular.forEach(header.children(), function(e) {
              return headerBlock.append('<th>' + e.innerText + '</th>');
            });
          });
        }
      ]
    };
  }
]);

;

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
      templateUrl: '/views/modal.html',
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
      templateUrl: '/views/dataTable.html',
      transclude: true,
      scope: {
        items: '=',
        selectedItems: '=',
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
            return headerBlock.append('<th>' + angular.element(e).text() + '</th>');
          });
          bodyBlock = $elem.find('table tbody');
          bodyBlock.append('<tr ng-repeat="item in pagedItems[currentPage]" ' + 'ng-class="{info: item.selected}"><td><input type="checkbox" ' + 'ng-model="item.selected" ng-click="select()"></td></tr>');
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
              return bodyBlock.children().append('<td>{{item.' + elem.text() + '}}</td>');
            } else if (elem.hasClass('literal')) {
              return bodyBlock.children().append('<td>' + e.innerHTML + '</td>');
            } else if (elem.hasClass('expression')) {
              return bodyBlock.children().append('<td>{{' + elem.text() + '}}</td>');
            } else if (elem.hasClass('filter')) {
              return bodyBlock.children().append('<td>{{ item | ' + elem.text() + '}}</td>');
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
          $scope.$watch('items', function() {
            return $scope.refresh();
          });
          $scope.$watch('items.length', function() {
            return $scope.refresh();
          });
          $scope.$watch('sortProperty', function() {
            return $scope.refresh();
          });
          $scope.options.refreshRequired = false;
          $scope.$watch('options.refreshRequired', function(newVal) {
            if (newVal) {
              return $scope.refresh();
            } else {
              return $scope.options.refreshRequired = false;
            }
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
              $scope.filteredItems = $filter('filter')($scope.items, function(item) {
                var found;
                if (!$scope.query) {
                  return true;
                }
                found = false;
                angular.forEach($scope.options.searchProperties, function(property) {
                  if (!found) {
                    if ($filter('lowercase')(item[property].toString()).indexOf($filter('lowercase')($scope.query)) !== -1) {
                      found = true;
                    }
                  }
                  return found;
                });
                angular.forEach($scope.options.searchFilters, function(property) {
                  if (!found) {
                    if ($filter('lowercase')($filter(property)(item)).indexOf($filter('lowercase')($scope.query)) !== -1) {
                      found = true;
                    }
                  }
                  return found;
                });
                return found;
              });
            }
            if ($scope.options.sortProperty) {
              if ($scope.options.sortDirection === "asc") {
                sortDir = false;
              } else {
                sortDir = true;
              }
              $scope.filteredItems = $filter('orderBy')($scope.filteredItems, function(item) {
                return item[$scope.options.sortProperty];
              }, sortDir);
            }
            if ($scope.options.customSort) {
              $scope.filteredItems = $scope.sort({
                items: $scope.filteredItems
              });
            }
            $scope.currentPage = 0;
            $scope.groupToPages();
            $scope.options.refreshRequired = false;
          };
          $scope.groupToPages = function() {
            var i, thing, _i, _len, _ref, _results;
            if ($scope.filteredItems != null) {
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
            }
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


angular.module('app').directive('select2', [
  '$timeout', function($timeout) {
    return {
      restrict: 'E',
      templateUrl: '/views/select2.html',
      scope: {
        selection: '=',
        options: '=',
        debut: '='
      },
      link: function(scope, elm, attrs, controller) {
        var createSearchChoice, escapeMarkup, markMatch, opts, textField;
        escapeMarkup = function(markup) {
          var replace_map;
          replace_map = {
            '\\': '&#92;',
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&apos;',
            "/": '&#47;'
          };
          return String(markup).replace(/[&<>"'/\\]/g, function(match) {
            return replace_map[match[0]];
          });
        };
        markMatch = function(text, term, markup, escapeMarkup) {
          var match, tl;
          match = text.toUpperCase().indexOf(term.toUpperCase());
          tl = term.length;
          if (match < 0) {
            markup.push(escapeMarkup(text));
            return;
          }
          markup.push(escapeMarkup(text.substring(0, match)));
          markup.push("<span class='select2-match'>");
          markup.push(escapeMarkup(text.substring(match, match + tl)));
          markup.push("</span>");
          return markup.push(escapeMarkup(text.substring(match + tl, text.length)));
        };
        if (attrs.field != null) {
          textField = attrs.field;
        } else {
          textField = 'name';
        }
        opts = {
          multiple: attrs.tags != null,
          data: {
            results: scope.options,
            text: textField
          },
          width: 'copy',
          formatResult: function(result, container, query) {
            var markup;
            markup = [];
            markMatch(result[textField], query.term, markup, escapeMarkup);
            return markup.join("");
          },
          formatSelection: function(data, container) {
            return data[textField];
          },
          matcher: function(term, text, option) {
            return option[textField].toUpperCase().indexOf(term.toUpperCase()) >= 0;
          }
        };
        createSearchChoice = function(term, data) {
          var matchedItems, result;
          matchedItems = $(data).filter(function() {
            return this[textField].localeCompare(term) === 0;
          });
          if (matchedItems.length === 0) {
            result = {
              id: term
            };
            result[textField] = term;
            return result;
          } else {
            return {};
          }
        };
        if (attrs.custom != null) {
          opts.createSearchChoice = createSearchChoice;
        }
        attrs.$observe('disabled', function(value) {
          if (value) {
            return elm.select2('disable');
          } else {
            return elm.select2('enable');
          }
        });
        elm.bind("change", function() {
          if (attrs.debug != null) {
            console.log('in elem change 1');
          }
          return scope.$apply(function() {
            if (attrs.debug != null) {
              console.log('in elem change 2');
            }
            return scope.selection = elm.select2('data');
          });
        });
        if (attrs.debug != null) {
          console.log('select2 link');
        }
        scope.$watch('selection', function(newVal, oldVal) {
          if (attrs.debug != null) {
            console.log('selection watch hit');
            console.log('new:');
            console.log(newVal);
            console.log('old:');
            console.log(oldVal);
          }
          return elm.select2('data', newVal);
        });
        scope.$watch('options', function(newVal) {
          if (attrs.debug != null) {
            console.log('options watch hit');
            console.log('new:');
            console.log(newVal);
          }
          if (newVal) {
            if (scope.options) {
              opts.data.results = scope.options;
              return $timeout(function() {
                return elm.select2(opts);
              });
            }
          }
        });
        return $timeout(function() {
          return elm.select2(opts);
        });
      }
    };
  }
]);

angular.module('app').run(['$templateCache', function ($templateCache) {
	$templateCache.put('/views/dataTable.html', '<div class="row-fluid" ng-class="{hidden: options.disableSearch}"> <div class="span12"> <input class="search-query pull-right" placeholder="Search" ng-model="query"> </div> </div> <div class="row-fluid"> <div class="span12"> <table class="table table-striped table-condensed table-hover"> <thead> <tr> <th><a ng-click="toggleSelectAll()" ng-model="selectAll">{{selectAll}}</a></th> </tr> </thead> <tbody> </tbody> <tfoot> <td colspan="6"> <div class="pagination pull-right"> <ul> <li ng-class="{disabled: currentPage==0}"> <a href ng-click="prevPage()">« Prev</a> </li> <li ng-repeat="n in range(currentPage)" ng-class="{active: n==currentPage}" ng-click="setPage(n)"> <a href ng-click="setPage(n)" ng-bind="n + 1"></a> </li> <li ng-class="{disabled: currentPage==pagedItems.length - 2}"> <a href ng-click="nextPage()">Next »</a> </li> </ul> </div> </td> </tfoot> </table> </div> </div>');
	$templateCache.put('/views/modal.html', '<div> <div class="modal-header"> <button type="button" ng-click="hide()" class="close">x</button> <h3>{{title}}</h3> </div> <div class="modal-body"> </div> <div class="modal-footer"> <button class="btn pull-right" ng-click="hide()">Cancel</button> </div> </div>');
	$templateCache.put('/views/select2.html', '<input type="text"/>');
}]);
;
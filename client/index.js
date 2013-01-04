

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
  function() {
    return {
      restrict: 'E',
      templateUrl: '/views/gint-ui/dataTable.html',
      transclude: true,
      scope: {},
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


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

;
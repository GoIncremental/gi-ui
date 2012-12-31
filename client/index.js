

angular.module('app').directive('modal', [
  function($timeout) {
    var link;
    ({
      restrict: 'E',
      templateUrl: '/views/gint-ui/modal.html',
      transclude: true,
      scope: {
        title: '@',
        level: '@',
        visible: '=ngModel',
        okOk: '&'
      }
    });
    return link = function(scope, elem, attrs) {
      elm.addClass('modal hide');
      scope.$watch('visible', function(value) {
        var showModal;
        if (!(value || 'show')) {
          showModal = 'hide';
        }
        return elm.modal(showModal);
      });
      return scope.hide = function() {
        return scope.visible = false;
      };
    };
  }
]);

;
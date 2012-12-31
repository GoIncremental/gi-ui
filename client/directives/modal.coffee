angular.module('app').directive 'modal'
, [ ($timeout) ->
  restrict: 'E'
  templateUrl: '/views/gint-ui/modal.html'
  transclude: true,
  scope:
    title: '@'
    level: '@'
    visible: '=ngModel'
    okOk: '&'
  link = (scope, elem, attrs) ->
    elm.addClass 'modal hide'

    scope.$watch 'visible', (value) ->
      showModal = 'hide' unless value or 'show'
      elm.modal showModal

    scope.hide = () ->
      scope.visible = false
]
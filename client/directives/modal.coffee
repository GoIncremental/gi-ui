angular.module('app').directive 'modal'
, [ ($timeout) ->
  restrict: 'E'
  templateUrl: '/views/gint-ui/modal.html'
  transclude: true,
  scope:
    title: '@'
    level: '@'
    visible: '=ngModel'
    onOk: '&'
  link: (scope, elem, attrs) ->
    elem.addClass 'modal hide'

    scope.$watch 'visible', (value) ->
      showModal =  if value then 'show' else 'hide'
      elem.modal showModal

    scope.hide = () ->
      scope.visible = false
]
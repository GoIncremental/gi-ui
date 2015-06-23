angular.module('gi.ui').directive 'giEnter'
, [ () ->
  restrict: 'A'
  link: (scope, element, attrs) ->
    element.bind "keyup", (event) ->
      if event.which is 13
        scope.$evalAsync(attrs.giEnter)
        event.preventDefault();
      return
    return
]

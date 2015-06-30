angular.module('gi.ui').directive 'giFocus'
, ['$parse'
, ($parse) ->
  restrict: "A"
  link: (scope, element, attrs) ->

    attrGetter = $parse attrs.giFocus

    checkForChangeInEvaluatedValue = () ->
      attrGetter(scope)

    scope.$watch(checkForChangeInEvaluatedValue, (newVal) ->
      if newVal?
        element[0].focus()
    )

]

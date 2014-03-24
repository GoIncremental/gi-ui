angular.module('gi.ui').directive 'giFloat'
, [ () ->
  intRegex =  /^\-?\d+((\.|\,)\d+)?$/
  
  restrict: 'A'
  require: 'ngModel'
  link: ($scope, $elem, $attrs, $ctrl) ->
    
    $ctrl.$parsers.unshift (viewValue) ->

      if intRegex.test(viewValue)
        $ctrl.$setValidity 'giFloat', true
        return parseFloat(viewValue.replace(',', '.'))
      else
        $ctrl.$setValidity 'giFloat', false
        return undefined
]
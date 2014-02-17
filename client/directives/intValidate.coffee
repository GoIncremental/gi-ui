angular.module('gint.ui').directive 'giInteger'
, [ () ->
  restrict: 'A'
  require: 'ngModel'
  link: ($scope, $elem, $attrs, $ctrl) ->
    
    intValidator = (value) ->
      if value?
        intRegex = /^-?\d+$/
        if intRegex.test(value)    
          $ctrl.$setValidity 'giInteger', true
          return value
        else
          $ctrl.$setValidity 'giInteger', false
          return undefined
      else
        $ctrl.$setValidity 'giInteger', false
        return undefined
    
    $ctrl.$parsers.push intValidator
    $ctrl.$formatters.push intValidator

]
angular.module('gi.ui').directive 'giInteger'
, [ () ->
  intRegex = /^\-?\d+$/
  
  restrict: 'A'
  require: 'ngModel'
  link: ($scope, $elem, $attrs, $ctrl) ->
    
    $ctrl.$parsers.unshift (value) ->

      if intRegex.test(value)
        $ctrl.$setValidity 'giInteger', true
        return value
      else
        $ctrl.$setValidity 'giInteger', false
        return undefined
]
angular.module('gi.ui').directive 'giMax'
, [ () ->
  restrict: 'A'
  require: 'ngModel'
  link: ($scope, $elem, $attrs, $ctrl) ->
    
    $scope.$watch $attrs.giMax, () ->
      $ctrl.$setViewValue $ctrl.$viewValue
    
    maxValidator = (value) ->
      max = $scope.$eval($attrs.giMax)
      if value? and max?
        if value > max
          $ctrl.$setValidity 'giMax', false
          return undefined
        else
          $ctrl.$setValidity 'giMax', true
          return value
    
    $ctrl.$parsers.push maxValidator
    $ctrl.$formatters.push maxValidator

]
angular.module('gi.ui').directive 'giMin'
, [ () ->
  restrict: 'A'
  require: 'ngModel'
  link: ($scope, $elem, $attrs, $ctrl) ->
    
    $scope.$watch $attrs.giMin, () ->
      $ctrl.$setViewValue $ctrl.$viewValue
    
    minValidator = (value) ->
      min = $scope.$eval($attrs.giMin)
      if value? and min?
        if value < min
          $ctrl.$setValidity 'giMin', false
          return undefined
        else
          $ctrl.$setValidity 'giMin', true
          return value
    
    $ctrl.$parsers.push minValidator
    $ctrl.$formatters.push minValidator

]
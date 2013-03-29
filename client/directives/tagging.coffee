angular.module('app').directive 'tagging', ->
  restrict: 'E'
  templateUrl: '/views/tagging.html'
  scope:
    options: '='
    selection: '='
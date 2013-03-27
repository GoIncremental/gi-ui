angular.module('app').directive 'tagging', ->
  restrict: 'E'
  templateUrl: '/views/gint-ui/tagging.html'
  scope:
    options: '='
    selection: '='
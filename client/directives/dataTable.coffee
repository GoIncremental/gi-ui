angular.module('app').directive 'datatable'
, [ () ->
  restrict: 'E'
  templateUrl: '/views/gint-ui/dataTable.html'
  transclude: true
  scope: {}
  controller: ['$scope', '$element', '$transclude'
  ,($scope, $element, $transclude) ->
    console.log 'datatable scope id = ' + $scope.$id
    console.log 'datatable parent scope id = ' + $scope.$parent.$id
    $transclude (clone) ->
      console.log 'transclude scope id = ' + clone.scope().$id
      console.log 'transclude parent scope id= ' + clone.scope().$parent.$id  
      headerBlock = $element.find('table thead')
      header = clone.filter('div.header')
      angular.forEach header.children(), (e) ->
        headerBlock.append '<th>' + e.innerText + '</th>'
  ]
]
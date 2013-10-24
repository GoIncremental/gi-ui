angular.module('gint.ui').directive 'giModal'
, [ () ->
  restrict: 'E'
  scope:
    title: '@'
    visible: '='
  transclude: true
  templateUrl: '/views/modal.html'
  controller: ['$scope', '$element', '$transclude'
  , ($scope, $element, $transclude) ->
    $transclude (clone) ->
      bodyBlock = $element.find('div.modal-body')
      transcludedBody = clone.filter('div.body')
      angular.forEach transcludedBody, (e) ->
        bodyBlock.append(angular.element(e))
      
      footerBlock = $element.find('div.modal-footer')
      transcludedFooter = clone.filter('div.footer')
      angular.forEach transcludedFooter, (e) ->
        footerBlock.append(angular.element(e))
       
      # Having done our DOM manipulation
      # setup watches and scope variables / methods
      $element.addClass 'modal fade'
      
      $scope.$watch 'visible', (value) ->
        showModal =  if value then 'show' else 'hide'
        $element.modal showModal

      $scope.hide = () ->
        $scope.visible = false
  ]
]
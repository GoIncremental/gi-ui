angular.module('gi.ui').directive 'giModal'
, [ () ->
  restrict: 'E'
  scope:
    title: '@'
    visible: '='
    cancelClass: '@'

  transclude: true
  templateUrl: '/views/modal.html'
  controller: ['$scope', '$element', '$transclude'
  , ($scope, $element, $transclude) ->
    $transclude (clone) ->
      headerBlock = $element.find('div.modal-header')
      transcludedHeader = clone.filter('div.header')
      angular.forEach transcludedHeader, (e) ->
        headerBlock.append(angular.element(e))
        
      bodyBlock = $element.find('div.modal-body')
      transcludedBody = clone.filter('div.body')
      angular.forEach transcludedBody, (e) ->
        bodyBlock.append(angular.element(e))
      
      footerBlock = $element.find('div.modal-footer')
      transcludedFooter = clone.filter('div.footer')
      angular.forEach transcludedFooter, (e) ->
        footerBlock.append(angular.element(e))
      
      if $scope.cancelClass?
        cancelButton = $element.find('div.modal-footer button')
        cancelButton.addClass $scope.cancelClass

      # Having done our DOM manipulation
      # setup watches and scope variables / methods
      $element.addClass 'modal fade'

      $element.modal { show: false, backdrop: 'static', keyboard: false}
      
      $scope.$watch 'visible', (value) ->
        showModal =  if value then 'show' else 'hide'
        $element.modal showModal

      $scope.hide = () ->
        $scope.visible = false
  ]
]
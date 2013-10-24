angular.module('app', ['ngResource', 'gint.ui']);

angular.module('app').controller('mainController', [
  '$scope', function($scope) {
    
    $scope.testText = 'This is the gint-ui test-suite';
    $scope.startUpload = function() {
      console.log('broadcast start-file-upload');
      $scope.$broadcast("start-file-upload");
    };
  }
]);

angular.module('app').config([
  '$locationProvider', function($locationProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');
  }
]);

angular.bootstrap(document, ['app']);
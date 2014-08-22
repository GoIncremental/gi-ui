angular.module('gi.ui').run ['$window', '$rootScope'
, ($window, $rootScope) ->
  $window.gi_ui_gplusApiLoaded = () ->
    $rootScope.$broadcast 'google-api-loaded'

  $window.gi_ui_gplusLoginCallback = (authResult) ->
    if authResult and authResult.access_token  
      $rootScope.$broadcast 'event:google-plus-login-success', authResult
    else
      $rootScope.$broadcast 'event:google-plus-login-failure', authResult
  ]

angular.module('gi.ui').directive 'giLoginWithGoogle'
, () ->
  ending = /\.apps\.googleusercontent\.com$/

  restrict: 'E'
  template: '<span></span>'
  replace: true
  link: ($scope, element, attrs) ->

    if not ending.test(attrs.clientid)
      attrs.clientid += '.apps.googleusercontent.com'

    options =
      callback: 'gi_ui_gplusLoginCallback'
      cookiepolicy: 'single_host_origin'
      requestvisibleactions: 'http://schemas.google.com/AddActivity'
      scope: 'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.email'
      width: 'wide'
      clientid: attrs['clientid']

    # Asynchronously load the G+ SDK.
    po = document.createElement('script')
    po.type = 'text/javascript'
    po.async = true
    po.src = 'https://apis.google.com/js/client:plusone.js?onload=gi_ui_gplusApiLoaded'
    s = document.getElementsByTagName('script')[0]
    s.parentNode.insertBefore(po, s)

    $scope.$on 'google-api-loaded', () ->
      gapi.signin.render element[0], options

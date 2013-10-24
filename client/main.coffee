require 
  shim:
    'directives/modal': deps: ['index']
    'directives/dataTable': deps: ['index']
    'directives/select2': deps: ['index']
    'directives/fileUpload': deps: ['index']
    'services/fileManager': deps: ['index']
    'views': deps: ['index']
  [
    'index'
    'directives/modal'
    'directives/dataTable'
    'directives/select2'
    'directives/fileUpload'
    'services/fileManager'
    'views'
  ], () ->
    return
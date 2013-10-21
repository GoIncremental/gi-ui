require 
  shim:
    'directives/modal': deps: ['index']
    'directives/dataTable': deps: ['index']
    'directives/select2': deps: ['index']
    'views': deps: ['index']
  [
    'index'
    'directives/modal'
    'directives/dataTable'
    'directives/select2'
    'views'
  ], () ->
    return
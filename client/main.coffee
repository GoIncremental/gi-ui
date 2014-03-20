require
  shim:
    'directives/modal': deps: ['index']
    'directives/dataTable': deps: ['index']
    'directives/dataTable2': deps: ['index']
    'directives/select2': deps: ['index']
    'directives/fileUpload': deps: ['index']
    'directives/minValidate': deps: ['index']
    'directives/maxValidate': deps: ['index']
    'directives/intValidate': deps: ['index']
    'directives/floatValidate': deps: ['index']
    'services/fileManager': deps: ['index']
    'filters/shorten': deps: ['index']
    'views': deps: ['index']
  [
    'index'
    'directives/modal'
    'directives/dataTable'
    'directives/select2'
    'directives/fileUpload'
    'directives/minValidate'
    'directives/maxValidate'
    'directives/intValidate'
    'directives/floatValidate'
    'filters/shorten'
    'services/fileManager'
    'views'
  ], () ->
    return
angular.module('gi.ui').factory 'giTextAngular'
, [ () ->
    options =  "[
      ['h1','h2','h3','h4'],
      ['bold','italics','underline','ul','ol'],
      ['justifyLeft','justifyCenter','justifyRight'], ['html', 'insertImage']
      ]"

    getOptions: () ->
      options
    setOptions: (opt) ->
      options = opt

      
]

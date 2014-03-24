angular.module('gi.ui').filter 'giShorten'
, [ () ->
  (str, len) ->
    result = ''
    if str?
      if str.length > len
        result = str.substring(0,len) + '...'
      else
        result = str
    result

]
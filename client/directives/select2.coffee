angular.module('gi.ui').directive 'giSelect2'
, [ '$timeout'
, ($timeout) ->
  restrict: 'E'
  templateUrl: '/views/select2.html'
  scope:
    selection: '='
    options: '='
  link: (scope, elm, attrs, controller) ->
    escapeMarkup = (markup) ->
      replace_map =
        '\\': '&#92;'
        '&': '&amp;'
        '<': '&lt;'
        '>': '&gt;'
        '"': '&quot;'
        "'": '&apos;'
        "/": '&#47;'

      String(markup).replace(/[&<>"'/\\]/g, (match) ->
        replace_map[match[0]]
      )
        
    markMatch = (text, term, markup, escapeMarkup) ->
      match = text.toUpperCase().indexOf(term.toUpperCase())
      tl = term.length

      if match < 0
        markup.push escapeMarkup(text)
        return

      markup.push escapeMarkup(text.substring(0, match))
      markup.push "<span class='select2-match'>"
      markup.push escapeMarkup(text.substring(match, match + tl))
      markup.push "</span>"
      markup.push escapeMarkup(text.substring(match + tl, text.length))
    
    if attrs.field?
      textField = attrs.field
    else
      textField = 'name'

    opts =
      multiple: attrs.tags?
      data:
        results: scope.options
        text: textField
      width: 'copy'
      formatResult: (result, container, query) ->
        markup = []
        markMatch result[textField], query.term, markup, escapeMarkup
        markup.join ""
      formatSelection: (data, container) ->
        data[textField]
      matcher: (term, text, option) ->
        option[textField].toUpperCase().indexOf(term.toUpperCase()) >= 0

    createSearchChoice = (term, data) ->
      matchedItems = $(data).filter () ->
        this[textField].localeCompare(term) is 0

      if matchedItems.length is 0
        result =
          id: term
        result[textField] = term
        result
      else
        {}

    if attrs.custom?
      opts.createSearchChoice = createSearchChoice

    attrs.$observe 'disabled', (value) ->
      if value
        elm.select2 'disable'
      else
        elm.select2 'enable'


    elm.bind "change", () ->
      if attrs.debug?
        console.log 'in elem change 1'
      scope.$apply () ->
        if attrs.debug?
          console.log 'in elem change 2'
        scope.selection = elm.select2('data')
    if attrs.debug?
      console.log 'select2 link'

    scope.$watch 'selection', (newVal, oldVal) ->
      if attrs.debug?
        console.log 'selection watch hit'
        console.log 'new:'
        console.log newVal
        console.log 'old:'
        console.log oldVal
      elm.select2 'data', newVal


    scope.$watch 'options', (newVal) ->
      if attrs.debug?
        console.log 'options watch hit'
        console.log 'new:'
        console.log newVal

      if newVal
        if scope.options
          opts.data.results = scope.options
          $timeout () ->
            elm.select2 opts

    $timeout () ->
      elm.select2 opts

]
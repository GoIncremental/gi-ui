angular.module('gi.ui').directive 'giOverflow'
, [ '$timeout', '$window'
, ($timeout, $window) ->
  restrict: 'A'
  scope:
    giOverflow: '='
  link: (scope, elem, attrs) ->
    isTruncated = false
    showingAll = false
    renderControls = true

    isOverflow = (e) ->
      e[0].scrollHeight > e[0].clientHeight

    buildEllipsis = () ->
      isTruncated = false
      if scope.giOverflow?
        if angular.isObject(scope.giOverflow)
          text = scope.giOverflow.text
          showingAll = scope.giOverflow.expanded
          renderControls = scope.giOverflow.renderControls
        else
          text = scope.giOverflow

        if showingAll
          elem.addClass('showall')
        else
          elem.removeClass('showall')

        if text?
          bindArray = text.split(" ")
          ellipsisSymbol = "..."
          if renderControls
            appendMore = '<div class="gi-over gi-over-more col-xs-6"><a href="#">Show more <span class="glyphicon glyphicon-arrow-down"></span></a></div>'
            appendLess = '<div class="gi-over gi-over-less col-xs-6"><a href="#">Show less <span class="glyphicon glyphicon-arrow-up"></span></a></div>'
          else
            appendMore = ''
            appendLess = ''

          elem.html('<div class="col-xs-12">' + text + '</div>')

          # If text has overflow
          if isOverflow(elem)
            needsFlow = true
            bindArrayStartingLength = bindArray.length
            initialMaxHeight = elem[0].clientHeight
            elem.html(scope.ngBind + ellipsisSymbol + appendMore)
            # Set complete text and remove one word at a time
            # until there is no overflow
            while (not isTruncated) and bindArray.length > 0
              bindArray.pop()
              elem.html('<div class="col-xs-12">' + bindArray.join(" ") + ellipsisSymbol + '</div>' + appendMore)
              if (elem[0].scrollHeight < initialMaxHeight) or
              (not isOverflow(elem))
                isTruncated = true
          else if showingAll
            elem.html('<div class="col-xs-12">' + text + '</div>' + appendLess)

          if renderControls
            elem.find('a').bind "click", (e) ->
              e.preventDefault()
              scope.$apply(toggle())

    attrs.lastWindowResizeTime = 0
    attrs.lastWindowResizeWidth = 0
    attrs.lastWindowResizeHeight = 0
    attrs.lastWindowTimeoutEvent = null

    scope.$watch 'giOverflow', (newVal) ->
      buildEllipsis()
    , true

    toggle = () ->
      if showingAll
        showingAll = false
      else
        showingAll = true

      buildEllipsis()

    doWork = () ->
      $timeout.cancel attrs.lastWindowTimeoutEvent

      attrs.lastWindowTimeoutEvent = $timeout () ->
        if attrs.lastWindowResizeWidth != $window.innerWidth or
        attrs.lastWindowResizeHeight != $window.innerHeight
          buildEllipsis();

        attrs.lastWindowResizeWidth = $window.innerWidth
        attrs.lastWindowResizeHeight = $window.innerHeight
      , 75
    angular.element($window).bind 'resize', () ->
      doWork()

    #Make sure we always fire at least once
    doWork()

]

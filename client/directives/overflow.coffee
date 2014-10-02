angular.module('gi.ui').directive 'giOverflow'
, [ '$timeout', '$window'
, ($timeout, $window) ->
  restrict: 'A'
  scope:
    giOverflow: '='
  link: (scope, elem, attrs) ->
    isTruncated = false
    showingAll = false

    isOverflow = (e) ->
      e[0].scrollHeight > e[0].clientHeight

    buildEllipsis = () ->
      isTruncated = false
      if scope.giOverflow?
        bindArray = scope.giOverflow.split(" ")
        ellipsisSymbol = "..."
        appendMore = '<br/><br/><p class="gi-over gi-over-more"><span><a href="#">Show more <span class="glyphicon glyphicon-arrow-down"></span></a></span></p>'
        appendLess = '<br/><br/><p class="gi-over gi-over-less"><span><a href="#">Show less <span class="glyphicon glyphicon-arrow-up"></a></span></p>'

        elem.html(scope.giOverflow)

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
            elem.html(bindArray.join(" ") + ellipsisSymbol + appendMore)
            if (elem[0].scrollHeight < initialMaxHeight) or
            (not isOverflow(elem))
              isTruncated = true
        else if showingAll
          elem.html(scope.giOverflow + appendLess)


        elem.find('span').bind "click", (e) ->
          scope.$apply(toggle())

    attrs.lastWindowResizeTime = 0
    attrs.lastWindowResizeWidth = 0
    attrs.lastWindowResizeHeight = 0
    attrs.lastWindowTimeoutEvent = null

    scope.$watch 'overflow', () ->
      buildEllipsis()

    toggle = () ->
      if showingAll
        showingAll = false
        elem.removeClass('showall')
      else
        showingAll = true
        elem.addClass('showall')

      buildEllipsis()


    angular.element($window).bind 'resize', () ->
      $timeout.cancel attrs.lastWindowTimeoutEvent

      attrs.lastWindowTimeoutEvent = $timeout () ->
        if attrs.lastWindowResizeWidth != $window.innerWidth or
        attrs.lastWindowResizeHeight != $window.innerHeight
          buildEllipsis();

        attrs.lastWindowResizeWidth = $window.innerWidth
        attrs.lastWindowResizeHeight = $window.innerHeight
      , 75
]

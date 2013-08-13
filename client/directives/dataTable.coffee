angular.module('app').directive 'datatable'
, [ '$filter', '$timeout'
, ($filter, $timeout) ->
  restrict: 'E'
  templateUrl: '/views/dataTable.html'
  transclude: true
  scope:
    items: '='
    selectedItems: '='
    options: '='
    search: '&'
    sort: '&'
    destroy: '&'
    view: '&'
    altView: '&'
    edit: '&'
  compile: ($elem, $attrs, $transcludeFn) ->
    #this is the place to do DOM maniupulation
    $transcludeFn $elem, (clone) ->
      headerBlock = $elem.find('table thead tr')
      header = clone.filter('div.header')
      angular.forEach header.children(), (e) ->
        headerBlock.append '<th ng-click="sort(\'' + angular.element(e).text() +
        '\')">' + angular.element(e).text() + '</th>'

      bodyBlock = $elem.find('table tbody')
      bodyBlock.append '<tr ng-click="selectRow(item)" ng-repeat="item in pagedItems[currentPage]" ' +
      'ng-class="{info: item.selected}"><td ng-show="options.selectAll"><input type="checkbox" ' +
      'ng-model="item.selected" ng-click="selectAllClick($event, item)"></td></tr>'

      body = clone.filter('div.body')

      angular.forEach body.children(), (e) ->
        elem = angular.element(e)

        if elem.hasClass('property-link')
          property = elem.attr('gi-property')
          html = angular.element(e.innerHTML).append '{{item.' + property + '}}'
          bodyBlock.children().append '<td>' + html[0].outerHTML + '</td>'
        else if elem.hasClass('property-mailto')
          property = elem.attr('gi-property')
          bodyBlock.children().append '<td><a ng-href="mailto:{{item.' +
          property + '}}"">{{item.' + property + '}}</a></td>'
        else if elem.hasClass('property')
          bodyBlock.children().append '<td>{{item.' + elem.text() + '}}</td>'
        else if elem.hasClass('literal')
          bodyBlock.children().append '<td>' + e.innerHTML + '</td>'
        else if elem.hasClass('expression')
          bodyBlock.children().append '<td>{{' + elem.text() + '}}</td>'
        else if elem.hasClass('filter')
          bodyBlock.children().append '<td>{{ item | ' + elem.text() + '}}</td>'

    #the compile function should return the link function
    #so we'll go ahead and define it here as the last step of compile
    ($scope) ->

      $scope.filteredItems = []
      $scope.groupedItems = []
      $scope.itemsPerPage = 20
      $scope.pagedItems = []
      $scope.currentPage = 0
      $scope.selectAll = "All"

      $scope.$watch 'items', () ->
        $scope.refresh()

      $scope.$watch 'items.length', () ->
        $scope.refresh()

      $scope.$watch 'sortProperty', () ->
        $scope.refresh()

      $scope.options.refreshRequired = false
      $scope.$watch 'options.refreshRequired', (newVal) ->
        if newVal
          $scope.refresh()
        else
          $scope.options.refreshRequired = false

      aPromise = null

      $scope.$watch 'query',  () ->
        if aPromise
          $timeout.cancel aPromise

        aPromise = $timeout $scope.refresh, 500
        aPromise

      $scope.toggleSelectAll = ->
        if $scope.selectAll is "All"
          angular.forEach $scope.items, (item) ->
            item.selected = true
          $scope.selectedItems = $scope.items
          $scope.selectAll = "None"
        else
          angular.forEach $scope.items, (item) ->
            item.selected = false
          $scope.selectedItems = []
          $scope.selectAll = "All"

      selectionChanged = (item) ->
        unless $scope.options.multi
          angular.forEach $scope.items, (other) ->
            if item._id isnt other._id
              other.selected = false
        $scope.selectedItems = $filter('filter')($scope.items, (item) ->
          item.selected)        

      $scope.selectRow = (item) ->
        item.selected = not item.selected
        selectionChanged item

      $scope.selectAllClick = (e, item) ->
        e.stopPropagation()
        selectionChanged item

      $scope.refresh = ->
        #allow the parent controller the opportunity to pre-filter
        if $scope.options.customSearch
          $scope.filteredItems = $scope.search {query: $scope.query}
        else
          $scope.filteredItems = $filter('filter')($scope.items , (item) ->
            #we're not searching for anything - so return true
            if not $scope.query
              return true
            
            found = false
            angular.forEach $scope.options.searchProperties, (property) ->
              if not found
                found = true unless $filter('lowercase')(
                  item[property].toString()
                )
                .indexOf($filter('lowercase')($scope.query)) is -1
              found
            angular.forEach $scope.options.searchFilters, (property) ->
              if not found
                found = true unless $filter('lowercase')(
                  $filter(property)(item)
                )
                .indexOf($filter('lowercase')($scope.query)) is -1
              found
            found
          )
        #sort the items before they go for pagination
        if $scope.options.sortProperty
          if $scope.options.sortDirection is "asc"
            sortDir = false
          else
            sortDir = true

          $scope.filteredItems = $filter('orderBy')($scope.filteredItems
          , (item) ->
            item[$scope.options.sortProperty]
          , sortDir )

        if $scope.options.customSort
          $scope.filteredItems = $scope.sort {items: $scope.filteredItems}

        $scope.currentPage = 0
        # now group by pages
        $scope.groupToPages()
        $scope.options.refreshRequired = false
        return

      # calculate page in place
      $scope.groupToPages = ->
        if $scope.filteredItems?
          $scope.pagedItems = []
          for thing, i in $scope.filteredItems
            if (i % $scope.itemsPerPage == 0)
              $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)] =
                [ $scope.filteredItems[i] ]
            else
              $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)]
              .push($scope.filteredItems[i])

      $scope.range = (currentPage) ->
        max = $scope.pagedItems.length - 1
        if max < 1
          return []

        end =  if max > currentPage + 1 then currentPage + 2
        start = currentPage - 2

        if currentPage < 3
          start = 0
          end = 4 if max > 3

        if currentPage > max - 3
          end = max
          start = (max - 4) if max > 3

        result = []
        for num in [start..end]
          result.push num
        result

      $scope.prevPage = ->
        if $scope.currentPage > 0
          $scope.currentPage = $scope.currentPage - 1

      $scope.nextPage = ->
        if $scope.currentPage < $scope.pagedItems.length - 1
          $scope.currentPage = $scope.currentPage + 1

      $scope.setPage = (n) ->
        $scope.currentPage = n

      $scope.displayCountMessage = () ->
        if $scope.currentPage? and $scope.items? and $scope.pagedItems?
          start = $scope.currentPage * $scope.itemsPerPage + 1
          end = $scope.currentPage * $scope.itemsPerPage +
          $scope.pagedItems[$scope.currentPage]?.length
          total = $scope.items.length
          "Showing " + start + " to " +  end + " of " + total
        else
         ""

      $scope.numberOfColumns = () ->
        if $scope.options.columns?
          result = if $scope.options.selectAll then 1 else 0
          result + $scope.options.columns
        else
          1

      $scope.sort = (name) ->
        console.log 'sort clicked on : ' + name
      $scope.refresh()
]
angular.module('app').directive 'datatable'
, [ '$filter', ($filter) ->
  restrict: 'E'
  templateUrl: '/views/gint-ui/dataTable.html'
  transclude: true
  scope:
    items: '='
    selectedItems: '='
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
        headerBlock.append '<th>' + e.innerText + '</th>'

      bodyBlock = $elem.find('table tbody')
      bodyBlock.append '<tr ng-repeat="item in pagedItems[currentPage]" ng-class="{row_selected: item.selected}"><td><input type="checkbox" ng-model="item.selected" ng-click="select()"></td></tr>'

      body = clone.filter('div.body')

      angular.forEach body.children(), (e) ->
        elem = angular.element(e)

        if elem.hasClass('property-link')
          property = elem.attr('gi-property')
          html = angular.element(e.innerHTML).append '{{item.' + property + '}}'
          bodyBlock.children().append '<td>' + html[0].outerHTML + '</td>'
        else if elem.hasClass('property-mailto')
          property = elem.attr('gi-property')
          bodyBlock.children().append '<td><a ng-href="mailto:{{item.' + property + '}}"">{{item.' + property + '}}</a></td>'
        else if elem.hasClass('property')
          bodyBlock.children().append '<td>{{item.' + e.innerText + '}}</td>'
        else if elem.hasClass('literal')
          bodyBlock.children().append '<td>' + e.innerHTML + '</td>' 
        else if elem.hasClass('expression')
          bodyBlock.children().append '<td>{{' + e.innerText + '}}</td>'

    #the compile function should return the link function
    #so we'll go ahead and define it here as the last step of compile  
    ($scope) ->

      $scope.$watch 'items.length', () ->
        $scope.search()

      $scope.filteredItems = []
      $scope.groupedItems = []
      $scope.itemsPerPage = 20
      $scope.pagedItems = []
      $scope.currentPage = 0

      $scope.things = $scope.items
      
      $scope.selectAll = "All"   

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

      $scope.select = ->
        $scope.selectedItems = $filter('filter')($scope.items, (item) ->
          item.selected)

      $scope.search = ->
        $scope.filteredItems = $filter('filter')($scope.items, (item) ->
          #we're not searching for anything - so return true
          if not $scope.query
            return true

          #check if we're searching for a day string or if the query is in the title
          if $filter('lowercase')(item.name)
          .indexOf($filter('lowercase')($scope.query)) != -1
            return true

          return false
        )

        #sort the items before they go for pagination
        $scope.filteredItems = $filter('orderBy')($scope.filteredItems
        , (item) ->
          item.name
        , false )

        $scope.currentPage = 0
        # now group by pages
        $scope.groupToPages()

      # calculate page in place
      $scope.groupToPages = ->
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

        end = currentPage + 2 unless max < currentPage + 2
        start = currentPage - 2
        if currentPage < 3
          start = 0
          end = 4 unless max < 4

        if currentPage > max - 3
          end = max
          start = max - 4 unless max < 4
         
        [start..end]

      $scope.prevPage = ->
        if $scope.currentPage > 0
          $scope.currentPage = $scope.currentPage - 1

      $scope.nextPage = ->
        if $scope.currentPage < $scope.pagedItems.length - 1
          $scope.currentPage = $scope.currentPage + 1

      $scope.setPage = (n) ->
        $scope.currentPage = n

      $scope.search()
]
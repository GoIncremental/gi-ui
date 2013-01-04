angular.module('app').directive 'datatable'
, [ '$filter', ($filter) ->
  restrict: 'E'
  templateUrl: '/views/gint-ui/dataTable.html'
  transclude: true
  scope:
    items: '='
  link: ($scope, element, attrs) ->
    $scope.$watch 'items.length', (val, old_val) ->
      $scope.search()

    $scope.filteredItems = []
    $scope.groupedItems = []
    $scope.itemsPerPage = 20
    $scope.pagedItems = []
    $scope.currentPage = 0

    $scope.things = $scope.items

    $scope.search = ->
      console.log ' datatable scope search'
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

    $scope.range = (start, end) ->
      ret = []
      if not end
        end = start
        start = 0

      for num in [start..end]
        ret.push num
      ret

    $scope.prevPage = ->
      if $scope.currentPage > 0
        $scope.currentPage = $scope.currentPage - 1

    $scope.nextPage = ->
      if $scope.currentPage < $scope.pagedItems.length - 1
        $scope.currentPage = $scope.currentPage + 1

    $scope.setPage = (n) ->
      $scope.currentPage = n

    $scope.search()
  controller: ['$scope', '$element', '$transclude'
  , ($scope, $element, $transclude) ->
    console.log 'datatable scope id = ' + $scope.$id
    console.log 'datatable parent scope id = ' + $scope.$parent.$id
    $transclude (clone) ->
      console.log 'transclude scope id = ' + clone.scope().$id
      console.log 'transclude parent scope id= ' + clone.scope().$parent.$id  
      headerBlock = $element.find('table thead')
      header = clone.filter('div.header')
      angular.forEach header.children(), (e) ->
        headerBlock.append '<th>' + e.innerText + '</th>'
  ]
]
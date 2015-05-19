gi-ui
-------------

Reusable Angular UI components (mostly as directives), that integrate well with the GoIncremental  stack - https://github.com/goincremental/gi

### Release Notes
v1.0.5
- Added styling classes on gi-overflow.  All divs now have gi-overflow and the body additionally has gi-overflow-body

v1.0.4
- Added support for an options object to be send to giOverflow.

  - text: String. containing the text to be rendered by the contrl
  - showingAll: Bool. to allow client control of whether the directive should be in showing all or truncating mode
  (default = false)
  - renderControls: Bool. Whether the directive should be responsible for rendering the Show More / Show Less buttons (default = true)

In your controller (defaults shown):
````
$scope.options =
  text: ""
  showingAll: false
  renderControls: true
````

In your view:
````
<div giOverflow="options">

````
v1.0.3
- Fixed issue with giOverflow directive where the text would not render
until the first resize event.

v1.0.2
- Upgraded to latest textAngular copmonent

v1.0.1
- Made anything needed for sass complication full bower dependencies

v1.0.0
- BREAKING CHANGES:
  - Change: Switched from grunt to gulp.  Build using `gulp` instead now
  - Deprecated: Modal - use http://angular-ui.github.io/bootstrap/ instead
  - Deprecated: Select2 - use https://github.com/angular-ui/ui-select instead
  - Jquery no longer required - There is no dependency on jquery any more as a result of the above two deprecations.
  - Output folder moved from /bin to /dist
  - Views are now all named with gi.ui.*.html to avoid clashes in importing projects
  - to use gi-ui you must previously have loaded gi-util.  The recommended approach is to just to use https://github.com/goincremental/gi as a single import into customer projects


- New Features / improvements
  - Country flags are bundled as part of the css
  - angular-ui/ui-select is bundled as part of the js and css
  - textAngular is bundled as part of the js and css

  - We now package all the css in dist/gi-ui.css
  - We now package all the .js in dist/gi-ui.js and this file includes all the dependencies
  - If you need to override the css, the scss files are all in /scss
  - All font dependencies are available in dist/fonts
  - RequireJS dependency removed
  - There is no need for the excessively annoying client/main.coffee shim.  All dependency ordering is handled in the gulpfile.coffee

v0.4.0
- Added support for deep property in data table row sorting

v0.3.12
- Fixes issue with multiple clickable buttons in datatable

v0.3.11
- Added DP option for summed columns and added ability to specify class styles

v0.3.10
- Optionally allow returning of full object from button click event in dataTable

v0.3.9
- Added deep watch option to trigger refresh

v0.3.8
- Added grouping functionality

v0.3.7
- Fixed issue where datatable would not refresh if new list had same length

v0.3.6
- Prevented default event on overflow directive click (show more / less)

v0.3.5
- Fixed sorting on columns with filters.

v0.3.4
- Added simple column sorting

v0.3.3
- Added conditional formatting facility

v0.3.2
- Made default button size btn-xs

v0.2.8
- Added giOverflow directive

v0.2.7
- Optionally specify event name for row selection on dataTable directive
- Google Plus Login directive

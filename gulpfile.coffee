del = require 'del'
gulp = require 'gulp'
gutil = require 'gulp-util'
concat = require 'gulp-concat'
coffeelint = require 'gulp-coffeelint'
coffeeCompiler = require 'gulp-coffee'
templateCache = require 'gulp-angular-templatecache'
rename = require 'gulp-rename'
sass = require 'gulp-sass'
runSequence = require 'run-sequence'
streamqueue = require 'streamqueue'

buildDir = 'dist'
moduleName = 'gi.ui'
modulePath = 'gi-ui'

coffee = () ->
  gulp.src(['client/index.coffee', 'client/**/*.coffee'])
  .pipe(coffeelint())
  .pipe(coffeelint.reporter())
  .pipe(coffeeCompiler {bare: true}).on('error', gutil.log)

templates = () ->
  gulp.src('client/views/*.html')
  .pipe(templateCache({module: moduleName}))

libs = () ->
  gulp.src([
    'angular-ui-select/dist/select.js'
    'angular-bootstrap/ui-bootstrap-tpls.js'
    'ng-file-upload/angular-file-upload-shim.js'
    'ng-file-upload/angular-file-upload.js'
    'ng-sortable/dist/ng-sortable.js'
    'rangy/rangy-core.js'
    'rangy/rangy-selectionsaverestore.js'
    'textAngular/src/textAngular.js'
    'textAngular/src/textAngular-sanitize.js'
    'textAngular/src/textAngularSetup.js'
    'ngprogress/build/ngProgress.js'
    'spin.js/spin.js'
    'angular-spinner/angular-spinner.js'
  ], {cwd:'bower_components/'})

gulp.task 'clean', (cb) ->
  del buildDir, cb

gulp.task 'styles', (cb) ->
  gulp.src('client/scss/*.scss')
  .pipe(sass())
  .pipe(gulp.dest(buildDir))
  cb()

gulp.task 'fonts', () ->
  gulp.src([
    'bower_components/font-awesome/fonts/*'
    'bower_components/bootstrap-sass/assets/fonts/bootstrap/*'
  ])
  .pipe(gulp.dest(buildDir + '/fonts'))

gulp.task 'build', ['styles', 'fonts'], () ->
  streamqueue({objectMode: true}, libs(), coffee(), templates())
  .pipe(concat(modulePath + '.js'))
  .pipe(gulp.dest(buildDir))

gulp.task 'moveCSS', () ->
  gulp.src([
    'bower_components/angular-ui-select/dist/select.css'
    'bower_components/textAngular/src/textAngular.css'
    'bower_components/ng-sortable/dist/ng-sortable.style.css'
  ])
  .pipe(rename({prefix: '_', extname: '.scss'}))
  .pipe(gulp.dest('client/scss'))

gulp.task 'default', (cb) ->
  runSequence 'clean', 'moveCSS', 'build', cb

gulp.task 'watch', ['build'], () ->
  gulp.watch(['client/views/*.html'
              'client/**/*.coffee']
             ['build'])

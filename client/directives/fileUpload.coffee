angular.module('gi.ui').directive 'giFileupload'
, [ '$q', 'giFileManager'
, ($q, FileManager) ->
  restrict: 'E'
  templateUrl: '/views/fileUpload.html'
  scope: {
    files: '='
    parent: '='
  }
  link: (scope, elem, attrs) ->
    scope.addText = "Add an image"
    scope.pendingFiles = []
    scope.uploadedFiles = []
    scope.erroredFiles = []

    #I would like to get rid of the form-upload ui altogether in the future
    #It's nearly there at the moment, just need to sort out the progress bar
    downloadTemplate = (o) ->
      return
    
    uploadTemplate = (o) ->
      scope.$apply () ->
        angular.forEach o.files, (file) ->
          if file.error
            fu = locale.fileupload
            file.errorMessage = fu.errors[file.error] or file.error
            scope.erroredFiles.push file
            return
          else
            unless file.order?
              file.order = 0
            unless file.exclude
              file.exclude = true
            unless file.primary
              file.primary = true
            console.log file
            file.preview = previews[file.name]
            scope.pendingFiles.push file
            return
  
    scope.formatFileSize = (bytes) ->
      if not typeof(bytes) is 'number'
        'N/A'
      else if bytes >= 1073741824
        (bytes / 1073741824).toFixed(2) + ' GB'
      else if bytes >= 1048576
        (bytes / 1048576).toFixed(2) + ' MB'
      else
        (bytes / 1024).toFixed(2) + ' KB'


    getResizedImage = (data, options) ->
      deferred = $q.defer()
      
      options.canvas = true

      img = data.canvas || data.img

      if img
        newImg = loadImage.scale img, options

      if not newImg?
        console.log 'there is no resized image to get'
        deferred.resolve()

      else
        that = @
        file = data.files[data.index]
        name = file.name
    
        callback = (blob) ->
          if not blob.name?
            if file.type is blob.type
              blob.name = options.prefix + file.name
            else if file.name?
              blob.name = options.prefix
              + file.name.replace /\..+$/, '.' + blob.type.substr(6)

          deferred.resolve blob
      
        # Use canvas.mozGetAsFile directly, to retain the filename, as
        # Gecko doesn't support the filename option for FormData.append:
        if newImg.mozGetAsFile
          if /^image\/(jpeg|png)$/.test(file.type)
            param = options.prefix + name
          else if name

            param = options.prefix + name.replace(/\..+$/, '') + '.png'
          else
            param = options.prefix + 'blob.png'

          callback newImg.mozGetAsFile(param, file.type)

        else if newImg.toBlob
          newImg.toBlob callback, file.type

        else
          console.log 'THIS SHOULD NOT HAPPEN'
          deferred.resolve()

      deferred.promise


    extend = (object, properties) ->
      for key, val of properties
        object[key] = val
      object

    optionsObj =
      uploadTemplateId: null
      downloadTemplateId: null
      uploadTemplate: uploadTemplate
      downloadTemplate: downloadTemplate
      disableImagePreview: true
      autoUpload: false
      previewMaxWidth: 100
      previewMaxHeight: 100
      previewCrop: true
      dropZone: elem
      dataType: 'xml'

    elem.fileupload(optionsObj)

    resized = {}
    previews = {}

    elem.bind 'fileuploaddone', (e, data) ->
      scope.$apply () ->
        name = data.files[0].name
        if name.indexOf('thumb') is 0
          console.log 'resolving: ' + name
          data.files[0].promise.resolve()
        else
          scope.removeFromQueue data.files[0]
          console.log data
          FileManager.save(data.files[0], scope.parent
          , data.formData).then (fileInfo) ->
            console.log 'resolving: ' + name
            data.files[0].promise.resolve()
            if data.files[0].error
              fu = locale.fileupload
              file.errorMessage = fu.errors[file.error] or file.error
              scope.erroredFiles.push file
            else
              scope.uploadedFiles.push fileInfo

    elem.bind 'fileuploadprocessdone', (e, data) ->
      scope.$apply () ->
        name = data.files[0].name
        data.files[0].s3alternates = []
        resized[name] = []
        getResizedImage(data, {maxWidth: 940, maxHeight: 530
        , prefix: 'thumb/940/'}).then (blob) ->
          resized[name].push blob
          data.files[0].s3alternates.push 'thumb/940/'
          getResizedImage(data, {maxWidth: 940, maxHeight: 300
          , prefix: 'thumb/300h/'}).then (blob) ->
            resized[name].push blob
            data.files[0].s3alternates.push 'thumb/300h/'
            getResizedImage(data, {maxWidth: 350, maxHeight: 200
            , prefix: 'thumb/350/'}).then (blob) ->
              resized[name].push blob
              data.files[0].s3alternates.push 'thumb/350/'
              getResizedImage(data, {maxWidth: 150, maxHeight: 150
              , prefix: 'thumb/'}).then (blob) ->
                resized[name].push blob
                data.files[0].s3alternates.push 'thumb/'
                previewImg = loadImage.scale data.img, {maxWidth: 80
                , maxHeight: 80, canvas: true}
                previews[name] = previewImg

    scope.removeFromQueue = (file) ->
      resultIndex = -1
      angular.forEach scope.pendingFiles, (f, index) ->
        if f.name is file.name
          resultIndex = index

      unless resultIndex is -1
        scope.pendingFiles.splice resultIndex, 1
        previews[file.name] = null
        resized[file.name] = null
    
    scope.removeFromS3 = (file, $event) ->
      $event.preventDefault() #stop this event submitting the parent form
      console.log 'remove from S3 called for:' + file.name
      FileManager.destroy(file._id).then () ->
        resultIndex = -1
        angular.forEach scope.uploadedFiles, (f, index) ->
          if f._id is file._id
            resultIndex = index
            
        unless resultIndex is -1
          scope.uploadedFiles.splice resultIndex, 1

    uploadToS3 = (file) ->
      console.log 'in send test'
      console.log file
      deferred = $q.defer()
      FileManager.getUploadToken(file, scope.parent).then (token) ->

        elem.fileupload('option', 'url', token.url)
        formData =
          key: token.path  + '/' + file.name
          AWSAccesskeyId: token.accessKey
          acl: "public-read"
          policy: token.policy
          signature: token.signature
          success_action_status: "201"
          "Content-Type": file.type
          primary: file.primary
          exclude: file.exclude
          order: file.order
        elem.fileupload('send', {formData: formData, files: [file]})

        promises = []
        promises.push file.promise
        mainFileDeferred = $q.defer()
        file.promise = mainFileDeferred
        promises.push mainFileDeferred.promise

        angular.forEach resized[file.name], (f) ->
          resizeDeferred = $q.defer()
          f.promise = resizeDeferred
          promises.push resizeDeferred.promise

          formData.key = token.path + "/" + f.name
          elem.fileupload('send', {files: [f], formData: formData})

        resized[file.name] = null

        $q.all(promises).then () ->
          console.log 'all promises resolved for ' + file.name
          #When all the resized and the original file have been uploaded
          #then the done handler will have rexsolved all the promises
          deferred.resolve()
      
      deferred.promise


    scope.$watch 'parent', (newVal, oldVal) ->
      if newVal != oldVal
        FileManager.forParent(scope.parent).then (files) ->
          scope.uploadedFiles = []
          resized = {}
          angular.forEach files, (file) ->
            scope.uploadedFiles.push file


    scope.$on 'start-file-upload', (e, parent, promise) ->
      promises = []
      
      angular.forEach scope.pendingFiles, (file) ->
        promises.push uploadToS3(file)

      console.log 'waiting on ' + promises.length
      + ' files to be uploaded to S3'

      $q.all(promises).then () ->
        console.log 'all files uploaded to S3'
        promise.resolve()

    return
]
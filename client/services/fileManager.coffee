angular.module('gi.ui').factory 'giFileManager'
, ['$q', '$http', 'giCrud'
, ($q, $http, Crud) ->
  
  crudService = Crud.factory 'files', true
  
  getPath = (parent) ->
    deferred = $q.defer()
    getCDN().then (cdn) ->
      path = cdn + '/public/images/' +
      parent.resourceType + '/'+ parent.key + '/'
      
      deferred.resolve path
    deferred.promise

  forParent = (parent) ->
    deferred = $q.defer()
    getPath(parent).then (path) ->
      crudService.query({'parentId': parent.key}).then (files) ->
        angular.forEach files, (file) ->
          file.url = path + file.name
          file.thumb = path + 'thumb/' + file.name
          file.del = "/FileManager/" + parent.resourceType + '/' + parent.key

        deferred.resolve files
    deferred.promise

  getCDN = () ->
    deferred = $q.defer()

    $http.get('/api/s3token').success( (data, status, headers, config ) ->
      deferred.resolve data.cdn
    ).error( (data, status, headers, config) ->
      console.log 'something went wrong getting CDN'
      deferred.resolve()
    )
    
    deferred.promise
  
  save = (file, parent, formData) ->
    deferred = $q.defer()
    console.log 'about to save file with alternates'
    console.log file.s3alternates
    getPath(parent).then (path) ->
      console.log 'bob1'
      fileInfo =
        name: file.name
        parentId: parent.key
        parentType: parent.resourceType
        size: file.size
        primary: file.primary
        order: file.order
        exclude: file.exclude
        s3alternates: file.s3alternates

      crudService.save(fileInfo).then (result) ->
        console.log 'bob2'
        console.log 'file is saved in mongo'
        result.thumb = path + 'thumb/' + file.name
        deferred.resolve result

    deferred.promise
  
  getToken = (file, parent, type) ->

    deferred = $q.defer()
   
    data =
      filename: file.name
      contentType: file.type
      parent: parent

    $http.post('/api/s3token', data).success(
      (data, status, headers, config ) ->
        deferred.resolve data
    ).error( (data, status, headers, config) ->
      console.log 'something went wrong getting token'
      deferred.resolve()
    )
    
    deferred.promise

  all: crudService.all
  forParent: forParent
  getUploadToken: getToken
  save: save
  destroy: crudService.destroy
]
express = require 'express'
path = require 'path'
dir =  path.normalize __dirname + "/../client"

app = express()
crypto = require 'crypto'
moment = require 'moment'

signature = (awsSecret, policy) ->
  crypto.createHmac("sha1", awsSecret).update(policy).digest("base64")

policy = (bucket, path, contentType) ->
  s3Policy =
    expiration: moment.utc().add('minutes', 30)
    .format('YYYY-MM-DDTHH:mm:ss\\Z')
    conditions: [
      { bucket: bucket }
      { acl: "public-read" }
      { success_action_status: '201' }
      ["starts-with", "$key", path]
      ["starts-with", "$Content-Type", contentType]
      ["starts-with", "$order", ""]
      ["starts-with", "$primary", ""]
      ["starts-with", "$exclude", ""]
    ]
  new Buffer(JSON.stringify(s3Policy)).toString("base64")

app.configure ->
  app.use express.cookieParser()
  app.use express.bodyParser() 
  app.use express.static dir
  app.use '/bower_modules', express.static path.normalize(__dirname + '../../../bower_modules')
  app.use '/bin', express.static path.normalize(__dirname + '../../../bin')
  app.use express.errorHandler({ dumpExceptions: true, showStack: true })

  awsAccessKey = process.ENV.awsAccessKey or '[YOUR_AWS_ACCESS_KEY]'
  awsSecretKey = process.ENV.awsSecretKey or '[YOUR_AWS_SECRET_KEY]'
  awsBucketName = process.ENV.awsBucketName or '[YOUR_AWS_BUCKET_NAME]'

  app.post '/api/s3Credentials', (req, res) ->
    awsAccessKey = req.body.awsAccessKey
    awsSecretKey = req.body.awsSecretKey
    awsBucketName = req.body.awsBucketName

  app.post '/api/s3token', (req, res) ->
    path = req.body.pathPrefix + '/' + req.body.key

    result =
      signature: policy(awsBucketName, path, req.body.contentType)
      policy:  signature(awsSecretKey, p)
      accessKey: awsAccessKey
      url: 'https://' + awsBucket.value + '.s3.amazonaws.com'
      path: path

    res.json 200, result

  else
    callback "No parent specified", null

  app.get '*', (req, res) ->
    res.sendfile "#{dir}/index.html"

exports = module.exports = app
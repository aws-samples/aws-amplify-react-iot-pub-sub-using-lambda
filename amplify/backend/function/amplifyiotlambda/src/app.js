/* Amplify Params - DO NOT EDIT
	ENV
	REGION
Amplify Params - DO NOT EDIT */
var express = require('express')
var bodyParser = require('body-parser')
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')

// declare a new express app
var app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});

var aws = require('aws-sdk')

/**********************
 * Example get method *
 **********************/

app.get('/item', function(req, res) {
  // Add your code here
  res.json({success: 'get call succeed!', url: req.url});
});

app.get('/item/*', function(req, res) {
  // Add your code here
  res.json({success: 'get call succeed!', url: req.url});
});

/****************************
* Example post method *
****************************/

app.post('/amplifyiotlambdaapi', function(req, res) {

  const iot = new aws.Iot({region: 'us-east-1', apiVersion: '2015-05-28', endpoint: 'https://iot.us-east-1.amazonaws.com'});

  const policyName = "amplifyiotlambdaapipolicy";
  const id = req.apiGateway.event.requestContext.identity.cognitoIdentityId;

  console.log("Create policy and attach with cognito identity id: " + id);
  var params = {policyName: policyName};
  iot.getPolicy(params , function(err, data) {
        if (err) {
             var policy = {"Version": "2012-10-17", "Statement": [{"Effect": "Allow", "Action": ["*"],"Resource": ["*"]}]};
             var policyDoc = JSON.stringify(policy);

             console.log("Creating policy: " + policyName + " with doc: " + policyDoc);

             var params = {
                     policyName: policyName,
                     policyDocument: policyDoc
                     };

             iot.createPolicy(params , function(err, data) {
                 if (err) {
                      //console.error(err);
                      if (err.code !== 'ResourceAlreadyExistsException') {
                         console.log(err);
                         res.json({error: err, url: req.url, body: req.body});
                      }
                 }
                 else {
                    console.log("CreatePolicy response=" + data);
                    var params = {policyName: policyName, target: id};

                    console.log("Attach IoT Policy: " + policyName + " with cognito identity id: " + id);
                    iot.attachPolicy(params, function(err, data) {
                         if (err) {
                               //console.error(err);
                               if (err.code !== 'ResourceAlreadyExistsException') {
                                  console.log(err);
                                  res.json({error: err, url: req.url, body: req.body});
                               }
                          }
                         else  {
                            console.log(data);
                            res.json({success: 'Create and attach policy call succeed!', url: req.url, body: req.body});
                         }
                     });
                 }
             });
        }
        else {
           console.log("Policy " + policyName + " already exists..");

           var params = {policyName: policyName, target: id};

           console.log("Attach IoT Policy: " + policyName + " with cognito identity id: " + id);
           iot.attachPolicy(params, function(err, data) {
                if (err) {
                      //console.error(err);
                      if (err.code !== 'ResourceAlreadyExistsException') {
                         console.log(err);
                         res.json({error: err, url: req.url, body: req.body});
                      }
                 }
                else  {
                   console.log(data);
                   res.json({success: 'Create and attach policy call succeed!', url: req.url, body: req.body});
                }
            });
        }
    });
});

app.post('/item', function(req, res) {
  // Add your code here
  res.json({success: 'post call succeed!', url: req.url, body: req.body})
});

app.post('/item/*', function(req, res) {
  // Add your code here
  res.json({success: 'post call succeed!', url: req.url, body: req.body})
});

/****************************
* Example put method *
****************************/

app.put('/item', function(req, res) {
  // Add your code here
  res.json({success: 'put call succeed!', url: req.url, body: req.body})
});

app.put('/item/*', function(req, res) {
  // Add your code here
  res.json({success: 'put call succeed!', url: req.url, body: req.body})
});

/****************************
* Example delete method *
****************************/

app.delete('/item', function(req, res) {
  // Add your code here
  res.json({success: 'delete call succeed!', url: req.url});
});

app.delete('/item/*', function(req, res) {
  // Add your code here
  res.json({success: 'delete call succeed!', url: req.url});
});

app.listen(3000, function() {
    console.log("App started")
});


module.exports = app

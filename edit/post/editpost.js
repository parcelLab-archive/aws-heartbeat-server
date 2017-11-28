var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB();


exports.handler = function (event, context, callback) {

  if (event.queryStringParameters !== null && event.queryStringParameters !== undefined && event.body !== null && event.body !== undefined) {
    if (event.queryStringParameters.secret === "test" && event.queryStringParameters.id !== null && event.queryStringParameters.id !== undefined) {
      var postData = (event.body).split('&');
      var threshold = postData[0].slice(10);
      var saturday = postData[1].slice(9);
      var deleteEntry = null;
      if (postData[2]) deleteEntry = postData[2].slice(7);
      if (deleteEntry === 'del') {
        var paramsDel = {
          Key: {
            "_id": {
              S: event.queryStringParameters.id
            },
          },
          TableName: "Heartbeat"
        };
        dynamodb.deleteItem(paramsDel, function (err, data) {
          if (err) {
            console.log(err, err.stack);
            callback({
              statusCode: err.statusCode,
              body: err
            });
          } else {
            callback(null, {
              statusCode: 301,
              headers: {
                "Location": "https://www.example.com/api/baseUrl/heartbeat/dashboard?secret=" + event.queryStringParameters.secret
              },
              body: null
            });

          }
        });
      } else {
        var params = {
          Key: {
            "_id": {
              S: event.queryStringParameters.id
            },
          },
          UpdateExpression: "set thresholdF= :th, saturday= :s",
          ExpressionAttributeValues: {
            ":th": {
              "S": threshold
            },
            ":s": {
              "S": saturday
            },
          },
          ReturnValues: "ALL_NEW",
          TableName: "Heartbeat"
        };
        dynamodb.updateItem(params, function (err, data) {
          if (err) {
            console.log(err, err.stack);
            callback({
              statusCode: err.statusCode,
              body: err
            });
          } else {
            callback(null, {
              statusCode: 301,
              headers: {
                "Location": "https://www.example.com/api/baseUrl/heartbeat/dashboard?secret=" + event.queryStringParameters.secret
              },
              body: null
            });

          }

        });


      }
    }
  }

};
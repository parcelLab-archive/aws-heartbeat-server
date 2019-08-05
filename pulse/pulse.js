var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB();
const crypto = require('crypto');




exports.handler = function (event, context, callback) {
  const hash = crypto.createHash('sha256');
  var id;
  var host;
  var category;
  var type;
  var name;
  var timestamp;
  var threshold = "24"; //default value - 24 hours
  var saturday = "0"; // default value - exclude saturday 


  if (event.queryStringParameters !== null && event.queryStringParameters !== undefined) {
    if (event.queryStringParameters.host &&
      event.queryStringParameters.category &&
      event.queryStringParameters.type &&
      event.queryStringParameters.name) {
      host = event.queryStringParameters.host;
      category = event.queryStringParameters.category;
      type = event.queryStringParameters.type;
      name = event.queryStringParameters.name;
      if (event.queryStringParameters.threshold) threshold = event.queryStringParameters.threshold
      timestamp = new Date().toISOString();
      hash.update(host + category + type + name);
      id = hash.digest('hex');
      var params = {
        Key: {
          "_id": {
            S: id
          },
        },
        UpdateExpression: "set host= :h,category= :c,typeF= :t,nameF= :n,timestampF = :ti, thresholdF= if_not_exists(thresholdF,:th), saturday= if_not_exists(saturday,:s)",
        ExpressionAttributeValues: {
          ":h": {
            "S": host
          },
          ":c": {
            "S": category
          },
          ":t": {
            "S": type
          },
          ":n": {
            "S": name
          },
          ":ti": {
            "S": timestamp
          },
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
            body: 'Error: ' + err,
          });
        } else {
          callback(null, {
            statusCode: 200,
            body: 'Successful Heartbeat Pulse'
          });

        }

      });
    }

  }
};

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB();
const request = require('request');

function weekend(dateold, datenew, countSat) {
  var dateO = new Date(dateold);
  var weekendDaysCount = 0;
  while (dateO < datenew) {
    if (dateO.getDay() === 6 && countSat === '0') weekendDaysCount += 1;
    if (dateO.getDay() === 0) weekendDaysCount += 1;
    dateO = new Date(dateO.setDate(dateO.getDate() + 1));
  }
  if (datenew.getDay() === 6 && countSat === '1') weekendDaysCount -= 1;
  if (datenew.getDay() === 0) weekendDaysCount -= 1;
  if (dateold.getDay() === 6 && weekendDaysCount > 0 && countSat === '0') weekendDaysCount -= 1;
  if (dateold.getDay() === 0 && weekendDaysCount > 0) weekendDaysCount -= 1;
  return weekendDaysCount;
}

exports.handler = function (event, context, callback) {
  //event.queryStringParameters.secret -  test should be changed to another secret
  if ((event.queryStringParameters !== null && event.queryStringParameters !== undefined) || event.detail - type === "Scheduled Event") {
    if (event.queryStringParameters.secret === "test" || event.detail - type === "Scheduled Event") {

      dynamodb.scan({
        TableName: 'Heartbeat'
      }, function (err, data) {
        if (err) {
          console.log(err, err.stack); // an error occurred
          callback({
            statusCode: err.statusCode,
            body: err
          });
        } else {

          var rows = '';
          var dateobjNow = new Date();
          var dateMilli = dateobjNow.getTime();
          var payload = {
            'text': 'Heartbeat Error! Please check:\n'
          };
          var sendMessage = false;

          data.Items.forEach(function (item) {

            var weekendCount = 0;
            var dateobj = new Date(item.timestampF.S);
            var delta = dateMilli - Date.parse(item.timestampF.S);
            weekendCount = weekend(dateobj, dateobjNow, item.saturday.S);
            if (item.saturday.S === '1') {
              if (dateobjNow.getDay() === 0) delta -= (dateobjNow.getHours()) * 3600000;

            } else {
              if (dateobjNow.getDay() === 0) delta -= dateobjNow.getHours() * 3600000;
              if (dateobjNow.getDay() === 6) delta -= dateobjNow.getHours() * 3600000;

            }

            if ((delta - weekendCount * 24 * 3600000) > (item.thresholdF.S * 3600000)) {
              sendMessage = true;
              payload.text += `${item.host.S} / ${item.category.S} / ${item.typeF.S} / ${item.nameF.S} \n`;
            }

          });
          if (sendMessage) {
            payload.text += "https://www.example.com/api/baseUrl/heartbeat/dashboard?secret=test";
            var options = {
              method: 'POST',
              url: 'https://hooks.slack.com/services/exampleHook',
              headers: {
                'cache-control': 'no-cache',
                'content-type': 'application/x-www-form-urlencoded'
              },
              form: {
                payload: payload
              }
            };
            options.form.payload = JSON.stringify(payload);
            request.post(options,
              function (err, res, body) {
                if (!err) {
                  callback(null, {
                    statusCode: 200,
                    body: "Check Slack for error notifications"
                  });
                } else {
                  callback({
                    statusCode: 500,
                    body: "Could not send Slack notification"
                  });
                }
              });

          }
        }
      });

    }
  }
};
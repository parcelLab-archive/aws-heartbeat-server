var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB();
const renderHtml = content => `<!DOCTYPE html><html lang="en">

<head>
  <!-- Required meta tags -->
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <meta http-equiv="refresh" content="120">

  <!-- Bootstrap CSS -->
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/css/bootstrap.min.css" integrity="sha384-rwoIResjU2yc3z8GV/NPeZWAv56rSmLldC3R/AZzGRnGxQQKnKkoFVhFQhNUwEyJ" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdn.datatables.net/1.10.16/css/jquery.dataTables.min.css">
    <link rel="stylesheet" href="https://cdn.datatables.net/responsive/2.2.0/css/responsive.dataTables.min.css">
  
</head>

<body>
<div class="container">
<div class="row">
<div class="col">
  <table class="table table-bordered table-responsive" id="myTable">
    <thead class="thead-inverse">
      <tr>
        <th>Host</th>
        <th>Category</th>
        <th>Type</th>
        <th>Name</th>
        <th>Timestamp/Diff</th>
        <th>Delta(h)</th>
        <th>Settings</th>
      </tr>
    </thead>
    <tbody>
      ${content}
    </tbody>
  </table>
</div>
</div>
</div>
  <!-- jQuery first, then Tether, then Bootstrap JS. -->
  <script src="https://code.jquery.com/jquery-3.1.1.slim.min.js" integrity="sha384-A7FZj7v+d/sdmMqp/nOQwliLvUsJfDHW+k9Omg/a/EheAdgtzNs3hpfag6Ed950n"
    crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.0/js/tether.min.js" integrity="sha384-DztdAPBWPRXSA/3eYEEUWrWCy7G5KFbe8fFjk5JAIxUYHKkDx6Qin1DkWx51bBrb"
    crossorigin="anonymous"></script>
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js" integrity="sha384-vBWWzlZJ8ea9aCX4pEW3rVHjgjt7zpkNpZk+02D9phzyeVkE+jo0ieGizqPLForn"
    crossorigin="anonymous"></script>
    <script src="https://cdn.datatables.net/1.10.16/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/responsive/2.2.0/js/dataTables.responsive.min.js"></script>
    <script>$(document).ready(function(){
    $('#myTable').DataTable({"order": [[ 5, 'desc' ]],"pageLength": 100,"responsive": true});
});</script>
</body>

</html>`;

const renderRow = (item, delta, date, secret) => `<tr>
        <td>${item.host.S}</td>
        <td>${item.category.S}</td>
        <td>${item.typeF.S}</td>
        <td>${item.nameF.S}</td>
        <td>${date} / ${delta} h</td>
        <td>${delta - item.thresholdF.S}</td>
        <td>${item.thresholdF.S}h / ${item.saturday.S} <form id="form${item._id.S}" action="https://www.example.com/api/baseUrl/heartbeat/edit" method="get"><input form="form${item._id.S}" type="hidden" name="secret" value="${secret}" />
    <input form="form${item._id.S}" type="hidden" name="id" value="${item._id.S}" /> <input form="form${item._id.S}" type="submit" value="Edit" /></form></td>
      </tr>`;

const renderRowDanger = (item, delta, date, secret) => `<tr class="table-danger">
        <td>${item.host.S}</td>
        <td>${item.category.S}</td>
        <td>${item.typeF.S}</td>
        <td>${item.nameF.S}</td>
        <td>${date} / ${delta} h</td>
        <td>${delta - item.thresholdF.S}</td>
        <td>${item.thresholdF.S}h / ${item.saturday.S} <form id="form${item._id.S}" action="https://www.example.com/api/baseUrl/heartbeat/edit" method="get"><input form="form${item._id.S}" type="hidden" name="secret" value="${secret}" />
    <input form="form${item._id.S}" type="hidden" name="id" value="${item._id.S}" /> <input form="form${item._id.S}" type="submit" value="Edit" /></form></td>
      </tr>`;


function weekend(dateold, datenew, includeSat) {
  var dateO = new Date(dateold);
  var weekendDaysCount = 0;
  while (dateO < datenew) {
    if (dateO.getDay() === 6 && includeSat === '0') weekendDaysCount += 1;
    if (dateO.getDay() === 0) weekendDaysCount += 1;
    dateO = new Date(dateO.setDate(dateO.getDate() + 1));
  }
  if (datenew.getDay() === 6 && includeSat === '1') weekendDaysCount -= 1;
  if (datenew.getDay() === 0) weekendDaysCount -= 1;
  if (dateold.getDay() === 6 && weekendDaysCount > 0 && includeSat === '0') weekendDaysCount -= 1;
  if (dateold.getDay() === 0 && weekendDaysCount > 0) weekendDaysCount -= 1;
  return weekendDaysCount;
}

exports.handler = function (event, context, callback) {


  if (event.queryStringParameters !== null && event.queryStringParameters !== undefined) {
    if (event.queryStringParameters.secret === "test") {

      dynamodb.scan({
        TableName: 'Heartbeat'
      }, function (err, data) {
        if (err) {
          console.log(err, err.stack); // an error occurred
        } else {
          var rows = '';

          var dateobjNow = new Date();
          var dateMilli = dateobjNow.getTime();
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
            var deltaHours = Math.round(delta / 3600000) - weekendCount * 24;
            var dateFormated = dateobj.toLocaleDateString('de-DE', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            });
            if ((delta - weekendCount * 24 * 3600000) > (item.thresholdF.S * 3600000)) {
              rows += renderRowDanger(item, deltaHours, dateFormated, event.queryStringParameters.secret);
            } else {
              rows += renderRow(item, deltaHours, dateFormated, event.queryStringParameters.secret);
            }

          });
          var response = renderHtml(rows);
          callback(null, {
            statusCode: 200,
            headers: {
              "Content-Type": "text/html"
            },
            body: response
          });
        }

      });
    }
  }
};

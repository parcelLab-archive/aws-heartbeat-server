var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB();

const renderHtml = (content, secret, id) => `<!DOCTYPE html><html lang="en">

<head>
  <!-- Required meta tags -->
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

  <!-- Bootstrap CSS -->
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/css/bootstrap.min.css" integrity="sha384-rwoIResjU2yc3z8GV/NPeZWAv56rSmLldC3R/AZzGRnGxQQKnKkoFVhFQhNUwEyJ"
    crossorigin="anonymous">
</head>

<body>
<form action="https://www.example.com/api/baseUrl/heartbeat/edit?secret=${secret}&id=${id}" method="post">
  <div class="form-group">
  <table class="table table-bordered table-responsive" id="myTable">
    <thead class="thead-inverse">
      <tr>
        <th>Host</th>
        <th>Category</th>
        <th>Type</th>
        <th>Name</th>
        <th>Timestamp</th>
        <th>Threshold</th>
        <th>Include Saturday(0 = false, 1 = true)</th>
        <th>Delete</th>
      </tr>
    </thead>
    <tbody>
      ${content}
    </tbody>
  </table>
  </div>
  <button type="submit" class="btn btn-primary">Submit</button>
</form>
  <!-- jQuery first, then Tether, then Bootstrap JS. -->
  <script src="https://code.jquery.com/jquery-3.1.1.slim.min.js" integrity="sha384-A7FZj7v+d/sdmMqp/nOQwliLvUsJfDHW+k9Omg/a/EheAdgtzNs3hpfag6Ed950n"
    crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.0/js/tether.min.js" integrity="sha384-DztdAPBWPRXSA/3eYEEUWrWCy7G5KFbe8fFjk5JAIxUYHKkDx6Qin1DkWx51bBrb"
    crossorigin="anonymous"></script>
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js" integrity="sha384-vBWWzlZJ8ea9aCX4pEW3rVHjgjt7zpkNpZk+02D9phzyeVkE+jo0ieGizqPLForn"
    crossorigin="anonymous"></script>
 
</body>

</html>`;

const renderRow = (item, delta) => `<tr>
        <th>${item.Item.host.S}</th>
        <th>${item.Item.category.S}</th>
        <th>${item.Item.typeF.S}</th>
        <th>${item.Item.nameF.S}</th>
        <th>${item.Item.timestampF.S}</th>
        <th><input name="threshold" type="number" value="${item.Item.thresholdF.S}"></input></th>
        <th><input name="saturday" type="text" value="${item.Item.saturday.S}"></input></th>
        <th><input name="delete" type="checkbox" value="del"></input></th> 
      </tr>`;


exports.handler = function (event, context, callback) {


  if (event.queryStringParameters !== null && event.queryStringParameters !== undefined) {
    if (event.queryStringParameters.secret === "test") {
      dynamodb.getItem({
          Key: {
            _id: {
              "S": event.queryStringParameters.id
            }
          },
          TableName: "Heartbeat"
        },
        function (err, data) {
          if (err) {
            console.log(err, err.stack); // an error occurred
            callback({
              statusCode: err.statusCode,
              body: err
            });
          } else {
            var item = renderRow(data);
            var response = renderHtml(item, event.queryStringParameters.secret, data.Item._id.S);
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
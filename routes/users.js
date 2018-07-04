var express = require('express');
var router = express.Router();
var https = require('https');

/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log(req);
  performRequest('http://localhost:62077/api/Project/0','POST',null,function(data){
    res.send(data);
  })
  res.send('respond with a resource');
});


module.exports = function performRequest(endpoint, method, data, success) {
  var dataString = JSON.stringify(data);
  var headers = {};
  
  if (method == 'GET') {
    endpoint += '?' + querystring.stringify(data);
  }
  else {
    headers = {
      'Content-Type': 'application/json',
      'Content-Length': dataString.length
    };
  }
  var options = {
    host: host,
    path: endpoint,
    method: method,
    headers: headers
  };

  var req = https.request(options, function(res) {
    res.setEncoding('utf-8');

    var responseString = '';

    res.on('data', function(data) {
      responseString += data;
    });

    res.on('end', function() {
      console.log(responseString);
      var responseObject = JSON.parse(responseString);
      success(responseObject);
    });
  });

  req.write(dataString);
  req.end();
}

module.exports = router;



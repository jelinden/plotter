window.onload = function() {
  writeState("document loaded");
  if ('WebSocket' in window) {
    var connection = new WebSocket('ws://localhost:7000/ws');
    connection.onopen = function() {
      writeState("connection open");
    }
    connection.onclose = function() {
      writeState("connection closed");
    }
    connection.onerror = function(error) {
      writeState("error: " + error);
    }
    connection.onmessage = function(e) {
      var msg = JSON.parse(e.data);
      writeState("got a message");
      connection.send("ack");
      arr = ['per minute'];
      Object.keys(msg).map(function(key, i) {
        if (i == 0) {
          arr.push(0);
        } else {
          arr.push(msg[key]);
        }
      });
      chart.load({
        columns: [
          arr
        ]
      });
    }
  } else {
    writeState("You're browser does not support websockets.");
  }
}

var chart = c3.generate({
  data: {
    columns: [
      ['per minute', 0],
    ],
    type: 'bar'
  },
  bar: {
    width: {
      ratio: 1.0
    }
  },
  axis: {
    x: {
      label: 'minutes',
      inverted: true
    },
    y: {
      label: 'page loads'
    }
  }
});

function writeState(stateContent) {
  var date = new Date();
  var stateDiv = document.getElementById("state");
  stateDiv.innerHTML = date.getDate() + '.' +
    date.getMonth() + '.' +
    date.getFullYear() + " " +
    date.toTimeString().split(' ')[0] + " " + stateContent;
}

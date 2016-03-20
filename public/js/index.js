window.onload = function() {
  writeState("document loaded");
  var ws = null;

  if ('WebSocket' in window) {
    function start() {
      ws = new WebSocket('ws://uutispuro.fi:7000/ws');
      ws.onopen = function() {
        writeState("connection open");
      }
      ws.onclose = function() {
        document.getElementById("state").className = "red";
        writeState("connection closed");
      }
      ws.onerror = function(error) {
        document.getElementById("state").className = "red";
        writeState("error: " + error);
      }
      ws.onmessage = function(e) {
        document.getElementById("state").className = "green";
        var msg = JSON.parse(e.data);
        writeState("got a message");
        ws.send("ack");
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
    }
    function check() {
      if (!ws || ws.readyState === 3) {
        start();
      }
    }
    start();
    setInterval(check, 5000);
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

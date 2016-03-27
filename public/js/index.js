var chart, pi1, pi2, pi3, interval;

window.onload = function() {
  writeState("document loaded");

  var ws = null;
  chart = c3div('minutes', '', 'chart');
  pi1 = c3div('hours', '', 'pi1');
  pi2 = c3div('hours', '', 'pi2');
  pi3 = c3div('hours', '', 'pi3');

  if ('WebSocket' in window) {

    window.onfocus = function() {
      start();
    };
    window.onblur = function() {
      ws.close();
    };

    function start() {
      ws = new WebSocket('ws://uutispuro.fi:7000/ws');
      ws.onopen = function() {
        document.getElementById("state").className = "green";
        clearInterval(interval);
        writeState("connection open");
      }
      ws.onclose = function() {
        document.getElementById("state").className = "red";
        ws.close();
        writeState("connection closed");
        interval = setInterval(check, 5000);
      }
      ws.onerror = function(error) {
        document.getElementById("state").className = "red";
        writeState("error: " + error);
      }
      ws.onmessage = function(e) {
        var msg = JSON.parse(e.data);
        writeState("got a message");
        ws.send("ack");
        loadChart(chart, chartArrWithTitle('All per minute', msg.All), 'All per minute', dateArr(msg.All));
        var series = msg.ByServer[0];
        title1 = "Rasberry Pi " + series.Series[0].tags.localIP;
        title2 = "Rasberry Pi " + series.Series[1].tags.localIP;
        title3 = "Rasberry Pi " + series.Series[2].tags.localIP;
        loadChart(pi1, piArrWithTitle(title1, series.Series[0].values), title1, piDateArr(series.Series[0].values));
        loadChart(pi2, piArrWithTitle(title2, series.Series[1].values), title2, piDateArr(series.Series[1].values));
        loadChart(pi3, piArrWithTitle(title3, series.Series[2].values), title3, piDateArr(series.Series[2].values));
      }
    }

    function check() {
      if (!ws || ws.readyState === 3) {
        start();
      }
    }

    start();
  } else {
    writeState("You're browser does not support websockets.");
  }
}

function dateArr(arr) {
  var dateArr = ['date'];
  Object.keys(arr).map(function(key) {
    dateArr.push(new Date(key * 1000));
  });
  return dateArr;
}

function piDateArr(arr) {
  var dateArr = ['date'];
  Object.keys(arr).map(function(key) {
    dateArr.push(new Date(arr[key][0] * 1000));
  });
  return dateArr;
}

function chartArrWithTitle(title, arr) {
  var withTitle = [title];
  Object.keys(arr).map(function(key, i) {
    if (i == 0) {
      withTitle.push(0);
    } else {
      withTitle.push(arr[key]);
    }
  });
  return withTitle;
}

function piArrWithTitle(title, arr) {
  var withTitle = [title];
  Object.keys(arr).map(function(key, i) {
    if (i == 0) {
      withTitle.push(0);
    } else {
      withTitle.push(arr[key][1]);
    }
  });
  return withTitle;
}

function c3div(label, column, bindTo) {
  return c3.generate({
    bindto: document.getElementById(bindTo),
    data: {
      x: 'date',
      columns: [
        column === '' ? [0] : [column, 0],
      ],
      type: 'bar',
      colors: {
        'All per minute': '#ffad33'
      },
    },
    bar: {
      width: {
        ratio: 1.0
      }
    },
    axis: {
      x: {
        type: 'timeseries',
        //localtime: false,
        tick: {
          format: bindTo === 'chart' ? '%H:%M' : '%H:%M',
          count: bindTo === 'chart' ? 0 : 0,
          rotate: bindTo === 'chart' ? 0 : 40
        },
        label: label
      },
      y: {
        label: 'page loads'
      }
    }
  });
}

function writeState(stateContent) {
  var date = new Date();
  var stateDiv = document.getElementById("state");
  stateDiv.innerHTML = date.getDate() + '.' +
    date.getMonth() + '.' +
    date.getFullYear() + " " +
    date.toTimeString().split(' ')[0] + " " + stateContent;
}

function loadChart(element, arr, title, dateArr) {
  element.load({
    x: 'date',
    columns: [
      dateArr, arr
    ]
  });
}

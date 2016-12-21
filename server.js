var STOCK_LIST_MAX_LENGTH = 4;
var http = require('http');
var path = require('path');
var asyn = require('async');
var socketio = require('socket.io');
var express = require('express');
var yahooFinance = require('yahoo-finance');

function getStock(stock, callback) {
  var date = new Date();
  var date1 = date.toISOString().substring(0, 10);
  date.setMonth(date.getMonth() - 12);
  var date2 = date.toISOString().substring(0, 10);
  
  yahooFinance.historical({
      symbol: stock,
      from: date2,
      to: date1,
      period: 'd'  // d is for daily
    }, function (err, quotes) {
      if(!err && quotes && quotes.length) {
        stocks.push({name: stock, data: quotes});
      }
      callback();
  });
}

var app = express();
var server = http.Server(app);
var io = socketio(server);

app.use(express.static(path.resolve(__dirname, 'client')));

var stocks = [];

app.get('/stocks', function(req, res) {
  res.header('Access-Control-Allow-Origin', 'stocks-kenjio.c9users.io');
  res.json(stocks);
})

io.on('connection', function (socket) {
  socket.emit('stock list update', stocks);

  socket.on('new stock', function(data){
    var stockName = data.trim();
    if (!stockName) return;
    // Check that stock is not already in the list
    var found = false;
    stocks.forEach(function(item) {
      if (item.name === stockName) found = true;
    });
    if (found) return;
    
    asyn.each(
      // 1st para in async.each() is the array of items
      [stockName],
      
      // 2nd param is the function that each item is passed to
      function(item, callback){
          // Call an asynchronous function, often a save() to DB
          getStock(item, callback);
      },
      
      // 3rd param is the function to call when everything's done
      function(err){
          // All tasks are done now
          found = false;
          stocks.forEach(function(item) {
            if (item.name === stockName) found = true;
          });
          if (!found) {
            io.emit('stock not found', stockName);
            return;
          }
          if (stocks.length > STOCK_LIST_MAX_LENGTH)
            stocks.splice(0, 1);
          io.emit('stock list update', stocks);
      }
    );
    
  }); //socket.on('new stock')
  
  socket.on('delete stock', function(data) {
    var stock = data.trim();
    if (!stock) return;
    
    var index = -1;
    for (var i = 0; i<stocks.length; i++) {
      if (stocks[i].name === stock) index = i;
    }
    if (index > -1) {
      stocks.splice(index, 1);
      io.emit('stock list update', stocks);
    }
  });
  
});  // io.on()
  

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("App server listening at", addr.address + ":" + addr.port);
});

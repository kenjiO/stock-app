/* global $ io location makeChart */
var stockList = [];
var socket = io('https://stocks-kenjio.c9users.io');


socket.on('stock list update', function(stocks){
	updateStockList(stocks);
});

socket.on('stock not found', function(stockName) {
	alert('Unable to get data for stock ' + stockName);
});


$(document).ready(function() {
	$('#refresh').on('mouseenter', function() {location.reload();});


	$('form').submit(function(){
		if ( $('#stock_input').val().trim() !== "") {
			socket.emit('new stock', $('#stock_input').val().trim());
			$('#stock_input').val('');
		}
		return false;
	});


	$('#stocklist').on('click', '.deleteStock',function() {
		var stockToDelete = $(this).data('stock'); 
		deleteStock(stockToDelete);
	});
}); // document.ready


function updateStockList(stocks) {
	if (!stocks.length) {
		console.log('No stocks in List');
		$('#stocklist').empty();
		return;
	}

	stockList = stocks;
	$('#stocklist').empty();
	stockList.forEach(function(stock) {
		$('#stocklist').append(
		'<li>' + escapeHtml(stock.name) + 
		   '<span class="deleteStock" data-stock="'+stock.name+'">' +
			  '<span class="glyphicon glyphicon-remove"></span>' +
		   '</span>' +
		'</li>');
	});
	
    $('.chart').empty();
    makeChart(stockList);
}

function deleteStock(stock) {
	socket.emit('delete stock', stock);
}

// Taken from http://stackoverflow.com/a/13371349
function escapeHtml(text) {
    'use strict';
    return text.replace(/[\"&'\/<>]/g, function (a) {
        return {
            '"': '&quot;', '&': '&amp;', "'": '&#39;',
            '/': '&#47;',  '<': '&lt;',  '>': '&gt;'
        }[a];
    });
}



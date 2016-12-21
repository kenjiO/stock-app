/* global d3 */

// Adapted from http://bl.ocks.org/d3noob/ae9786c26d6a821eefeabe60dec350a9
function makeChart(json) {
    
    // helper function
    function getDate(d) {
        return new Date(d);
    }

    var data = [];

    json.forEach(function(stock) {
        var dataArray = stock.data;
        var initialPrice = dataArray[0].close;
        var mappedArray = dataArray.map(function(stockObject) {
            return {
                date: getDate(stockObject.date),
                price: ((stockObject.close / initialPrice) - 1) * 100,
                symbol: stock.name
            };
        });
        data = data.concat(mappedArray);
    });

    var margin = {
            top: 30,
            right: 20,
            bottom: 50,
            left: 50
        },
        width = 600 - margin.left - margin.right,
        height = 270 - margin.top - margin.bottom;

    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    // Define the line
    var priceline = d3.line()
        .x(function(d) {
            return x(d.date);
        })
        .y(function(d) {
            return y(d.price);
        });

    // Adds the svg canvas
    var svg = d3.select(".chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) {
        return d.date;
    }));
    y.domain([
        d3.min(data, function(d) {
            return d.price;
        }) - 2,
        d3.max(data, function(d) {
            return d.price;
        }) + 2
    ]);

    // Nest the entries by symbol
    var dataNest = d3.nest()
        .key(function(d) {
            return d.symbol;
        })
        .entries(data);

    // set the color scale
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    // Loop through each symbol / key   //There will be one datanest item for each stock. 
    dataNest.forEach(function(d, i) {
        //console.log(d);  //d is the current datanest item and has attributes:  color, key, values[]
        svg.append("path")
            .attr("class", "line")
            .style("stroke", function() { // Add the colours dynamically
                return d.color = color(d.key);
            })
            .attr("d", priceline(d.values));


        // Add the Legend.  Adapted from http://bl.ocks.org/d3noob/7cd5a74c4620db72f43f
        svg.append("text")
            // .attr("x", (legendSpace/2)+i*legendSpace) // spacing
            // .attr("y", height + (margin.bottom/2)+ 17)            
            .attr("x", 10) // spacing
            .attr("y", 10 + (i * 15))
            .attr("class", "legend") // style the legend
            .style("fill", function() { // dynamic colours
                return d.color = color(d.key);
            })
            .text(d.key);


    });
        // X Axis  
    var xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%Y-%m"));
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);


    // Y Axis
    var yAxis = d3.axisLeft(y).ticks(5);
    svg.append("g")
        .attr("class", "axis")
        .call(yAxis);


    // X-axis label
    svg.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom - 5) + ")")
        .style("text-anchor", "middle")
        .text("Date");

    // Y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Percent Gain/Loss");

}

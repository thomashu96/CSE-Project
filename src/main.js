var margin = { top: 50, left: 0, bottom: 10, right: 0 },
    width = "600", height = "612";

d3.select("start").transition().duration(750);
var activeLine;
// .svg.
var renderPath = d3.line()
    .x(function (d) { return d[0]; })
    .y(function (d) { return d[1]; });
//width+margin.left+margin.right

var shape = "circle";
var svg1 = d3.select("#circle_chart")
    .append("svg")
    .attr("width", 800)
    .attr("height", height);

var g = svg1.attr("transform",
    "translate(" + 0 + "," + 0 + ")");

var svg2 = d3.select("#square_chart")
    .append("svg")
    .attr("width", 800)
    .attr("height", 628);

var g1 = svg2.attr("transform",
    "translate(" + 0 + "," + 0 + ")");

var svg3 = d3.select("#triangle_chart")
    .append("svg")
    .attr("width", 800)
    .attr("height", 628);

var g2 = svg3.attr("transform",
    "translate(" + 0 + "," + 0 + ")");

var y = d3.scaleBand()			// x = d3.scaleBand()	
    .rangeRound([0, height])	// .rangeRound([0, width])
    .paddingInner(0.05)
    .align(0.1);

var x = d3.scaleLinear()		// y = d3.scaleLinear()
    .rangeRound([120, width]);	// .rangeRound([height, 0]);

var z = d3.scaleOrdinal()
    .range(["#3690c0", "#fc4e2a"]);

var inputElems = d3.selectAll("input");
inputElems.on("change", function (d, i) {   // ** Highlight Change **
    // do something here
    console.log(this.id);
    shape = this.id;
});


var map1 = d3.select("#map")
    .append("svg")
    .attr("width", 1000)
    .attr("height", 600);

var projection = d3.geoMercator()
    .scale(130)
    .center([-35, 30])
    .translate([width / 2, height / 2]);

var div = d3.select("#chart2").append("div")
// .attr("class", "tooltip")
// .style("opacity", 1);

var tip_map = d3.tip()
    .attr('class', 'd3-tip')
    .offset([0, 0])
    .attr("data-html", "true")
    // < !-- .attr("src", "/dog.png") -->
		.html(function (d) {
        div.transition()
            .duration(200)
            .style("opacity", .9);
        var name = d.properties.name;
        var img_name = shape + "_" + name;
		// < !--console.log("<img src='/" + img_name + ".png'>"); -->
		var path = "<img src='./drawings/" + shape + "_gif/" + img_name + ".gif', alt='Sorry! No doodle available for this country'>";
        div.html(path)
        return (name);
    });

var path = d3.geoPath();

var color = ["#fff7fb", "#ece2f0", "#d0d1e6", "#a6bddb", "#67a9cf", "#3690c0", "#02818a"]
var map_data = d3.map();
var colorScale = d3.scaleThreshold()
    .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
    .range(color);


// Load external data and boot
d3.queue()
    .defer(d3.json, "./src/world.json")
    .defer(d3.csv, "./processed_data/world_population.csv", function (d) { map_data.set(d.code, +d.pop); })
    .await(ready);

function ready(error, topo) {

    map1.call(tip_map);
    // Draw the map
    map1.append("g")
        .selectAll("path")
        .data(topo.features)
        .enter()
        .append("path")
        // draw each country
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        // set the color of each country
        .attr("fill", function (d) {
            d.total = map_data.get(d.id) || 0;
            return colorScale(d.total);
        })
        .on('mouseover', function (d) {
            tip_map.show(d);
            d3.select(this)
                .style('opacity', 1)
                .style('stroke-width', 0.7);

        })
        .on('mouseout', function (d) {
            tip_map.hide(d);
            d3.select(this)
                .style('opacity', 0.8)
                .style('stroke-width', 0.3);
        });


}

function mousemove() {
    div
        .html("<span style='color:red'><br><img src='dog.jpeg'></span>")
        .style("left", (d3.event.pageX - 34) + "px")
        .style("top", (d3.event.pageY - 12) + "px");
}


var mouseover1 = function (d) {

    // what subgroup are we hovering?
    var subgroupName = d3.select(this.parentNode).datum().key; // This was the tricky part
    var subgroupValue = d.data[subgroupName];
    tip.show(d.data, subgroupName);
	// < !--console.log(subgroupName); -->
        // Reduce opacity of all rect to 0.2
        d3.selectAll(".myRect").style("opacity", 0.4)
    // Highlight all rects of this subgroup with opacity 0.8. It is possible to select them since they have a specific class = their name.
    d3.selectAll("." + subgroupName)
        .style("opacity", 1);

}

// When user do not hover anymore
var mouseleave = function (d) {
    tip.hide(d);
    // Back to normal opacity: 0.8
    d3.selectAll(".myRect")
        .style("opacity", 1)
}

var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-5, 0])
    .attr("data-html", "true")
    .html(function (d, i) {
			// < !--console.log(i) -->
			var state = d.country;
        var value = 0
        if (i == "Clockwise") {
            value = (d.Clockwise * 100).toFixed(2);
        } else {
            value = (d["Counter-Clockwise"] * 100).toFixed(2);
        }
        var message = state + "<br/>" + i + " : " + value + "%";
			// < !--console.log(message); -->
			return (message);

    });


d3.csv("./processed_data/circle_per_country.csv", function (d, i, columns) {
    for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
    d.total = t;
    return d;
}, function (error, data) {
    if (error) throw error;

    var keys = data.columns.slice(1);

    data.sort(function (a, b) { return d3.descending(a.Clockwise, b.Clockwise); });
    y.domain(data.map(function (d) { return d.country; }));
    x.domain([0, d3.max(data, function (d) { return d.total; })]).nice();
    z.domain(keys);

    g.append("g")
        .selectAll("g")
        .data(d3.stack().keys(keys)(data))
        .enter().append("g")
        .attr("fill", function (d) { return z(d.key); })
        .attr("class", function (d) { return "myRect " + d.key })
        .selectAll("rect")
        .data(function (d) { return d; })
        .enter().append("rect")
        .attr("y", function (d) { return y(d.data.country); })	    //.attr("x", function(d) { return x(d.data.State); })
        .attr("x", function (d) { return x(d[0]); })			    //.attr("y", function(d) { return y(d[1]); })	
        .attr("width", function (d) { return x(d[1]) - x(d[0]); })	//.attr("height", function(d) { return y(d[0]) - y(d[1]); })
        .attr("height", y.bandwidth())			    //.attr("width", x.bandwidth());	
        .on("mouseover", mouseover1)
        .on("mouseleave", mouseleave);

    svg1.call(tip);
    //y.bandwidth()
    g.append("g")

        .attr("class", "axis")
        .attr("transform", "translate(120,0)")
        // < !-- .attr("y", -margin.left + 70)	  //  .attr("transform", "translate(0," + height + ")") --> -->
            .call(d3.axisLeft(y))
            .selectAll("Text")
            .attr("x", 50);
    //   .call(d3.axisBottom(x));

    g.append("g")

        .attr("class", "axis")
        .attr("transform", "translate(0,594)")
        // < !-- .attr("x", width) -->
	  .call(d3.axisBottom(x).ticks(null, "s"));


    svg1.on("active", function () { console.log("yay"); })

    //     < !--svg1.selectAll("rect").transition() -->
	// < !-- .duration(800) -->
	// 	< !-- .attr("x", function (d) { return x(d[0]); }) -->
    //             < !-- .attr("y", function (d) { return y(d.data.country); }) -->
    //             < !-- .attr("width", function (d) { return x(d[1]) - x(d[0]); }) -->
    //             < !-- .attr("height", y.bandwidth())			    //.attr("width", x.bandwidth());	 -->

    //     < !-- .delay(function (d, i) { return (i * 100) }); -->

  var legend = g.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(keys.slice().reverse())
        .enter().append("g")
        //.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
        .attr("transform", function (d, i) { return "translate(120," + (300 + i * 20) + ")"; });

    legend.append("rect")
        .attr("x", width - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", z);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function (d) { return d; });
});

d3.csv("./processed_data/square_per_country.csv", function (d, i, columns) {
    for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
    d.total = t;
    return d;
}, function (error, data) {
    if (error) throw error;

    var keys = data.columns.slice(1);

    data.sort(function (a, b) { return d3.descending(a.Clockwise, b.Clockwise); });
    y.domain(data.map(function (d) { return d.country; }));
    x.domain([0, d3.max(data, function (d) { return d.total; })]).nice();
    z.domain(keys);

    g1.append("g")
        .selectAll("g")
        .data(d3.stack().keys(keys)(data))
        .enter().append("g")
        .attr("fill", function (d) { return z(d.key); })
        .attr("class", function (d) { return "myRect " + d.key })
        .selectAll("rect")
        .data(function (d) { return d; })
        .enter().append("rect")
        .attr("y", function (d) { return y(d.data.country); })	    //.attr("x", function(d) { return x(d.data.State); })
        .attr("x", function (d) { return x(d[0]); })			    //.attr("y", function(d) { return y(d[1]); })	
        .attr("width", function (d) { return x(d[1]) - x(d[0]); })	//.attr("height", function(d) { return y(d[0]) - y(d[1]); })
        .attr("height", y.bandwidth())			    //.attr("width", x.bandwidth());	
        .on("mouseover", mouseover1)
        .on("mouseleave", mouseleave);

    svg2.call(tip);
    //y.bandwidth()
    g1.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(120,0)")
        // < !-- .attr("y", -margin.left + 70)	  //  .attr("transform", "translate(0," + height + ")") --> -->
            .call(d3.axisLeft(y))
            .selectAll("Text")
            .attr("x", 50);
    //   .call(d3.axisBottom(x));

    g1.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0,610)")
        // < !-- .attr("x", width) -->
	  .call(d3.axisBottom(x).ticks(null, "s"));

    var legend = g1.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(keys.slice().reverse())
        .enter().append("g")
        //.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
        .attr("transform", function (d, i) { return "translate(120," + (300 + i * 20) + ")"; });

    legend.append("rect")
        .attr("x", width - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", z);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function (d) { return d; });
});

d3.csv("./processed_data/triangle_per_country.csv", function (d, i, columns) {
    for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
    d.total = t;
    return d;
}, function (error, data) {
    if (error) throw error;

    var keys = data.columns.slice(1);

    data.sort(function (a, b) { return d3.descending(a.Clockwise, b.Clockwise); });
    y.domain(data.map(function (d) { return d.country; }));
    x.domain([0, d3.max(data, function (d) { return d.total; })]).nice();
    z.domain(keys);

    g2.append("g")
        .selectAll("g")
        .data(d3.stack().keys(keys)(data))
        .enter().append("g")
        .attr("fill", function (d) { return z(d.key); })
        .attr("class", function (d) { return "myRect " + d.key })
        .selectAll("rect")
        .data(function (d) { return d; })
        .enter().append("rect")
        .attr("y", function (d) { return y(d.data.country); })	    //.attr("x", function(d) { return x(d.data.State); })
        .attr("x", function (d) { return x(d[0]); })			    //.attr("y", function(d) { return y(d[1]); })	
        .attr("width", function (d) { return x(d[1]) - x(d[0]); })	//.attr("height", function(d) { return y(d[0]) - y(d[1]); })
        .attr("height", y.bandwidth())			    //.attr("width", x.bandwidth());	
        .on("mouseover", mouseover1)
        .on("mouseleave", mouseleave);

    svg3.call(tip);
    //y.bandwidth()
    g2.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(120,0)")
        // < !-- .attr("y", -margin.left + 70)	  //  .attr("transform", "translate(0," + height + ")") --> -->
            .call(d3.axisLeft(y))
            .selectAll("Text")
            .attr("x", 50);
    //   .call(d3.axisBottom(x));

    g2.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0,594)")
        // < !-- .attr("x", width) -->
	  .call(d3.axisBottom(x).ticks(null, "s"));

    var legend = g2.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(keys.slice().reverse())
        .enter().append("g")
        //.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
        .attr("transform", function (d, i) { return "translate(120," + (300 + i * 20) + ")"; });

    legend.append("rect")
        .attr("x", width - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", z);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function (d) { return d; });
});

var svg = d3.select("#circle_draw").select("svg")
    .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));


function dragstarted() {
    d3.select("#circle_draw").selectAll("path").remove();
    d3.select("#t").remove();
    activeLine = null;
    activeLine = svg.append("path").datum([]).attr("class", "line");
    activeLine.datum().push(d3.mouse(this));

}

function dragged() {
    activeLine.datum().push(d3.mouse(this));
    activeLine.attr("d", renderPath);
}

function dragended() {
    getDirection(activeLine.datum());
    activeLine = null;
}

function getDirection(p) {

    var points = p.map(function (d, i) {

        return {
            x: +d[0],
            y: +d[1]
        }

    });


    sum = 0;
    dir = "";
    for (i = 1; i < p.length; i++) {
        w = points[i - 1];
        z = points[i];
        t = (z.x - w.x) * (z.y + w.y);
        //console.log(t);
        sum = sum + t;
    }


    if (sum > 0) {
        dir = "You drew that Counter Clockwise";
    } else {
        dir = "You drew that Clockwise";
    }

    d3.selectAll("#trial")
        .append("p")
        .attr("id", "t")
        .append("text")
        .style("font-family", "Comic Sans MS")
        .attr("font-weight", "bold")
        .text(dir)

    d3.select("#d1")
        .selectAll('h3')    //ADD THIS
        .enter()
        .append("h3")
        .text("Revered by the ancient Greeks, essential to Islamic art, and venerated in Zen and Tibetan Buddhism, circles are a universal shape. No matter where you begin, there are really only two ways to draw a circle, a single stroke heading clockwise, or a single stroke heading counterclockwise. Google’s dataset contains 119,000 unique circles drawn by people in 148 countries, and includes coordinates for the path traced by each player’s finger (or mouse). Applying some simple geometry to data from the 66 countries that submitted over 100 circles, we identified the circle-drawing directions favored by different nations.");


}


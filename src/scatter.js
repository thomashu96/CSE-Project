// set the dimensions and margins of the graph
var margin_scat = { top: 20, right: 200, bottom: 50, left: 60 },
    width_scat = 900 - margin_scat.left - margin_scat.right,
    height_scat = 400 - margin_scat.top - margin_scat.bottom;

var requested_word = "circle";
var legendRectSize = 12;
var legendSpacing = 6;

// Select box
var selectbox_scat = d3.select('#scatter_plot')
    .append('div')
    .attr('class', 'select_label')
    .text('Category:    ')
    .append('select')
    .attr('class', 'select')

// append the svg object to the body of the page
var svg_scat = d3.select("#scatter_plot")
    .append("svg")
    .attr("width", width_scat + margin_scat.left + margin_scat.right)
    .attr("height", height_scat + margin_scat.top + margin_scat.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin_scat.left + "," + margin_scat.top + ")");

// Color scale: give me a specie name, I return a color
var color = d3.scaleOrdinal()
    .domain(["Africa", "North America", "Asia", "Oceania", "South America"])
    .range(["#440154ff", "#21908dff", "#fde725ff", "#fe4a49", "#4b86b4"])

//Read the data
d3.csv("./processed_data/time_and_stroke_continent.csv", function (d) {
    return {
        country: d.country,
        stroke: parseFloat(d.stroke_count),
        drawing_time: parseFloat(d.drawing_time),
        count: parseInt(d.count),
        word: d.word,
        region: d.continent
    };

}).then(data => {
    // console.log(data);
    var filtered = data.filter(d => d.word == requested_word).filter(d => d.count > 50);
    console.log(filtered);

    // Add X axis
    var x = d3.scaleLinear()
        .domain([
            d3.min(filtered, function (d) { return d.drawing_time; }),
            d3.max(filtered, function (d) { return d.drawing_time; })
        ])
        .range([0, width_scat]);

    var xAxis = d3.axisBottom(x);
    svg_scat.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height_scat + ")")
        .call(xAxis);

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([
            d3.min(filtered, function (d) { return d.stroke; }),
            d3.max(filtered, function (d) { return d.stroke; })
        ])
        .range([height_scat, 0]);

    var yAxis = d3.axisLeft(y);
    svg_scat.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    var div2 = d3.select("#scatter_plot").append("div")
        // .attr("class", "tooltip_scat")
        .classed("tooltip_scat", true)
        .style("opacity", 0);

    // var tooltip = d3.selectAll(".tooltip_scat")

    plot_dot(filtered);

    // SelectBox 
    selectbox_scat.on('change', onchange);

    var options = selectbox_scat
        .selectAll('option')
        .data(['circle', 'square', 'triangle', 'windmill', 'traffic light', 'car', 'book', 'power outlet']).enter()
        .append('option')
        .attr('value', function (d) { return d; })
        .property("selected", function (d) { return d == "circle"; })
        .text(function (d) { return d; });

    // Add dots
    function plot_dot(filtered) {
        var dot = svg_scat.selectAll(".dot")
            .data(filtered)
            .enter()
            .append("circle")
            .attr("cx", function (d) { return x(d.drawing_time); })
            .attr("cy", function (d) { return y(d.stroke); })
            .attr("r", 5)

        dot.style("fill", function (d) { return color(d.region) }).style("opacity", 0.1)
            .transition()
            .duration(500)
            .style("opacity", 0.8)

        dot.on("mouseover", function (d) {
            div2.transition().style("opacity", 1)
            // .style("background",color(d.region))
            div2.html("" + d.country)
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 20) + "px")
                .style("font-size", "20px");
        })
            // .on("mouseout", function (d) {
            //     div2.transition()
            //         .duration(400)
            //         .style("opacity", 0);
            // })
    }

    //legend 
    var legend = svg_scat.selectAll('.legend')
        .data(color.domain())
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function (d, i) {
            var vert = i * (legendRectSize + legendSpacing)
            return 'translate(' + (width_scat + 30) + "," + (vert) + ")";
        });
    legend.append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', color)
        .style('stroke', color);
    legend.append('text')
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        .text(function (d) { return d; })
        .attr("font-family", "Comic Sans MS");

    // // Title
    // svg_scat.append("text")
    //     .text(requested_word.toUpperCase())
    //     .attr("x", width_scat / 2)
    //     .attr("y", margin_scat.top / 2)
    //     .style("text-anchor", "middle")
    //     .attr("font-family", "Comic Sans MS")
    //     .attr("font-size", 20)

    //Axis labels 
    svg_scat.append("text")
        .attr("transform",
            "translate(" + (width_scat / 2) + " ," +
            (height_scat + margin_scat.top + margin_scat.bottom / 2) + ")")
        .style("text-anchor", "middle")
        .attr("font-family", "Comic Sans MS")
        .text("Drawing Time");

    svg_scat.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin_scat.left)
        .attr("x", 0 - (height_scat / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("font-family", "Comic Sans MS")
        .text("Number of strokes");

    function onchange() {
        // Get value in the selected box
        requested_word = d3.select(this).property('value');
        var new_data = data.filter(d => d.word == requested_word).filter(d => d.count > 50);
        console.log(new_data);

        // Update axis
        x.domain([
            d3.min(new_data, function (d) { return d.drawing_time; }),
            d3.max(new_data, function (d) { return d.drawing_time; })
        ])
            .range([0, width_scat]);

        y.domain([
            d3.min(new_data, function (d) { return d.stroke; }),
            d3.max(new_data, function (d) { return d.stroke; })
        ])
            .range([height_scat, 0]);

        console.log(x.domain(), x.range());

        // Transition
        var svg = d3.select("#scatter_plot").transition();

        // // Remove all dot and replot
        svg.selectAll("circle")
            .style('opacity', 1)
            .style('fill', 'red')
            .duration(500)
            .remove();

        plot_dot(new_data);

        // Change axis
        svg.select(".x.axis") // change the x axis
            .duration(500)
            .call(xAxis);

        svg.select(".y.axis") // change the y axis
            .duration(500)
            .call(yAxis);
    }
})
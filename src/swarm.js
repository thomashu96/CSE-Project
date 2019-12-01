var width_swarm = 960,
    height_swarm = 960;

const margin_swarm = { top: 20, right: 50, bottom: 50, left: 50 };
const radius = 13;
const scale = radius / 255;

let showTypes = true;

const typeColors = {
    animal: '#FFA726',
    food: '#EF5350',
    nature: '#9CCC65',
    location: '#26A69A',
    vehicle: '#29B6F6',
    body_part: '#A1887F',
    abstract: '#7E57C2',
    object: '#BDBDBD',
};

data_name = ['animal', 'food ','nature','location','vehicle','body_part','abstract','object']

var colorFor = d3.scaleOrdinal().domain(data_name)
  .range(d3.schemeTableau10);

const line = d3.line()
    .x(d => d[0])
    .y(d => d[1])
    .curve(d3.curveBasis);

let positionKey = 'd_draw_me';

var xScale = d3.scaleLinear()
    .rangeRound([100, width_swarm - 40]);

// Select box
var selectbox = d3.select('#swarm')
    .append('div')
    .attr('class', 'select_label')
    .text('Swarm plot axis attribute:    ')
    .append('select')
    .attr('class', 'select')

// Swarm plot svg
var svg_swarm = d3.select("#swarm").append("svg")
    .attr('width', width_swarm + margin_swarm.left + margin_swarm.right)
    .attr('height', height_swarm + margin_swarm.top + margin_swarm.bottom);

var axis = svg_swarm.append("line")
    .attr("id", "axis");

d3.json("../processed_data/all_aggregates_with_doodles.json", function (error, data) {
    if (error) throw error;
    data.forEach(d => {
        d.key = d.word;
        // d.icon = d.drawings[0];
        d.drawings = d.drawings.map(d => ({ drawing: d }))
        d.iconIndex = 0;

        return d;
    });

    console.log(data)
    update();
    createLegend();

    // SelectBox 
    selectbox.on('change', onchange);

    var options = selectbox
        .selectAll('option')
        .data(["d_draw_me", "d_pause_md", "d_total_me", "scount_me"]).enter()
        .append('option')
        .attr('value', function (d) { return d; })
        .property("selected", function (d) { return d == "d_draw_me";})
        .text(function (d) { return key_to_text(d); });

    function key_to_text(key)
    {
        if (key == "d_draw_me")
        {
            return "Average Drawing Time";
        }
        else if (key == "d_pause_md")
        {
            return "Average Pause Time";
        }
        else if (key == "d_total_me")
        {
            return "Average Total Drawing Time";
        }
        else if (key == "scount_me")
        {
            return "Average Number of Stroke";
        }
    }

    function onchange() {
        // Get value in the selected box
        positionKey = d3.select(this).property('value');
        update();
    }

    // Swarm plot    
    function suffixFor(key) {
        return key === 'scount_me' ? ' strokes' : ' secs';
    }

    function updateScales() {
        const xExtent = d3.extent(data, d => d[positionKey]);
        xScale.domain(xExtent);
    }

    function updateSwarm() {
        return d3.beeswarm()
            .data(data)
            .distributeOn(d => xScale(d[positionKey]))
            .radius(radius)
            .orientation('horizontal')
            .side('symetric')
            .arrange();
    }

    function createLegend() {

        const legend = svg_swarm.selectAll('.legend')
            .data(Object.keys(typeColors))

        const legendE = legend.enter()
            .append('g')
            .attr('class', 'key')
            .attr('transform', (d, i) => `translate(${width_swarm/1.2},${((radius * 2) * i + margin_swarm.top * 2)})`);

        legendE.append('circle')
            .attr('r', radius/ 1.2)
            .attr('fill', d => colorFor(d))
            .attr('opacity', 0.8)

        legendE.append('text')
            .attr('x', radius + 5)
            .attr('dy', 5)
            .text(d => d.replace('_', ' '));

    }

    function update() {
        updateScales();
        const swarm = updateSwarm();

        let doodle = svg_swarm.selectAll('.doodle')
            .data(swarm, d => d.datum.word)

        const doodleE = doodle.enter()
            .append('g')
            .attr('class', 'doodle')
            .attr('transform', `translate(${width_swarm / 2}, ${height_swarm / 2})`)
            .on('mouseover', mouseover)
            .on('mouseout', mouseout)
            .on('click', mouseclick);

        doodleE.append('circle')
            .attr('class', 'background')
            .attr('r', radius)
            .attr('fill', 'white')
            .attr('stroke', '#777')
            .attr('stroke-width', '1')
            .attr('opacity', 0.8);

        const panel = doodleE.append('g')
            .attr('class', 'panel')
            .attr('transform', `translate(${-radius / 2}, ${-radius / 2}) scale(${scale})`)

        const paths = panel.selectAll('.stroke')
            .data(d => d.datum.drawings[d.datum.iconIndex].drawing)
            .enter()
            .append('path')
            .classed('stroke', true)
            .style('fill', 'none')
            .style('pointer-events', 'none')
            .style('stroke', 'black')
            .style('stroke-width', 8)
            .attr('d', line);


        doodle.merge(doodleE)
            .transition()
            .duration(500)
            .attr('transform', d => `translate(${d.x}, ${(height / 1.2)+ d.y})`);

        updateFill();
    }

    // function colorFor(type) {
    //     if (!showTypes) {
    //         return 'white';
    //     }

    //     return typeColors[type];
    // }

    function updateFill() {
        svg_swarm.selectAll('.doodle').selectAll('.background')
            .transition()
            .duration(500)
            .attr('fill', d => colorFor(d.datum.type))

        if (showTypes) {
            createLegend();
        }
    }

    function mouseover(d) {
        const gr = d3.select(this);
        gr.raise();

        const expandR = radius * 4;

        gr.select('.background')
            .transition()
            .duration(20)
            .attr('opacity', 0.0)
            .attr('r', expandR)
            .attr('stroke-width', 0);

        gr.insert('circle', '.background')
            .attr('opacity', 0.8)
            .attr('class', 'temp-background')
            .attr('fill', colorFor(d.datum.type))
            .attr('pointer-events', 'none')
            .attr('r', expandR * 2)
            .attr('stroke-width', 0);

        gr.select('.panel')
            .attr('transform', `translate(${-expandR}, ${-expandR}) scale(${((expandR * 2) / 255)})`);

        gr.append('text')
            .attr('x', 0)
            .attr('class', 'dot-text')
            .attr('pointer-events', 'none')
            .attr('y', expandR + 25)
            .attr('text-anchor', 'middle')
            .text(d.datum.word);

        gr.append('text')
            .attr('x', 0)
            .attr('class', 'dot-text')
            .attr('pointer-events', 'none')
            .attr('y', expandR + 40)
            .attr('text-anchor', 'middle')
            .text(d.datum[positionKey] + suffixFor(positionKey));
    }

    function mouseout() {
        const gr = d3.select(this);
        gr.selectAll('.dot-text')
            .remove();

        gr.select('.temp-background')
            .remove();

        gr.select('.panel')
            .transition()
            .duration(200)
            .attr('transform', `translate(${-radius / 2}, ${-radius / 2}) scale(${scale})`);

        gr.select('.background')
            .transition()
            .duration(20)
            .attr('r', radius)
            .attr('opacity', 0.8)
            .attr('stroke-width', 1);
    }

    function mouseclick(d) {
        d.datum.iconIndex = (d.datum.iconIndex + 1) % d.datum.drawings.length;
        const gr = d3.select(this);
        gr.select('.panel')
            .selectAll('.stroke').remove();
        gr.select('.panel')
            .selectAll('.stroke')
            .data(d.datum.drawings[d.datum.iconIndex].drawing)
            .enter()
            .append('path')
            .classed('stroke', true)
            .style('fill', 'none')
            .style('pointer-events', 'none')
            .style('stroke', 'black')
            .style('stroke-width', 8)
            .attr('d', line);

    }
});

function showOnTheFlyCircleArrangement(d, type) {
    nodeContainer.selectAll("circle.test").remove();
    nodeContainer.append("circle")
        .datum(d)
        .classed(type, true)
        .attr("r", config.radius)
        .attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return height / 2 + d.y; })
        .style("fill", function (d) { return fill(d.rank); })
        .style("stroke", function (d) { return d3.rgb(fill(d.rank)).darker(); })
};
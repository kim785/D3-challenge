// @TODO: YOUR CODE HERE!

// STEP 1: SVG wrapper dimensions
var svgWidth = 1200;
var svgHeight = 660;

var margin = {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;


// STEP 2: Append SVG and group
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)


// STEP 3: Import Data
d3.csv("assets/data/data.csv").then((importData) => {

    // Log the data to check
    console.log(importData);

    // Parse the data
    importData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
    });

    // STEP 4: Scales
    var xScale = d3.scaleLinear() // In Poverty (%)
        .domain([d3.min(importData, d => d.poverty) - 1, d3.max(importData, d => d.poverty) + 2])
        .range([0, width]);

    var yScale = d3.scaleLinear() // Lacks Healthcare (%)
        .domain([0, d3.max(importData, d => d.healthcare)])
        .range([height, 0]);

    // STEP 5: Create Axes
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    // STEP 6: Append the axes to the chartGroup
    chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis)

    chartGroup.append("g")
        .call(yAxis)

    // STEP 7: Create circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(importData)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.poverty))
        .attr("cy", d => yScale(d.healthcare))
        .attr("r", "15")
        .attr("fill", "skyblue")
        .attr("opacity", "0.9")
    
    chartGroup.append("g")
        .selectAll("text")
        .data(importData)
        .enter()
        .append("text")
        .classed(".stateText", true)
        .text(d => d.abbr)
        .attr("x", d => xScale(d.poverty) - 10)
        .attr("y", d => yScale(d.healthcare) + 5)
        .attr("fill", "white")
        .attr("font-size", "15px")

    // STEP 8: Create axes labels
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 18)
        .attr("x", 0 - (height / 2) - 80)
        .attr("class", "axisText")
        .attr("font-size", "20px")
        .text("Lacks Healthcare (%)")

    chartGroup.append("text")
        .attr("transform", `translate(${width / 2 - 60}, ${height + margin.top - 13})`)
        .attr("class", "axisText")
        .attr("font-size", "20px")
        .text("In Poverty (%)")

}).catch(function(error) {
    console.log(error);
})



// @TODO: YOUR CODE HERE!

// STEP 1: SVG wrapper dimensions
var svgWidth = 1200;
var svgHeight = 660;

var margin = {
    top: 50,
    bottom: 100,
    left: 100,
    right: 50
}

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.left;

// STEP 2: Append SVG 
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// STEP 3: Initial Parameters
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// STEP 4: Functions
// for updating x-scale upon click
function xScale(timesData, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(timesData, d => d[chosenXAxis]) * 0.9, d3.max(timesData, d => d[chosenXAxis]) * 1.1])
        .range([0, width]);

    return xLinearScale;
}

// for updating y-scale upon click
function yScale(timesData, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(timesData, d => d[chosenYAxis]) * 0.8, d3.max(timesData, d => d[chosenYAxis]) * 1.1])
        .range([height, 0]);

    return yLinearScale;
}

// for updating x-axis upon click
function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// for updating y-axis upon click
function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// for updating circle groups
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}

// function used for updating text inside the circles
function renderText(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("dx", d => newXScale(d[chosenXAxis]))
        .attr("dy", d => newYScale(d[chosenYAxis]))
        .attr("text-anchor", "middle")
        .attr("font-size", "15px")
        .attr("fill", "white");

    return circlesGroup;
}

// function for updating circles
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    var xlabel;

    if (chosenXAxis === "poverty") {
        xlabel = "Poverty (%)";
    }
    else if (chosenXAxis === "age") {
        xlabel = "Age";
    }
    else {
        xlabel = "Income ($)";
    }

    var ylabel;

    if (chosenYAxis === "obesity") {
        ylabel = "Obesity (%)";
    }
    else if (chosenYAxis === "smokes") {
        ylabel = "Smokes (%)";
    }
    else {
        ylabel = "Healthcare (%)";
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([90,-90])
        .html(function(d) {
            return(`${d.state}<br>${xlabel}: ${d[chosenXAxis]}<br>${ylabel}: ${d[chosenYAxis]}`);
        });
    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data, this);
    })
        .on("mouseout", function(data) {
            toolTip.hide(data);
        });
    
    return circlesGroup;
}

// STEP 5: Retrieve data and execute
d3.csv("assets/data/data.csv").then((timesData) => {
    console.log(timesData);

    // Parse data
    timesData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
        data.healthcare = +data.healthcare;
    });

    // Scale
    var xLinearScale = xScale(timesData, chosenXAxis);
    var yLinearScale = yScale(timesData, chosenYAxis);

    // Axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append axes
    var xAxis = chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    var yAxis = chartGroup.append("g")
        .call(leftAxis);

    // Scatter plot
    var circlesGroup = chartGroup.selectAll("circles")
        .data(timesData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 15)
        .attr("fill", "skyblue")
        .attr("opacity", "0.9")

    var circlesText = chartGroup.append("g")
        .selectAll("text")
        .data(timesData)
        .enter()
        .append("text")
        .classed(".stateText", true)
        .text(d => d.abbr)
        .attr("dx", d => xLinearScale(d[chosenXAxis]) - 10)
        .attr("dy", d => yLinearScale(d[chosenYAxis]) + 5)
        .attr("fill", "white")
        .attr("font-size", "15px");

    // Label group
    var XLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = XLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .classed("active", true)
        .text("In Poverty (%)");

    var ageLabel = XLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .classed("inactive", true)
        .text("Age (Median)");

    var incomeLabel = XLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .classed("inactive", true)
        .text("Income (Median)");

    var YLabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");

    var obesityLabel = YLabelsGroup.append("text")
        .attr("y", 15 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("value", "obesity")
        .classed("inactive", true)
        .text("Obesity (%)");

    var smokesLabel = YLabelsGroup.append("text")
        .attr("y", 35 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("value", "smokes")
        .classed("inactive", true)
        .text("Smokes (%)");

    var healthcareLabel = YLabelsGroup.append("text")
        .attr("y", 55 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("value", "healthcare")
        .classed("active", true)
        .text("Lacks Healthcare (%)");

    // Now create an event listener
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    XLabelsGroup.selectAll("text")
        .on("click", function() {
            var value = d3.select(this).attr("value");

            // If selected value is not the default:
            if (value !== chosenXAxis) {
                
                // Set new value
                chosenXAxis = value;

                // New scale
                xLinearScale = xScale(timesData, chosenXAxis);

                // New axis
                xAxis = renderXAxis(xLinearScale, xAxis);

                // Append data
                circleGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // Append text
                circlesText = renderText(circlesText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)

                // Update tooltip
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // Update axes
                if (chosenXAxis === "age") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "income") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
                else {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false)
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
            }
        });

    // The same on the y-axis
    YLabelsGroup.selectAll("text")
        .on("click", function() {
                var value = d3.select(this).attr("value");
                if (value !== chosenYAxis) {
                    chosenYAxis = value;
                    yLinearScale = yScale(timesData, chosenYAxis);
                    yAxis = renderYAxis(yLinearScale, yAxis);
                    circleGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                    circlesText = renderText(circlesText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
    
                    if (chosenYAxis === "smokes") {
                        obesityLabel
                            .classed("active", false)
                            .classed("inactive", true)
                        smokesLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else if (chosenYAxis === "obesity") {
                        obesityLabel
                            .classed("active", true)
                            .classed("inactive", false)
                        smokesLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else {
                        obesityLabel
                            .classed("active", false)
                            .classed("inactive", true)
                        smokesLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        healthcareLabel
                            .classed("active", true)
                            .classed("inactive", false);
                    }
                }
            });
    
}).catch(function(error) {
    console.log(error);
})




//data, its classes, constants for svg, data source. 
//NOTE FOR FUTURE SELF
/*

	Could be highly improved, be sure to come back with more knowledge on d3 to improve this.
	most likely able to be done in much more elegant way. 

	improve code to be more efficient/elegant

	fix up styling of legend, ensure each key is actually mapped to right key. ask owen.

	john 23/6/2014

	Use: to graph student data and show if who passed and failed and how it matched with the prediction.  
*/

//CONSTANTS. 
var WIDTH = 1000,
    HEIGTH = 350;

var PAD = 18,
    LEFT_PAD = 100;

//url and id for json and html docs. 
var DATA_URL = '../../../jsons/StudentPerformance.json',
    HTML_ID = "#studentPerformanceChart";

//shape dimensions
var SQUARE_SIZE = 5,
	CIRCLE_RADIUS = 2.5;

//student data and lo/hi values for axis's.
var passes = [],
	fails = [],
	xMax, yMax, 
	xMin, yMin;

//scales and axis's.
var xScale, yScale,
	xAxis, yAxis;

//set up svg. 
var svg = d3.select(HTML_ID).append("svg")
    .attr("width", WIDTH).attr("height", HEIGTH)
    .attr("shape-rendering", "auto");

//Async function that will populate data and create graph.
d3.json(DATA_URL, function (studentData) 
{ 
	//initalise and set up the graph.  
	partitionData(studentData);
	findMaxMin(studentData);
	setScales();

	//create the axis's
    xAxis = d3.svg.axis().scale(xScale).orient("bottom"),
    yAxis = d3.svg.axis().scale(yScale).orient("left");

	//add the axis's
	addGElement("translate(0, "+(HEIGTH-PAD)+")", xAxis)
	addGElement("translate("+(LEFT_PAD-PAD)+", 0)", yAxis)

    //Add all passes and fails on the graph.
    addPoints(passes, "circle");  
    addPoints(fails, "rect");
 
 	// draw legend
 	addLegend();
});

/* HELPER FUNCTIONS FOR JSON DRIVEN GRAPH. */
//seperate the passes from the fails. 
function partitionData(data)
{
	//seperate the studentData into passes and fails.
  	for (var i = 0; i < data.length; i++) 
  	{
        //make a point, push it to correct class, 1 if pass, 0 if fail. 
    	point = { x: data[i].x, y: data[i].y, p: data[i].p};
    	if (data[i].c == 1) passes.push(point);
    	else fails.push(point);
  	}
}

//set the x/yMax/Minv values given an array. 
function findMaxMin(data)
{
	//go through data and find max and mins for domains on axis's. 
    xMax = d3.max(data, function(d) { return d.x; }),
    yMax = d3.max(data, function(d) { return d.y; }),
    xMin = d3.min(data, function(d) { return d.x; }),
    yMin = d3.min(data, function(d) { return d.y; });
}

//set up the axis's. Range based on padding and svg size. 
function setScales()
{
    xScale = d3.scale.linear().domain([xMin, xMax]).range([LEFT_PAD, WIDTH-PAD]),
    yScale = d3.scale.linear().domain([yMax, yMin]).range([PAD, HEIGTH-PAD]);
}

//add a group element given its translation and what to call. 
function addGElement(translation, call)
{
	svg.append("g")
    	.attr("class", "axis")
    	.attr("transform", translation)
    	.call(call);
}

//plot every point in array on graph. 
function addPoints(d, shape)
{
	svg.selectAll(shape)
		.data(d)
        .enter()
        .append(shape)
        .attr(pointObject(shape, d));
        classify(shape);
}

//create and return objects based on given shape.
function pointObject(shape, d)
{
	if (shape == "circle") return {
		cx: function(d) { return xScale(d.x); }, 
		cy: function(d) { return yScale(d.y); },
		r: CIRCLE_RADIUS
	};

	else if (shape == "rect") return {
		width: SQUARE_SIZE,
		height: SQUARE_SIZE,
		x: function (d) { return xScale(d.x); },
		y: function (d) { return yScale(d.y); }
	};
}

//style an object to its classification. 
function classify(shape)
{
	svg.selectAll(shape)
		.attr("stroke", "black")
        .attr("fill", function(d) 
        { 
         	if (d.p == 1.0) return "white";
        	else return "black";
        });
}

function addLegend()
{/*
	key = ["True Positive", "False Positive", "True Negative", "False Negative"];
  	var legend = svg.selectAll(".legend")
      	.data(key)
    	.enter()
    	.append("g")

    //conditional appending. 
    //TO DO. COME BACK AND FIX THIS IF BETTER SOLUTION FOUND. 
    //fix use of constsants in code. 
    .each(function(d, i)
    {
      	part = d3.select(this);
      	if (i < 2) 
      	{
        	part.attr("class", "legendCircle")
        		.append("circle")
        		.attr("cx", WIDTH-12)
        		.attr("cy", 10)
        		.attr("r", 4.5)
        		.attr("stroke", "black")
        		.style("fill", function(d, i) 
          		{ 
            		if (d == "True Positive") return "white" 
            		else return "black"
          		});
      	}

      	else 
      	{
     		part.attr("class", "legendRect")
        		.append("rect")
        		.attr("x", WIDTH - PAD)
       	 		.attr("width", 9)
        		.attr("height", 9)
        		.attr("stroke", "black")
        		.style("fill", function(d, i) 
         	 	{ 
            		if (d == "True Negative") return "white" 
            		else return "black"
          		});
      	}
      	part.attr("transform", "translate(0," + i * PAD + ")");
    });
      
  	// draw legend text
  	legend.append("text")
      	.data(key)
      	.attr("x", WIDTH - 24)
      	.attr("y", 9)
      	.attr("dy", ".35em")
      	.style("text-anchor", "end")
      	.text(function(d) { return d;}) */
}

// d3.legend.js 
// (C) 2012 ziggy.jonsson.nyc@gmail.com
// MIT licence
//using this to actually draw a legend and make it easier. 

(function() {
d3.legend = function(g) {
  g.each(function() {
    var g= d3.select(this),
        items = {},
        svg = d3.select(g.property("nearestViewportElement")),
        legendPadding = g.attr("data-style-padding") || 5,
        lb = g.selectAll(".legend-box").data([true]),
        li = g.selectAll(".legend-items").data([true])

    lb.enter().append("rect").classed("legend-box",true)
    li.enter().append("g").classed("legend-items",true)

    svg.selectAll("[data-legend]").each(function() {
        var self = d3.select(this)
        items[self.attr("data-legend")] = {
          pos : self.attr("data-legend-pos") || this.getBBox().y,
          color : self.attr("data-legend-color") != undefined ? self.attr("data-legend-color") : self.style("fill") != 'none' ? self.style("fill") : self.style("stroke") 
        }
      })

    items = d3.entries(items).sort(function(a,b) { return a.value.pos-b.value.pos})

    
    li.selectAll("text")
        .data(items,function(d) { return d.key})
        .call(function(d) { d.enter().append("text")})
        .call(function(d) { d.exit().remove()})
        .attr("y",function(d,i) { return i+"em"})
        .attr("x","1em")
        .text(function(d) { ;return d.key})
    
    li.selectAll("circle")
        .data(items,function(d) { return d.key})
        .call(function(d) { d.enter().append("circle")})
        .call(function(d) { d.exit().remove()})
        .attr("cy",function(d,i) { return i-0.25+"em"})
        .attr("cx",0)
        .attr("r","0.4em")
        .style("fill",function(d) { console.log(d.value.color);return d.value.color})  
    
    // Reposition and resize the box
    var lbbox = li[0][0].getBBox()  
    lb.attr("x",(lbbox.x-legendPadding))
        .attr("y",(lbbox.y-legendPadding))
        .attr("height",(lbbox.height+2*legendPadding))
        .attr("width",(lbbox.width+2*legendPadding))
  })
  return g
}
})()


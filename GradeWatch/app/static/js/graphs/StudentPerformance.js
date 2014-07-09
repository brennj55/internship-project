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
var WIDTH = 650,
    HEIGTH = 360;

var PAD = 18,
    LEFT_PAD = 100;

//url and id for json and html docs. 
var HTML_ID = "#studentPerformance";

//shape dimensions
var SQUARE_SIZE = 5,
	CIRCLE_RADIUS = 2.5;

//student data and lo/hi values for axis's.
var studentData,
	passes = [],
	fails = [],
	classes = [[], []],
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
function studentPerformanceGraph(studentData) 
{ 
	//initalise and set up the graph.  
	initGraph(studentData);
 	// draw legend, set up Slider
 	initSlider(studentData)
 	addLegend();
}


/* HELPER FUNCTIONS FOR JSON DRIVEN GRAPH. */

//set up the graph. 
function initGraph(data)
{
	studentData = data;
	partitionData(studentData[0]);
	findMaxMin(studentData);
	setScales();

	//create the axis's
    xAxis = d3.svg.axis().scale(xScale).orient("bottom"),
    yAxis = d3.svg.axis().scale(yScale).orient("left");

	//add the axis's
	addGElement("translate(0, "+(HEIGTH-PAD)+")", xAxis, "x")
	addGElement("translate("+(LEFT_PAD-PAD)+", 0)", yAxis, "y")

    //Add all passes and fails on the graph.
    addPoints(classes[1], "circle");  
    addPoints(classes[0], "rect");
}

//seperate the passes from the fails. 
function partitionData(data)
{
	//ensure passes and fails are empty
	//we need to make sure it is fresh for pushing new data
	classes = [[], []];

	//seperate the studentData into passes and fails.
  	for (var i = 0; i < data.length; i++) 
  	{
        if (data[i].c == 1) classes[1].push(data[i]);
        else classes[0].push(data[i]);
  	}
}

//set the x/yMax/Minv values given an array. 
function findMaxMin(data)
{
	//data is an array of two arrays.
	//split two arrays. 
    xArray = getXValues(data);
    yArray = getYValues(data);
	//go through data and find max and mins for domains on axis's. 
    xMax = d3.max(xArray),
    yMax = d3.max(yArray),
    xMin = d3.min(xArray),
    yMin = d3.min(yArray);
}

function getXValues(data)
{
	x = [];
	for (var i = 0; i < data.length; i++)
	{
		for (var j = 0; j < data[i].length; j++)x.push(data[i][j].x);
	}
	return x;
}

function getYValues(data)
{
	y = [];
	for (var i = 0; i < data.length; i++)
	{
		for (var j = 0; j < data[i].length; j++) y.push(data[i][j].y);
	}
	return y;
}

//set up the axis's. Range based on padding and svg size. 
function setScales()
{
    xScale = d3.scale.linear().domain([xMin, xMax]).range([LEFT_PAD, WIDTH-PAD*5]),
    yScale = d3.scale.linear().domain([yMax, yMin]).range([PAD, HEIGTH-PAD*2]);
}

//add a group element given its translation and what to call. 
function addGElement(translation, call, axis)
{
	svg.append("g")
    	.attr("class", axis + " axis")
    	.attr("transform", translation)
    	.call(call);
}

//plot every point in array on graph. 
function addPoints(arrayOfPoints, shape)
{
	svg.selectAll(shape)
		.data(arrayOfPoints)
        .enter()
        .append(shape)
        .each(function (d) { point = d3.select(this); point.attr(pointObject(d)); })
        classify(shape);
}

//create and return objects based on given shape.
function pointObject(d)
{
	if (d.c == 1) 
	{
		return {
			cx: function(d) { return xScale(d.x); }, 
			cy: function(d) { return yScale(d.y); },
			r: CIRCLE_RADIUS,
			class: "point"
		};
	}	
		
	else if (d.c == 0) 
	{
		return {
			width: SQUARE_SIZE,
			height: SQUARE_SIZE,
			x: function (d) { return xScale(d.x); },
			y: function (d) { return yScale(d.y); },
			class: "point"
		};
	}
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
{
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
      	.text(function(d) { return d;})
}

//set up slider.
function initSlider(data)
{
	$(function() 
	{
	    $( "#slider" ).slider
	    ({
	    	value:1,
	      	min: 1,
	      	max: data.length,
	      	step: 1,
	      	slide: function( event, ui ) 
	      	{ 
	      		$( "#amount" ).val( ui.value ); 
	      		nextDataSet(data, ui.value - 1);
            createTable(studentData[ui.value - 1]);
	      	}
	    });
	    $( "#amount" ).val( $( "#slider" ).slider( "value" ) );
	});
}

//slider transition event function. changes values according to slider value
//passed in. 
function nextDataSet(d, value)
{
	//put in the new data.
	partitionData(d[value]);	
	//Update all shapes
	svg.selectAll("circle")
		.data(classes[1])		
		.each(function (d) 
		{ 
				point = d3.select(this) 
				.transition()
				.duration(1000)
				point.attr(pointObject(d)); 

		})
		classify("circle");

	svg.selectAll("rect")
		.data(classes[0])	
		.each(function (d) 
			{ 
				point = d3.select(this) 
				.transition()
				.duration(1000)
				point.attr(pointObject(d));  
			})
		classify("rect")
}

function createTable(studentData)
{
  $( "#sInfo > tr" ).remove();
  $.each(studentData, function(index){
    $('#sInfo').append('<tr><td>' + studentData[index].name + '</td><td>' + studentData[index].student_id + '</td><td>' + studentData[index].y + '</td><td>' + studentData[index].x + '</td></tr>');
  })
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


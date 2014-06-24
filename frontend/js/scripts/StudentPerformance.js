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


var WIDTH = 1000,
    HEIGTH = 350,
    pad = 20,
    left_pad = 100,
    Data_url = '../../../jsons/StudentPerformance.json',
    htmlID = "#studentPerformanceChart";

//set up svg. 
var svg = d3.select(htmlID).append("svg")
	.attr("width", WIDTH).attr("height", HEIGTH)
	.attr("shape-rendering", "auto");


//Async function that will populate data and create graph. 
d3.json(Data_url, function (studentData) 
{ 
	var passes = [];
  	var fails = [];

	//seperate the studentData into passes and fails.
  	for (var i = 0; i < studentData.length; i++) 
  	{
    	//make a point, push it to correct class, 1 if pass, 0 if fail. 
    	point = { x: studentData[i].x, y: studentData[i].y, p: studentData[i].p};
    	if (studentData[i].c == 1) passes.push(point);
    	else fails.push(point);
  	}

  //go through data and find max and mins for domains on axis's. 
  var xMax = d3.max(studentData, function(d) { return d.x; }),
      yMax = d3.max(studentData, function(d) { return d.y; }),
      xMin = d3.min(studentData, function(d) { return d.x; }),
      yMin = d3.min(studentData, function(d) { return d.y; });

  //set up the axis's. Range based on padding and svg size. 
  var xScale = d3.scale.linear().domain([xMin, xMax]).range([left_pad, WIDTH-pad*5]),
      yScale = d3.scale.linear().domain([yMax, yMin]).range([pad, HEIGTH-pad*2]);

  xAxis = d3.svg.axis().scale(xScale).orient("bottom"),
  yAxis = d3.svg.axis().scale(yScale).orient("left");

	//add the axis's
	addGElement("translate(0, "+(HEIGTH-pad)+")", xAxis)
	addGElement("translate("+(left_pad-pad)+", 0)", yAxis)

  //Add all passes
  svg.selectAll("circle")
    .data(passes)
    .enter()
    .append("circle")
    .attr("cx", function (d) { return xScale(d.x); })
    .attr("cy", function (d) { return yScale(d.y); })
    .transition()
    .duration(800)
    .attr("r", 2.5)
    .attr("data-legend",function(d) { return d.name})
    .attr("stroke", "black")
    .attr("fill", function(d) 
    { 
      if (d.p == 1.0) return "white";
      else return "black";
    });

  //Add all fails.   
  svg.selectAll("rect")
    .data(fails)
    .enter()
    .append("rect")
    .attr("width", 5)
    .attr("height", 5)
    .attr("data-legend",function(d) { return d.name})
    .attr("x", function (d) { return xScale(d.x); })
    .attr("y", function (d) { return yScale(d.y); })
    .transition()
    .duration(1000)
    .attr("stroke", "black")
    .attr("fill", function(d) 
    { 
      if (d.p == 1.0) return "white";
      else return "black";
    });
 
  // draw legend
  key = ["True Positive", "False Positive", "True Negative", "False Negative"];
  var legend = svg.selectAll(".legend")
      .data(key)
    .enter().append("g")

    //conditional appending. 
    //TO DO. COME BACK AND FIX THIS IF BETTER SOLUTION FOUND. 
    //fix use of constsants in code. 
    .each(function(d, i){
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
            console.log(d + " " + i);
            if (d == "True Positive") return "white" 
            else return "black"
          });
      }
      
      else 
      {
        part.attr("class", "legendRect")
        .append("rect")
        .attr("x", WIDTH - 18)
        .attr("width", 9)
        .attr("height", 9)
        .attr("stroke", "black")
        .style("fill", function(d, i) 
          { 
            console.log(d + " " + i);
            if (d == "True Negative") return "white" 
            else return "black"
          });
      }
      part.attr("transform", "translate(0," + i * 25 + ")");
    });
      
  // draw legend text
  legend.append("text")
      .data(key)
      .attr("x", WIDTH - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d;})

});


function addGElement(translation, call)
{
	svg.append("g")
    .attr("class", "axis")
    .attr("transform", translation)
    .call(call);
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


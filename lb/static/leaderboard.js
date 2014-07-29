var canvas = d3.select(".chart").append("svg");

canvas.append("text")
	.attr("class", "explanation");

canvas.append("text")
	.attr("class", "confidence");

var yPos = 300;
var xPos = 600;

function render(dataset, id)
{
	//constants
	
	var PI = Math.PI;
	var arcMin = 75;
	var arcWidth = 15;
	var arcPad = 1;

	svg = d3.select("svg");

	//colour scale.
	var colour = d3.scale.linear()
		.range(["hsl(0,100%,50%)", "hsl(100,50%,50%)"])
		.interpolate(interpolateHsl);

	var myIDRange = d3.scale.linear()
		.range(["hsl(219, 100, 20)", "hsl(240,100,33)"])
		.interpolate(interpolateHsl);

	function interpolateHsl(a, b) 
	{
		var i = d3.interpolateString(a, b);
		return function(t) { return d3.hsl(i(t)); };
	}

	//function to draw arcs.
	var drawArc = d3.svg.arc()
		.innerRadius(function(d, i){ return arcMin + i * arcWidth + arcPad })
		.outerRadius(function(d, i){ return arcMin + (i + 1) * arcWidth })
		.startAngle(0)
		.endAngle(function(d){ return d.confidence * 2 * Math.PI; });

	//bind and update.
	var arcs = svg.selectAll("path").data(dataset);

	//function to update transitions.
	function arcTween(d, i)
	{
		var interp = d3.interpolate(this._current, d);
		this._current = d;
		return function(t)
		{
			var temp = interp(t);
			return drawArc(temp, i);
		} 
	};

	//during transition.
	arcs.transition()
		.duration(1000)
		.attr("fill", function(d)
		{ 
			if (d.studentNo == id || d.myID) return myIDRange(d.confidence); 
			else return colour(d.confidence); 
		})
		.attrTween("d", arcTween);

	arcs.enter().append("svg:path")
		.attr("transform", "translate(" + xPos + "," + yPos +")" )
		.attr("fill", function(d)
		{ 
			if (d.studentNo == id || d.myID) return myIDRange(d.confidence); 
			else return colour(d.confidence); 
		})
      	.attr("d", drawArc)
      	.each(function(d){ this._current = d; })
      	.on("click", function(d, i) { if (d.students != undefined) render(d.students, id) })
      	.on("mouseover", mouseover);
}

function initialize(dataset, id) 
{
	var arcMin = 75;    // this should match the arcMin in render()
	render(dataset, id);

    // making the click circle for green arcs
    	if(!d3.selectAll("circle.click-circle")[0].length) 
    	{   

    		d3.select("svg").append("circle")
    			.attr("class", 'click-circle')
        		.attr("transform", "translate(" + xPos + "," + yPos +")" )
        		.attr("r", arcMin*0.85)
        		.attr("fill", "rgba(201, 201, 201, 0.5)")
        		.on("click", function() { render(dataset, id) });
     }

     
}

function mouseover(d)
{
	var output = d.name + " " + d.prediction;
    	d3.select("text").text(output).attr("transform", "translate(" + (xPos-50) + "," + (yPos) +")" );
    	d3.select(".confidence").text(d.confidence).attr("transform", "translate(" + (xPos-50) + "," + (yPos + 30) +")" );
}

function partitionStudents(data, myID)
{
	var split = [];
	var splitFactor = 10;

	for (var i = 0; i < data.length/splitFactor; i++) 
	{
		var name = "Quartile " + (i + 1);
		var sum = 0;
		var myIDPresent = false;
		var arr = data.slice(i*splitFactor, i*splitFactor+splitFactor);
		var prediction;
		
		for (var j = 0; j < arr.length; j++) 
		{ 
			sum += arr[j].confidence; 
			if (arr[j].studentNo == myID) myIDPresent = true;
		}
		sum /= splitFactor;
		if (sum < .4) prediction = "Fail";
		else prediction = "Pass";

		split[i] = {name: name, confidence: sum, prediction: prediction, students: arr, myID: myIDPresent};
	};

	return split;
}

lol = partitionStudents(data.students, myID);
initialize(lol, myID)
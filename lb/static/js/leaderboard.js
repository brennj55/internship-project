var canvas = d3.select("#chart").append("svg").attr("height", 500).attr("width", 1000);

//constants for positioning and colouring.
var yPos = $("#chart").height()/2;
var xPos = $("#chart").width()/2;
var RED = "#c13146";
var BLUE = "#3d5ba9";
var YELLOW = "#ffbc12";

function render(dataset, id)
{
	var scale = d3.scale.linear().domain([1, 15]).range([30, 10]);

	//constants
	var PI = Math.PI;
	var arcMin = 75;
	var arcWidth = scale(dataset.length);
	var arcPad = 1;
	var svg = d3.select("svg");

	//function to draw arcs.
	var drawArc = d3.svg.arc()
		.innerRadius(function(d, i) { return arcMin + i * arcWidth + arcPad + 1})
		.outerRadius(function(d, i) { return arcMin + (i + 1) * arcWidth })
		.startAngle(0)
		.endAngle(function(d){ return d.confidence * 2 * Math.PI; });

	//bind and update.
	var arcs = svg.selectAll("path").data(dataset);

	//function to update transitions.
	function arcTween(d, i)
	{
		var interp = d3.interpolate(this._current, d);
		this._current = d;
		return function(t){ return drawArc(interp(t), i); } 
	};

	//during transition.
	arcs.transition()
		.duration(500)
		.attr("fill", function(d)
		{ 
			if (d.studentNo == id || d.myID) return YELLOW; 
			else if (d.confidence < .4) return RED;
			else return BLUE; 
		})
		.attrTween("d", arcTween);

	arcs.enter().append("svg:path")
		.attr("transform", "translate(" + xPos + "," + yPos +")" )
		.attr("fill", function(d)
		{ 
			if (d.studentNo == id || d.myID) return YELLOW; 
			else if (d.confidence < .4) return RED;
			else return BLUE; 
		})
      	.attr("d", drawArc)
      	.each(function(d){ this._current = d; })
      	.on("click", function(d, i) { if (d.students != undefined) render(d.students, id) })
      	.on("mouseover", mouseover);

    arcs.exit()
    	.transition(1000)
    	.attr("fill", "white")
    	.remove()
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
        	.attr("fill", "#e3e3e3")
        	.on("click", function() { render(dataset, id) });
     }
}

function mouseover(d)
{
	var output = d.name;
	target = output + ": has";
	if (d.confidence < .4) target = target + "n't reached target."
	else target = target + " reached target."
    d3.select("#who").text(target);
}


function partitionStudents(data, myID)
{
	var split = [];
	var splitFactor = Math.sqrt(data.length);

	for (var i = 0; i < splitFactor; i++) 
	{
		var name = "Section " + (i + 1);
		var sum = 0;
		var myIDPresent = false;
		var arr = data.slice(i*splitFactor, i*splitFactor+splitFactor);
		var prediction;
		
		for (var j = 0; j < arr.length; j++) 
		{ 
			sum += arr[j].confidence; 
			if (arr[j].studentNo == myID) myIDPresent = true;
		}
		sum /= arr.length;
		sum = sum.toFixed(2);
		arr.sort(sortStudents);

		split[i] = {name: name, confidence: sum, prediction: prediction, students: arr, myID: myIDPresent};
	}

	split.sort(sortStudents);
	function sortStudents(a, b) { return (a.confidence - b.confidence) }
	return split;
}

initialize(partitionStudents(data.students, myID), myID)

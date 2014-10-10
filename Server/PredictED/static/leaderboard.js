var canvas = d3.select("#chart").append("svg");

canvas.append("text")
	.attr("class", "explanation");

canvas.append("text")
	.attr("class", "confidence");


var yPos = $("#chart").height();
var xPos = $("#chart").width();
//var RED = "#c13146";
var RED = 'red';
var BLUE = "#3d5ba9";
var YELLOW = "#ffbc12";

function render(dataset, id)
{
	//constants
	
	var PI = Math.PI;
	var arcMin = 75;
	var arcWidth = 15;
	var arcPad = 1;

	svg = d3.select("svg");

	function interpolateHsl(a, b) 
	{
		var i = d3.interpolateString(a, b);
		return function(t) { return d3.hsl(i(t)); };
	}

	//function to draw arcs.
	var drawArc = d3.svg.arc()
		.innerRadius(function(d, i)
		{ 
			if (d.name == 'TARGET') return arcMin + i * arcWidth + arcPad + 1
			else return arcMin + i * arcWidth + arcPad +1
		})
		.outerRadius(function(d, i)
		{ 
			if (d.name == 'TARGET') return arcMin + i * arcWidth + arcPad + 1
			else return arcMin + (i + 1) * arcWidth 
		})
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
      	.on("click", function(d, i) { if (d.students != undefined) render(d.students, id) });
      	//.on("mouseover", mouseover);

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
        	.attr("fill", "rgba(201, 201, 201, 0.5)")
        	.on("click", function() { render(dataset, id) });
     }
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

		//arr[arr.length] = {name: 'TARGET', confidence: '.4', prediction: 'Pass'};
		arr.sort(sortStudents);

		split[i] = {name: name, confidence: sum, prediction: prediction, students: arr, myID: myIDPresent};
	}

	//split[data.length/splitFactor] = {name: 'TARGET', confidence: '.4', prediction: 'Pass'};
	split.sort(sortStudents);
	function sortStudents(a, b) { return (a.confidence - b.confidence) }
	return split;
}

initialize(partitionStudents(data.students, myID), myID)

function classifyGraph(classifierData, baseline)	
{
	console.log("I'm here.");
	var weeks = [];
	var data = classifierData;

	var scale = [];
	var bline = [];

	for (var i = 0; i < data.length; i++)
	{
		nextDate = data[i][0];
		dataPoint = data[i][1];
		weeks.push({x: nextDate, y: dataPoint});
		scale.push(dataPoint);

		bline.push({x: baseline[i][0], y: baseline[i][1] });
	}

	var myScale = d3.scale.linear().domain([d3.min(d3.values(scale)), d3.max(d3.values(scale))]).nice();

	var graph = new Rickshaw.Graph( {
		element: document.querySelector("#chart"),
		height: 300,
		width: 750,
		renderer: 'line',
		series: [ 
		{
		    data: weeks, 
		    name: "Week",
		    color: 'black',
		    scale: myScale
		}, 

		{
		    data: bline,
		    name: "Baseline",
		    color: 'grey',
		    scale: myScale
		} ]
	});

	var x_axis = new Rickshaw.Graph.Axis.X( 
	{ 
		graph: graph, 
		tickFormat: function(d) 
		{ 
			var format = d3.time.format("%U");
			return "Week " + format(new Date(d*1000)); 
		}
	});

	var y_axis = new Rickshaw.Graph.Axis.Y.Scaled( {
	        graph: graph,
	        orientation: 'left',
	        tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
	        element: document.getElementById('y_axis'),
	        scale: myScale
	} );

	graph.render();

	var hover = new Rickshaw.Graph.HoverDetail(
	{ 
		graph: graph,
		formatter: function(series, x, y)
		{
			var weekFormat = d3.time.format("%U");
			//var dateFormat = d3.time.format("%x");
			var week = new Date(x * 1000);
			//var date = '<span class="date">' + dateFormat(week) + '</span>';
			var content = series.name + " " + weekFormat(week) + ': <strong>' + y.toFixed(2) + '</strong><br>';
			return content;
		}
	});
}


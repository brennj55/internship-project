function classifier() { $("#classifier").removeClass('hide'); $("#graph2").addClass('hide')}
function performance() { $("#graph2").removeClass('hide'); $("#classifier").addClass('hide')}

$("#stuPerButton").click(performance)
$("#classAccButton").click(classifier)


$(function() 
{
	$( "#slider" ).slider
	({
		value:100,
		min: 0,
		max: 500,
		step: 50,
		
		slide: function( event, ui ) 
		{
		    $( "#amount" ).val( "$" + ui.value );
		}
	});

    $( "#amount" ).val( "$" + $( "#slider" ).slider( "value" ) );
});
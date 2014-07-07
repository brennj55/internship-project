function classifier() { $("#classifier").removeClass('hide'); $("#SPGraph").addClass('hide')}
function performance() { $("#SPGraph").removeClass('hide'); $("#classifier").addClass('hide')}

$("#stuPerButton").click(performance)
$("#classAccButton").click(classifier)

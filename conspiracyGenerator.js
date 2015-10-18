window.onload = function() {
	//alert("hello world");
	document.getElementById("input").onchange = enableSubmit;
	document.getElementById("submit").onclick = processInput;
}

enableSubmit = function() {
	document.getElementById("submit").disabled = false;
}

processInput = function() {
	alert("hello world");
}
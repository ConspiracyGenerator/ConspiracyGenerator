//ask about checking the true file type

// Debug alert function
dAlert = function(string) {
	alert(string)
}

window.onload = function() {
	//alert("hello world");
	document.getElementById("input").onchange = enableSubmit;
	document.getElementById("submit").onclick = processInput;
}

enableSubmit = function() {
	document.getElementById("submit").disabled = false;
}

processInput = function() {

	var file = document.getElementById("input").files[0];
	var imageReg = /\.(jpg|jpeg|png|gif|bmp)$/;
	if (imageReg.test(file.name)) {
		console.log("valid");
	}
	else { console.log("invalid"); }
	
	console.log(document.getElementById("input").files);
	console.log(file)
	
}




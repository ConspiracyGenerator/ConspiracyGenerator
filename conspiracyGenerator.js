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

	// Get file
	var file = document.getElementById("input").files[0];
	
	// Create img
	var img = document.createElement("img");
    img.file = file;
    //document.append(img); // Assuming that "preview" is the div output where the content will be displayed.
    
    var reader = new FileReader();
    reader.onloadend = function () {
		dAlert("done processing")
		img.src = reader.result
		
	}
    reader.readAsDataURL(file);
	
	dAlert("sending file")
	
}




//ask about checking the true file type

// Debug alert function
dAlert = function(string) {
	alert(string)
}

var c, ctx;

window.onload = function() {
	//alert("hello world");
	document.getElementById("input").onchange = enableSubmit;
	document.getElementById("submit").onclick = processInput;
	
	c = document.getElementById("imgC");
	ctx = c.getContext("2d");
	
}

enableSubmit = function() {
	document.getElementById("submit").disabled = false;
}

processInput = function() {

	// Get file
	var file = document.getElementById("input").files[0];
	var imageReg = /\.(jpg|jpeg|png|gif|bmp)$/;
	if (imageReg.test(file.name)) {
		console.log("valid");
	}
	else { console.log("invalid"); }
	
	console.log(document.getElementById("input").files);
	console.log(file)
	
	// Create img
	var img = document.createElement("img");
    img.file = file;
    //document.append(img); // 
    
    var reader = new FileReader();
    reader.onloadend = function () {
		dAlert("done processing")
		img.src = reader.result
		ctx.drawImage(img, 0, 0, c.width, c.height);
	}
    reader.readAsDataURL(file);
	
	dAlert("sending file")
	
}




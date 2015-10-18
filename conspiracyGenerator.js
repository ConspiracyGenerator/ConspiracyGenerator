//ask about checking the true file type

// Debug alert function
dAlert = function(string) {
	alert(string)
}

// Globals
var c, ctx, img

window.onload = function() {
	//alert("hello world");
	document.getElementById("input").onchange = enableSubmit;
	document.getElementById("submit").onclick = processInput;

	document.getElementById("play").onclick = findFaces;
	document.getElementById("reset").onclick = reset;


	document.getElementById("find").onclick = findTriangle;
	document.getElementById("loading").style.visibility = "hidden";
	
	c = document.getElementById("imgC");
	ctx = c.getContext("2d");
	ctx.save();
	setUpZoom()
	
}


findTriangle = function() {
	var input = [
		"data://my/Triangles/needle.png",
		c.toDataURL()
	]
	Algorithmia.client("simdB8OkkCxJQv3HLgp4Z7pRfaM1")
           .algo("algo://orzikhd/FindObjectInImage/0.1.0")
           .pipe(input)
           .then(function (result) {
			   console.log("Is Found?", result.result.found);
		   });
	
}

enableSubmit = function() {
	document.getElementById("submit").disabled = false;
}

processInput = function() {
	
	// Get file
	var file = document.getElementById("input").files[0];
	var imageReg = /\.(JPG|JPEG|PNG|GIF|BMP|jpg|jpeg|png|gif|bmp)$/;
	if (imageReg.test(file.name)) {

		// Create img
		img = document.createElement("img");
		img.file = file;
		//document.append(img); // 
		
		var reader = new FileReader();
		reader.onloadend = function () {
			console.log("done processing");
			img.src = reader.result;
			img.onload = function() {
				
				ctx.drawImage(img, 0, 0, c.width, c.height);
				
				document.getElementById("find").disabled = false;

				redraw();
			}
		}
		reader.readAsDataURL(file);
		console.log("sending file");
		
		document.getElementById("submit").disabled = true;
		
	}
	else { dAlert("ERROR: INVALID IMAGE EXTENSION"); }
	
}

// Clears and redraws the canvas
redraw = function() {
	ctx.clearRect(0, 0, c.width, c.height);
	ctx.drawImage(img, 0, 0, c.width, c.height);
	
}

findFaces = function() {
	
	toggleLoading()
	getFaceData = function(result) {
		var data = result.result;
		var current;
		var smallest;
		if (data.length == 0) {
			smallest = null; 
		}
		else {
			smallest = [data[0].x, data[0].y, data[0].width];
		}
		
		for (var i = 1; i < data.length; i++) {
			current = data[i];
			if (current.width < smallest.width) { //always squares
				smallest = [current.x, current.y, data[0].width];
			}
		}
		
		if (smallest) {
			console.log("smallest existed");
			playSpook([(2 * smallest[0] + smallest[2])/2,
					 (2 * smallest[1] + smallest[2])/2,
					  smallest[2]]);
		}
		else {
			console.log("randomed");
			var rX = Math.floor(Math.random()*(c.width - c.width * 0.25) + c.width * 0.2);
			var rY = Math.floor(Math.random()*(c.height - c.height * 0.25) + c.height * 0.2);
			
			ilum = document.getElementById("ilum");
			ctx.drawImage(ilum, rX, rY, 100, 100);
			playSpook([rX, rY, 100]);

		}
	}
	
	var input = [
		c.toDataURL()
	]
	
	Algorithmia.client("simdB8OkkCxJQv3HLgp4Z7pRfaM1")
           .algo("algo://opencv/FaceDetectionBox/0.1.x")
           .pipe(input)
           .then(getFaceData);	
}

playSpook = function(coordinates) {
	
	toggleLoading();
	
	var audio = document.getElementById("audio")
	audio.play();
	
	
	waitImg = document.getElementById("wait")
	ctx.clearRect(0, 0, c.width, c.height);
	ctx.drawImage(waitImg, 0, 0, c.width, c.height);
	
	timer = setTimeout( function() {
			panZoomPoint(coordinates[0], coordinates[1])

			document.getElementById("reset").disabled = true;
			document.getElementById("input").disabled = true;
			document.getElementById("play").disabled = true;
			document.getElementById("submit").disabled = true;
	},3000)

}

// Zooms slowly to a point playing spooky music.
// Optional callback
panZoomPoint = function(x,y,callback) {
	var scaleFactor = 1.04;
	var endTimer = setTimeout(function() {
		window.clearInterval(timer);
		
		
		document.getElementById("reset").disabled = false;
		document.getElementById("input").disabled = false;
		document.getElementById("play").disabled = false;

		
		if(callback) {
			callback()	
		}
		
	}, 5000);
	
	var timer = setInterval(function() {
		zoomPoint(x,y, scaleFactor);	
	}, 100);
	

		
}

zoomPoint = function(x, y, scaleFactor) {
	
	var pt = ctx.transformedPoint(x,y)
	ctx.translate(pt.x,pt.y)
	ctx.scale(scaleFactor,scaleFactor)
	ctx.translate(-pt.x,-pt.y)
	redraw();
		
}

// Redefines some CTX functions, sets up an 
// SVG matrix for zooming.
setUpZoom = function() {
	var svg = document.createElementNS("http://www.w3.org/2000/svg",'svg');
	xform = svg.createSVGMatrix()
	
	var scale = ctx.scale;
	ctx.scale = function(sx,sy){
			xform = xform.scaleNonUniform(sx,sy);
			return scale.call(ctx,sx,sy);
		}

	var translate = ctx.translate;
	ctx.translate = function(dx,dy){
			xform = xform.translate(dx,dy);
			return translate.call(ctx,dx,dy);
		};
	
	var transform = ctx.transform;
		ctx.transform = function(a,b,c,d,e,f){
			var m2 = svg.createSVGMatrix();
			m2.a=a; m2.b=b; m2.c=c; m2.d=d; m2.e=e; m2.f=f;
			xform = xform.multiply(m2);
			return transform.call(ctx,a,b,c,d,e,f);
		};
		
	var setTransform = ctx.setTransform;
		ctx.setTransform = function(a,b,c,d,e,f){
			xform.a = a;
			xform.b = b;
			xform.c = c;
			xform.d = d;
			xform.e = e;
			xform.f = f;
			return setTransform.call(ctx,a,b,c,d,e,f);
		};
	
	var pt  = svg.createSVGPoint();
	ctx.transformedPoint = function(x,y){
			pt.x=x; pt.y=y;
			return pt.matrixTransform(xform.inverse());
		}

}	

reset = function() {
	
	ctx.clearRect(0, 0, c.width, c.height);
	ctx.restore();
	ctx.save();
	document.getElementById("submit").disabled = false;
	var audio = document.getElementById("audio")
	audio.pause();
	audio.load();
		
}

toggleLoading = function() {

	loading = document.getElementById("loading")
	canvas = canvas = document.getElementById("imgC")
	if(loading.style.visibility == "hidden") {
		canvas = canvas.style.visibility = "hidden"
		loading.style.visibility = "visible";
	} else {
		canvas = canvas.style.visibility = "visible"
		loading.style.visibility = "hidden";
	}
	
	
}






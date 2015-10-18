//ask about checking the true file type

// Debug alert function
function dAlert(string) {
	alert(string)
}

// Globals
var c, ctx, img, scaleFactor

// Random phrases
var phrases = ["Can't explain that, science!", "Lizard man spotted.", "Aliens?", "Illuminati Confirmed.",
"Wake up sheepul!", "Lizard woman spotted.", "Coincidence?"]

window.onload = function() {
	//alert("hello world");
	document.getElementById("input").onchange = enableSubmit;
	document.getElementById("submit").onclick = processInput;

	document.getElementById("play").onclick = findFaces;
	document.getElementById("reset").onclick = reset;


	//document.getElementById("find").onclick = findTriangle;
	document.getElementById("loading").style.visibility = "hidden";
	
	c = document.getElementById("imgC");
	ctx = c.getContext("2d");
	ctx.save();
	setUpZoom()
	
}


function findTriangle() {
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

function enableSubmit() {
	document.getElementById("submit").disabled = false;
}

function processInput() {
	
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
				
				// Approx Scale of zoom, circle, and iluminati
				scaleFactor = 1.01 + 0.002 * img.width/100
				if(scaleFactor <= 1) {
					scaleFactor = 1.01
				} 
				if(scaleFactor > 1.04) {
					scaleFactor = 1.04
				}
				
				
				ctx.canvas.width = img.width
				ctx.canvas.height = img.height
				
				while(img.height > c.height || img.width > c.width) {
					
					img.height -= img.height * 0.1
					img.width -= img.width * 0.1
					
					c.height -= c.height * 0.1
					c.width -= c.width * 0.1
				
				}
				
				
				ctx.drawImage(img, 0, 0, c.width, c.height);
	

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
function redraw() {
	ctx.clearRect(0, 0, c.width, c.height);
	ctx.drawImage(img, 0, 0, c.width, c.height);
	
}

function findFaces() {
	
	toggleLoading()
	function getFaceData(result) {
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

			playSpook([rX, rY, 100], true); 
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

function playSpook(coordinates, randomed = false) {
	
	toggleLoading();
	document.getElementById("play").disabled = true;
	
	var audio = document.getElementById("audio")
	audio.play();

	waitImg = document.getElementById("wait")
	ctx.clearRect(0, 0, c.width, c.height);
	ctx.drawImage(waitImg, 0, 0, c.width, c.height);
	
	timer = setTimeout( function() {
			
			
			panZoomPoint(coordinates[0], coordinates[1],coordinates[2], randomed)

			document.getElementById("reset").disabled = true;
			document.getElementById("input").disabled = true;
			document.getElementById("submit").disabled = true;
	},3000)

}

// Zooms slowly to a point playing spooky music.
function panZoomPoint(x,y,width, randomed) {
	var endTimer = setTimeout(function() {
		window.clearInterval(timer);
		var r = width * .2;
		
		// Draw circle
		drawCircle(x,y,r);

		// Draw illuminati
		ilum = document.getElementById("ilum")

		ctx.drawImage(ufo, x - r/2, y - r/2, r, r);
		
		document.getElementById("reset").disabled = false;
		
		document.getElementById("input").disabled = false;
		document.getElementById("play").disabled = false;
		document.getElementById("submit").disabled = false;
		document.getElementById("input").style.display = "none";
		document.getElementById("play").style.display = "none";
		document.getElementById("submit").style.display = "none";

		title = document.getElementById("title")
		random = Math.floor(Math.random() * 7)
		phrase = phrases[random]
		
		title.innerHTML = phrase
		
		
	}, 5000 * scaleFactor);
	
	var timer = setInterval(function() {
		zoomPoint(x,y, scaleFactor);	
	}, 100);
	
		
}

function zoomPoint(x, y, scaleFactor) {
	
	var pt = ctx.transformedPoint(x,y);
	ctx.translate(pt.x,pt.y);
	ctx.scale(scaleFactor,scaleFactor);
	ctx.translate(-pt.x,-pt.y);
	
	redraw();
		
}

// Redefines some CTX functions, sets up an 
// SVG matrix for zooming.
function setUpZoom() {
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

function reset() {
	
	location.reload()

}

function toggleLoading() {

	var loading = document.getElementById("loading");
	
	if(loading.style.visibility == "hidden") {
		c.style.visibility = "hidden"
		loading.style.visibility = "visible";
	} else {
		c.style.visibility = "visible"
		loading.style.visibility = "hidden";
	}
	
}

// Draw a circle on the ctx with the given radius and center.
function drawCircle(x,y,r) {
	var centerX = x;
    var centerY = y;
    var radius = r
	
	
	ctx.beginPath();
	ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);

	ctx.lineWidth = 2 * scaleFactor;
	ctx.strokeStyle = 'red';
	ctx.stroke();

}

	





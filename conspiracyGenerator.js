//ask about checking the true file type

// Debug alert function
function dAlert(string) {
	alert(string)
}

// Globals
var c, ctx, img, scaleFactor

// Random phrases
var phrases = ["Can't explain that, science!", "Lizard man spotted."
, "Aliens?", "Illuminati Confirmed."
, "Wake up sheepul!", "Lizard woman spotted.", "Coincidence?"]

window.onload = function() {
	//alert("hello world");
	document.getElementById("input").onchange = processInput;

	document.getElementById("play").onclick = findPoint;
	document.getElementById("reset").onclick = reset;

	document.getElementById("loading").style.visibility = "hidden";
	
	c = document.getElementById("imgC");
	ctx = c.getContext("2d");
	ctx.save();
	setUpZoom()
	
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
				
				while (img.width > 2048) {
					img.width = img.width / 2;
				}
				while (img.height > 2048) {
					img.height = img.height / 2;	
				}
				
				//if (img.height > 
				ctx.canvas.width = img.width
				ctx.canvas.height = img.height
				
				
				
				ctx.drawImage(img, 0, 0, img.width, img.height, 0,0,c.width, c.height);
	

				redraw();
			}
		}
		reader.readAsDataURL(file);
		console.log("sending file");
		
	}
	else { dAlert("ERROR: INVALID IMAGE EXTENSION"); }
	
}

// Clears and redraws the canvas
function redraw() {
	ctx.clearRect(0, 0, c.width, c.height);
	ctx.drawImage(img, 0, 0, c.width, c.height);
	
}

function findPoint() {
	
	toggleLoading()
	document.getElementById("play").disabled = true;
	document.getElementById("input").disabled = true;

	function getTriangleData(result) {	
		
		var raw = result.result.found;
		var triangles = [];
		for (var i = 0; i < raw.length; i++) {
			triangles.push([raw[i].center.x, raw[i].center.y]);
		}
		console.log("triangles", triangles);
		
		function getFaceData(result) {
			var data = result.result;
			var faces = [];
			for (var i = 0; i < data.length; i++) {
				faces.push([data[i].x, data[i].y, data[i].width / 2]);
				//x, y, radius
			}
			console.log("faces", faces);
			var rX = Math.floor(Math.random()*(c.width - c.width * 0.25) + c.width * 0.2);
			var rY = Math.floor(Math.random()*(c.height - c.height * 0.25) + c.height * 0.2);
			var noTriangles = true;
			var change, fX, fY, fR, tX, tY;
			
			for (var i = 0; i < triangles.length; i++) {
				for (var j = 0; j < faces.length; i++) {
					tX = triangles[i][0];
					tY = triangles[i][1];
					fX = faces[j][0]; 
					fY = faces[j][1]; 
					fR = faces[j][2];						
						
					if (((tX < (fX - fR)) || (tX > (fX + fR))) 
					 && ((tY < (fY - fR)) || (tY > (fY + fR)))) {
						rX = tX;
						rY = tY;
						console.log("using triangle", rX, rY);
						noTriangles = false;
						break;
					}		
				}
			}
			
			if (noTriangles) {
				do {
					console.log("ran");
					change = false;
					for (var i = 0; i < faces.length; i++) {
						fX = faces[i][0]; 
						fY = faces[i][1]; 
						fR = faces[i][2];
						if (((rX > (fX - fR)) && (rX < (fX + fR))) 
						 || ((rY > (fY - fR)) && (rY < (fY + fR)))) {
							 change = true;
						 }
					}
				} while (change);
				console.log("final", [rX, rY]);
				 
			}
			playSpook([rX, rY]);
			
		}
		
		var input2 = [
			c.toDataURL()
		]

		Algorithmia.client("simdB8OkkCxJQv3HLgp4Z7pRfaM1")
				   .algo("algo://opencv/FaceDetectionBox/0.1.x")
				   .pipe(input2)
				   .then(getFaceData);			
	}
	
	var input1 = [
		c.toDataURL(),
		3 //triangles
	]
	
	Algorithmia.client("simdB8OkkCxJQv3HLgp4Z7pRfaM1")
			   .algo("algo://opencv/FindPolygonsInImage/0.1.2")
			   .pipe(input1)
			   .then(getTriangleData);
			   	
}

function playSpook(coordinates) {
	
	toggleLoading();
	
	var audio = document.getElementById("audio")
	audio.play();

	waitImg = document.getElementById("wait")
	ctx.clearRect(0, 0, c.width, c.height);
	ctx.drawImage(waitImg, 0, 0, c.width, c.height);
	
	timer = setTimeout( function() {

			panZoomPoint(coordinates[0], coordinates[1])
	},3000)

}

// Zooms slowly to a point playing spooky music.
// Optional callback
function panZoomPoint(x, y, callback) {
	var endTimer = setTimeout(function() {
		window.clearInterval(timer);
		var r = 20; //magic constant; deal with it

		// Draw circle
		drawCircle(x,y,r);

		// Draw illuminati
		ilum = document.getElementById("ilum")
		/*
		for (var i = 0.0; i < 1.0; i+= .00005) {
			setTimeout(function() {
				ilum.style.opacity = i.toString();
				console.log("beep");
				ctx.drawImage(ilum, x - r/2, y - r/2, r, r);
			}, 1000);
		}
		*/
		ctx.drawImage(ilum, x - r/2, y - r/2, r, r);

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
	var title = document.getElementById("title");
	
	if(loading.style.visibility == "hidden") {
		c.style.visibility = "hidden"
		loading.style.visibility = "visible";
		title.innerHTML = "Conspiring"
	} else {
		c.style.visibility = "visible"
		loading.style.visibility = "hidden";
		title.innerHTML = "Conspiracy Generator"
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

	





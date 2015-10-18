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

	document.getElementById("play").onclick = findPoint;
	document.getElementById("reset").onclick = reset;

	document.getElementById("loading").style.visibility = "hidden";
	
	c = document.getElementById("imgC");
	ctx = c.getContext("2d");
	ctx.save();
	setUpZoom()
	
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
				
				scaleFactor = 1.01 + 0.002 * img.width/100
				//dAlert(scaleFactor)
				if(scaleFactor <= 1) {
					scaleFactor = 1.01
				} 
				if(scaleFactor > 1.04) {
					scaleFactor = 1.04
				}

				
				ctx.drawImage(img, 0, 0, c.width, c.height);
				
				//document.getElementById("find").disabled = false;

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

function findPoint() {
	
	toggleLoading()


	function getTriangleData(result) {	
		
		var triangles = result;
		console.log(triangles);
		
		function getFaceData(result) {
			var data = result.result;
			console.log(data);
			var faces = [];
			for (var i = 0; i < data.length; i++) {
				faces.push([data[i].x, data[i].y, data[i].width / 2]);
				//x, y, radius
			}
			console.log(faces);
			var rX = Math.floor(Math.random()*(c.width - c.width * 0.25) + c.width * 0.2);
			var rY = Math.floor(Math.random()*(c.height - c.height * 0.25) + c.height * 0.2);
			var change, fX, fY, fR;
			
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

			document.getElementById("reset").disabled = true;
			document.getElementById("input").disabled = true;
			document.getElementById("play").disabled = true;
			document.getElementById("submit").disabled = true;
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
		ilum = document.getElementById("ilum");

		ctx.drawImage(ilum, x - r/2, y - r/2, r, r);
		
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
		
		if(callback) {
			callback()	
		}
		
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

	





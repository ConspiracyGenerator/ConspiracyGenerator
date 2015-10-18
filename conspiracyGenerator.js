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
	document.getElementById("play").onclick = (function() {
		return panZoomPoint(400,250)
	})
	document.getElementById("reset").onclick = reset

	
	c = document.getElementById("imgC");
	ctx = c.getContext("2d");
	setUpZoom()
	
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
	img = document.createElement("img");
    img.file = file;
    //document.append(img); // 
    
    var reader = new FileReader();
    reader.onloadend = function () {
		console.log("done processing")
		img.src = reader.result;
		img.onload = function() {
			redraw();
		}
	}
    reader.readAsDataURL(file);
	
	console.log("sending file")
	
}

// Clears and redraws the canvas
redraw = function() {
	ctx.clearRect(0, 0, c.width, c.height);
	ctx.drawImage(img, 0, 0, c.width, c.height);
	
}

panZoomPoint = function(x,y) {
	var scaleFactor = 1.05;
	var endTimer = setTimeout(function() {
		window.clearInterval(timer);
		dAlert("done!");
	}, 5000);
	
	var timer = setInterval(function() {
		zoomPoint(x,y, scaleFactor);	
	}, 100);
	
	
	var audio = document.getElementById("audio")
	audio.play();
		
}

zoomPoint = function(x, y, scaleFactor) {
	
	var pt = ctx.transformedPoint(x,y)
	ctx.translate(pt.x,pt.y)
	ctx.scale(scaleFactor,scaleFactor)
	ctx.translate(-pt.x,-pt.y)
	redraw();
		
}

// Redefines some CTX functions and sets up an 
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
	var audio = document.getElementById("audio")
	audio.pause();
	audio.load();
		
}






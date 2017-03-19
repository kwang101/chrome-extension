function Coverloader(title, year, img_src, attach_link) {
	var self = this;
	this.title = title;
	this.year = year;
	this.img_src = img_src;
	this.img = new Image();
	this.img.src = this.img_src;
	this.attach_point = attach_link;
	
	this.img.onload = function() {
		addEvent(attach_link, "click", function() {
			self.renderImageData();
			self.download();
		});
	}
}

Coverloader.prototype.download = function() {
	//console.log("start packaging");
	var zip = new JSZip();
	var img = zip.folder(this.title+" ("+this.year+")");
	img.file("cover.png", this.imgData, {base64: true});
	var content = zip.generate();
	//console.log("packaging done");
	chrome.tabs.create({url:"data:application/zip;base64,"+content});
}

Coverloader.prototype.renderImageData = function() {
	//console.log("start rendering");
	var canvas = document.createElement("canvas");
	canvas.width = this.img.width;
    canvas.height = this.img.height;
	
	var context = canvas.getContext("2d");
	context.drawImage(this.img, 0, 0);
	this.imgData = canvas.toDataURL("image/png").replace(/^data:image\/(png|jpg);base64,/, "");//.split("base64")[1];

	
	//console.log("rendering...done");
}
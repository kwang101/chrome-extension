function Suggestion(index, id){
	this.container = document.createElement("div");
	this.container.setAttribute("class", "holder"+(index%2==0 ? " holder_c": ""));
	
	this.index = index;
	this.id = id;
}

Suggestion.prototype.container = null;
Suggestion.prototype.index = 0;
Suggestion.prototype.img_url = "";

Suggestion.prototype.setImage = function(img_url) {
	var self = this;
	
	this.img_url = img_url;
	
	var img = document.createElement("div");
	img.setAttribute("class", "img");
	
	var img_src = document.createElement("img");
	img_src.setAttribute("class", "img_src");
	img_src.src = img_url;
	img.appendChild(img_src);
	
	if (this.id != null) {
	  //now the whole container links instead of just img
		addEvent(this.container, "click", function() {
			if (self.id.match(/tt\d+/))
				chrome.tabs.create({url:"http://www.imdb.com/title/"+self.id+"/"});
			else if (self.id.match(/nm\d+/))
				chrome.tabs.create({url:"http://www.imdb.com/name/"+self.id+"/"});
		});
	}
	
	this.container.appendChild(img);
}

Suggestion.prototype.setName = function(name_str, year) {
	this.name_str = name_str;
	this.year = year;
	
	this.name = document.createElement("div");
	this.name.setAttribute("class", "name");
	var name_parts = name_str.split(' ');
	var linelength = 0;
	for (var n in name_parts) {
		if (linelength+name_parts[n].length >= 25 && !(n == name_parts.length-1 && name_parts[n].length <= 2) ) {
			linelength = 0;
			this.name.innerHTML += "<br>";
		}
		this.name.innerHTML += name_parts[n]+" ";
		linelength += name_parts[n].length+1;
		if (n == name_parts.length-1 && linelength+4 >= 25)
			this.name.innerHTML += "<br>";
	}
	
	if (year)
		this.name.innerHTML += "("+year+")";
	this.container.appendChild(this.name);
}

Suggestion.prototype.prepareRating = function() {
	this.star = document.createElement("div");
	this.star.setAttribute("class", "star");
	this.star.setAttribute("id", "star_"+this.index);
	this.star_text = document.createElement("div");
	this.star_text.setAttribute("class", "star_text");
	this.star_text.setAttribute("id", "star_text_"+this.index);
	this.star_text.textContent = "7.5";
	this.star.appendChild(this.star_text);
	
	this.container.appendChild(this.star);
	
	var sep = document.createElement("div");
	sep.setAttribute("class", "seperator");
	
	this.container.appendChild(sep);
}

Suggestion.prototype.setRating = function(rating) {
	if (rating == "-")
		return;
	this.star.style.display = "block";
	this.star_text.textContent = rating;
}

Suggestion.prototype.loadRating = function() {
	var self = this;
	
	if (!this.id.match(/tt\d+/))
		return;
		
	RatingStorage.load(this.id, function(r){
		if (r != null)
			self.setRating(r);
		else
			self.requestRating();
	});
}

Suggestion.prototype.requestRating = function() {
	//console.log("Request new rating: "+this.id);
	var self = this;
	var req = new XMLHttpRequest();
	req.open(
		"GET",
		"http://www.imdb.com/title/"+this.id+"/",
		true);
	req.onreadystatechange = function (){
	};
	req.onload = function() {
		if (req.status == 200) {
			var rating = "-";
			if (req.responseText.match("star-box-giga-star\">"))
				rating = req.responseText.split("star-box-giga-star\">")[1].split("<")[0];
			RatingStorage.save(self.id, rating);
			self.setRating(rating);
		}
	};
	req.send(null);
}

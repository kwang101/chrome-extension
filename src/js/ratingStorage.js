function RatingStorage() {
}

RatingStorage.db = [];

RatingStorage.init = function() {
	if ("date" in localStorage)
	{
		var today = new Date();
		n = today.getDate();
		if (n != localStorage["date"])
			localStorage.clear();
		RatingStorage.saveCurrentDate();
	}
	else
		RatingStorage.saveCurrentDate();
}

RatingStorage.saveCurrentDate = function() {
	
	var today = new Date();
	n = today.getDate();
	localStorage["date"] = n;
}

RatingStorage.save = function(id, rating) {
	localStorage[id] = rating;
}

RatingStorage.load = function(id, f) {
	if (id in localStorage)
		f(localStorage[id]);
	else
		f(null);	
}


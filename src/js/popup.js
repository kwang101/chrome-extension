function addEvent( obj, type, fn )
{
   if (obj.addEventListener) {
        //console.log("add eventlistener");
      obj.addEventListener( type, fn, false );
   } else if (obj.attachEvent) {
      obj["e"+type+fn] = fn;
      obj[type+fn] = function() { obj["e"+type+fn]( window.event ); }
      obj.attachEvent( "on"+type, obj[type+fn] );
   }
}

function removeEvent( obj, type, fn )
{
   if (obj.removeEventListener) {
      obj.removeEventListener( type, fn, false );
   } else if (obj.detachEvent) {
      obj.detachEvent( "on"+type, obj[type+fn] );
      obj[type+fn] = null;
      obj["e"+type+fn] = null;
   }
}

function ImdbAPI() {
    var self = this;
    this.input = document.getElementById("serach_in");
    this.results = document.getElementById("results");
    addEvent(this.input, "keyup", function() {
        self.search(self.input.value);
    });
}

ImdbAPI.prototype.input = null;

ImdbAPI.prototype.db = [];

ImdbAPI.prototype.last_search = "";

ImdbAPI.prototype.last_results = {};

ImdbAPI.prototype.load_rating = function(str, i, id) {
    var self = this;
    
    //console.log("do new request");
    
    var req = new XMLHttpRequest();
    req.open(
        "GET",
        "http://www.imdb.com/title/"+id+"/",
        true);
    req.onreadystatechange = function (){
    };
    req.onload = function() {
        if (req.status == 200) {
            if (str == self.last_search && req.responseText.match(/star-box-giga-star/)) {
                //console.log("Rating: "+(req.responseText.match(/star-box-giga-star/) ? "found" : "not found"));
                document.getElementById("star_"+i).style.display = "block";
                var rating = req.responseText.split("star-box-giga-star\">")[1].split("<")[0];
                
                document.getElementById("star_text_"+i).textContent = rating;
            }
        }
    };
    req.send(null);
}

ImdbAPI.prototype.addSuggestion = function(entry, i, str) {
    var self = this;
    
    var suggestion = new Suggestion(i, entry.id);
    suggestion.setImage(("i" in entry && entry.i.length > 0) ? entry.i[0] : "../../images/nopic.png");
    suggestion.setName(entry.l, entry.y);
    suggestion.prepareRating();
    this.results.appendChild(suggestion.container);
    
    suggestion.loadRating();
    
    suggestion.createDownload();
    
    return entry.l.length*12+107;
}

ImdbAPI.prototype.showResults = function(results) {
    while ( this.results.hasChildNodes() ) {
        this.results.removeChild( this.results.firstChild );
    }
    
    this.last_results = results;
    
    var width = 250;
    if (results){
        var index = 0;
        for (var i in results.d) {
            if (results.d[i].id.match(/tt\d+/) || results.d[i].id.match(/nm\d+/)) {
                var w = this.addSuggestion(results.d[i], index, results.q);
                index++;
                if (w > width)
                    width = w;
            }
        }
    }
    //document.body.style.width = (width + 1) + "px";
}

ImdbAPI.prototype.search = function (str) {
    var self = this;
    
    str = str.replace(" ", "_");
    str = str.toLowerCase();
    
    if (str.length == 0)
        this.showResults(null);
        
    if (str in this.db)
        this.showResults(this.db[str]);
    else
        this.request(str);
}

ImdbAPI.prototype.request = function (str) {
    var self = this;
    
    //console.log("do new request");
    
    var req = new XMLHttpRequest();
    req.open(
        "GET",
        "http://sg.media-imdb.com/suggests/"+str[0]+"/"+str+".json",
        true);
    req.onreadystatechange = function (){
    };
    req.onload = function() {
        if (req.status == 200) {
            var data = req.responseText.split("imdb$"+str)[1];
            data = data.slice(1, data.length-1);
            //console.log("IMDB says: "+data);
            
            self.last_search = str;
            self.db[str] = JSON.parse(data);
            self.showResults(self.db[str]);
            
        }
        else if (req.status == 403) {
            var reg = new RegExp(this.last_search,"i");
            if (!str.match(reg) && str.length > 2) //if not based on last search remove the last character and do it again
              //for some unknown reason i have to call this function twice so it actually returns something on the second call...bug???
              str.substr(0, str.length-1);
                self.search(str.substr(0, str.length-1));
        }
            
    };
    req.send(null);
}

function main() {
    RatingStorage.init();
    var api = new ImdbAPI();
}

addEvent(window, "load", main);

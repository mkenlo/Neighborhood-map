
/*
    FourSquare url API example
    https://api.foursquare.com/v2/venues/search?client_id=CLIENT_ID&client_secret=CLIENT_SECRET&near=CITY&query=SEARCH_TERM
*/
var FS_CLIENT_ID = "IB01ABMRAHFUHH1QPEMSMCPP1MN31ABNCWPHKINMGWOSO4EF";
var FS_CLIENT_SECRET = "WBU23PY5WFX1F3TEM0MJ1DTSVIDPBWN1QNA1PKNP14HKM3AP";
var FS_URL= "https://api.foursquare.com/v2/venues/search?client_id=%clt_id%&client_secret=%clt_scrt%&v=20130815&near=%city%";


var markers=[];

// defaults markers to initialise the map
defaultMarkers =[
        new Locations("Ike's Food & Cocktails","(612) 746-4537","50 S 6th St","",44.97818705436708,-93.27229499816895),
        new Locations("Eli's East Food & Cocktails","(612) 331-0031","815 E Hennepin Ave","#",44.99128282822349,-93.24738264083862),
        new Locations("Midnord Empanada Food truck","unavailable","unavailable","#",44.97596890779807,-93.27159452192403),
        new Locations("Maruso Street Food Bar","(612) 333-0100", "715 E Hennepin Ave","#",44.97760063074655,-93.2754345812601),
        new Locations("The House Of Hunger Food Truck","unavailable","unavailable","#",44.97611524414878,-93.27146677068872)];


var map;
function initMap() {
   
    var mapOptions = {
      center: {lat: 38.9165087, lng: -77.2482606}, // coordinates for a random place in Minneapolis, MN
      zoom: 13
    }
    map = new google.maps.Map(document.getElementById('map'), mapOptions);   
    // add defaults markers on map
    updateMap(map, defaultMarkers);

}

function toggleBounce() {

  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
  }
}

function updateMap(map, markers){
    
    var bounds = new google.maps.LatLngBounds();
    // add marker on map
    for( i = 0; i < markers.length; i++ ) {
        var content = "<div class='panel panel-marker'><div class='panel-heading'>%name%</div><div class='panel-body'>%description%</div></div>";
        var position = new google.maps.LatLng(markers[i].lat, markers[i].lng);
        bounds.extend(position);
        marker = new google.maps.Marker({
            position: position,
            map: map,
            animation: google.maps.Animation.DROP,
            title: markers[i].name
        });
        // add content information for each marker
        content = content.replace("%name%",markers[i].name);
        description = "<ul class='panel-marker-list'>";
        description += "<li><span class='glyphicon glyphicon-earphone'></span> "+markers[i].contact+"</li>";
        description += "<li><span class='glyphicon glyphicon-map-marker'></span> "+markers[i].fulladress+"</li>";
        description += "<li><span class='glyphicon glyphicon-link'></span> &nbsp;<a href='"+markers[i].url+"'>"+markers[i].url+"</a></li>";
        description += "</ul>";
        content = content.replace("%description%",description);
        
        /* add Listener for each marker*/
        var infoWindow = new google.maps.InfoWindow()
        
        google.maps.event.addListener(marker, 'click', (function(marker,content) {
            return function() {
                infoWindow.setContent(content);
                infoWindow.open(map, marker);
            }
        })(marker,content)); 

        // Event that closes the Info Window with a click on the map
        google.maps.event.addListener(map, 'click', function() {
            infoWindow.close();
        });
        // add some animations on marker
        marker.addListener('click', toggleBounce);
    }
       
    map.fitBounds(bounds);

    // apply when window is resize
    google.maps.event.addDomListener(window, 'load', initMap);
    google.maps.event.addDomListener(window, "resize", function() {
    var center = map.getCenter();
    map.setZoom(8);
    google.maps.event.trigger(map, "resize");
    map.setCenter(center); 
});
        
}

function Locations(name, contact, fulladress, url, lat, lng){
    var self = this;
    self.name= name;
    self.contact = contact;
    self.url = url;
    self.fulladress = fulladress;
    self.lat = lat;
    self.lng = lng;
    
}


function MapViewModel() {
    
    var self = this;
    self.city = ko.observable("Minneapolis,MN");
    self.fsError = ko.observable("");
    self.filter = ko.observable("");
    self.listVenues = ko.observableArray(defaultMarkers);
    
    self.filterList = function(data, event) {
      
        var filter = self.filter().toString().toLowerCase();
        if(!filter) { 
            updateMap(map, self.listVenues());
            return self.listVenues;
        } else {
            result = [];
           
            $.each(self.listVenues(), function(i,item){
                if(item.name.toLowerCase().startsWith(filter))                    
                    result.push(item);
                                    
            });
            
            if(result.length >0){
                self.listVenues.removeAll();
                updateMap(map, result);
                return self.listVenues(result);
            }
            else{
                updateMap(map, self.listVenues());
                return self.listVenues;
            }
                      
        }
    };
  

    self.onSubmit = function(){
        
        var url = FS_URL.replace("%clt_id%",FS_CLIENT_ID);
        url = url.replace("%clt_scrt%", FS_CLIENT_SECRET);
        url = url.replace("%city%",self.city());
       // url = url.concat("&query=",self.filter());
        url = url.concat("&limit=10");  
        
     
        $.getJSON(url,function(result){
            self.listVenues.removeAll();

            $.each(result.response.venues, function(id, venue){
                contact= venue.contact.formattedPhone;
                address = venue.location.formattedAddress[0];
                self.listVenues.push(new Locations(venue.name,contact, address, venue.url,venue.location.lat,venue.location.lng));
                markers.push(new Locations(venue.name,contact, address,venue.url,venue.location.lat,venue.location.lng));                               
            });
           
           updateMap(map, markers);
           
        }).error(function(){
            self.fsError("Oops!! Sorry, for some reasons the request failed ");
            console.log("FourSquare request failed");
        });
    }
  
   
};

ko.applyBindings(new MapViewModel());


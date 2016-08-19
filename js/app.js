
/*
    FourSquare url API example
    https://api.foursquare.com/v2/venues/search?client_id=CLIENT_ID&client_secret=CLIENT_SECRET&near=CITY&query=SEARCH_TERM
*/
var FS_CLIENT_ID = "IB01ABMRAHFUHH1QPEMSMCPP1MN31ABNCWPHKINMGWOSO4EF";
var FS_CLIENT_SECRET = "WBU23PY5WFX1F3TEM0MJ1DTSVIDPBWN1QNA1PKNP14HKM3AP";
var FS_URL= "https://api.foursquare.com/v2/venues/search?client_id=%clt_id%&client_secret=%clt_scrt%&v=20130815&near=%city%";






// defaults markers to initialize the map
defaultMarkers =[
        new Locations("Ike's Food & Cocktails","(612) 746-4537","50 S 6th St","",44.97818705436708,-93.27229499816895),
        new Locations("Eli's East Food & Cocktails","(612) 331-0031","815 E Hennepin Ave","#",44.99128282822349,-93.24738264083862),
        new Locations("Midnord Empanada Food truck","unavailable","unavailable","#",44.97596890779807,-93.27159452192403),
        new Locations("Maruso Street Food Bar","(612) 333-0100", "715 E Hennepin Ave","#",44.97760063074655,-93.2754345812601),
        new Locations("The House Of Hunger Food Truck","unavailable","unavailable","#",44.97611524414878,-93.27146677068872)];


var map;
var infoWindow;

function initMap() {
   
    var mapOptions = {
      center: {lat: 38.9165087, lng: -77.2482606}, // coordinates for a random place in Minneapolis, MN
      zoom: 13
    }
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    infoWindow = new google.maps.InfoWindow();

    //set markers
    for(i=0; i< defaultMarkers.length; i++){
        var position = new google.maps.LatLng(defaultMarkers[i].lat, defaultMarkers[i].lng);
        if(!defaultMarkers[i].marker()){
          
            defaultMarkers[i].marker(new google.maps.Marker({
            position: position,
            map: map,
            title: defaultMarkers[i].name,
            animation: google.maps.Animation.DROP
            }));
        }
    }    
    // add defaults markers on map
    updateMap(map, defaultMarkers);

}
function errorMap(){
    // this is called if the google map API failed

}

function removeDefaultMarkers(){
    
     for(i=0; i< defaultMarkers.length; i++){
        
        if(defaultMarkers[i].marker()){
            defaultMarkers[i].marker().setMap(null);
            
        }
    }
    
}

function infoWindowContent(location){
    var content = "<div class='panel panel-marker'><div class='panel-heading'>%name%</div><div class='panel-body'>%description%</div></div>";
    content = content.replace("%name%",location.name);
    
    var description = "<ul class='panel-marker-list'>";
    var contact = location.contact ? location.contact:"unavailable";
    var fulladdress = location.fulladdress ? location.fulladdress : "unavailable";
    var url = link = location.url;
    description += "<li><span class='glyphicon glyphicon-earphone'></span> "+contact+"</li>";
    description += "<li><span class='glyphicon glyphicon-map-marker'></span> "+fulladdress+"</li>";
    if(!url || url=="#"){
        url = "unavailable";
        link = "#";
    }
    description += "<li><span class='glyphicon glyphicon-link'></span> &nbsp;<a href='"+link+"'>"+url+"</a></li>";
    description += "</ul>";

    content = content.replace("%description%",description);
    return content;

}

function updateMap(map, markers){
    
    var bounds = new google.maps.LatLngBounds();
    
    // add marker on map
    for( i = 0; i < markers.length; i++ ) {
        var position = new google.maps.LatLng(markers[i].lat, markers[i].lng);
        
        if (markers[i].showMe()){

            bounds.extend(position);
            var marker = markers[i].marker();          
            var content = infoWindowContent(markers[i]);

           google.maps.event.addListener(marker, 'click', (function(marker,content) {
                return function() {
                    infoWindow.setContent(content);
                    infoWindow.open(map, marker);
                    marker.setAnimation(google.maps.Animation.BOUNCE);
                    setTimeout(function(){ marker.setAnimation(null); }, 750);
                }
            })(marker,content)); 
            // Event that closes the Info Window with a click on the map
            google.maps.event.addListener(map, 'click', function() {
                infoWindow.close();
                
            });
            
        
        } // end if       

    } //end for
       
    map.fitBounds(bounds);

    // apply when window is resize
    //google.maps.event.addDomListener(window, 'load', initMap);
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
    self.showMe = ko.observable(true);
    self.marker = ko.observable();
        
  
}


function MapViewModel() {
    

    var self = this;
    self.city = ko.observable();
    self.fsError = ko.observable("");
    self.filter = ko.observable("");
    self.listVenues = ko.observableArray(defaultMarkers);
    
    self.filterList = function(data, event) {

        google.maps.event.addDomListener($("#filter"), 'click', function() {
            infoWindow.close();        
        });

        var filter = self.filter().toString().toLowerCase();
        if(filter) { 
              
            $.each(self.listVenues(), function(i,item){
                test = item.name.toLowerCase().indexOf(filter) >-1;
                if(!test) {
                    item.marker().setVisible(false);
                    item.showMe(false);
                    
                }
                else if((event.keyCode == 8 || event.keyCode ==46) & !item.showMe()){
                    item.marker().setVisible(true);
                    item.showMe(true);
                }                    
            });
            
        }
        else{
            //reset marker listVenue
             $.each(self.listVenues(), function(i,item){
                item.marker().setVisible(true);
                item.showMe(true);
                                  
            });
        }
       
    };
  
    self.clickVenue = function(venue){
       
        $.each(self.listVenues(), function(i,item){
            if(item!=venue){
                item.marker().setVisible(false);
                item.showMe(false);
                self.filter(venue.name);

                infoWindow.setContent(infoWindowContent(venue));                
                infoWindow.open(map, venue.marker());
                
            }
            
                              
        });
        
    }
    self.onSubmit = function(){
        
        var url = FS_URL.replace("%clt_id%",FS_CLIENT_ID);
        url = url.replace("%clt_scrt%", FS_CLIENT_SECRET);
        url = url.replace("%city%",self.city());
        url = url.concat("&query=food,restaurant"); 
        url = url.concat("&limit=10");  
       
     
        $.getJSON(url,function(result){

            removeDefaultMarkers();
            self.listVenues.removeAll();
            

            $.each(result.response.venues, function(id, venue){
                contact= venue.contact.formattedPhone;
                address = venue.location.formattedAddress[0];

                var location = new Locations(venue.name,contact, address, venue.url,venue.location.lat,venue.location.lng);
                location.marker(new google.maps.Marker({
                    position: new google.maps.LatLng(venue.location.lat,venue.location.lng),
                    map: map,
                    title: venue.name,
                    animation: google.maps.Animation.DROP
                    }));
                self.listVenues.push(location);
                
            });
           
            updateMap(map, self.listVenues());
           
        }).fail(function(){
            self.fsError("Oops!! Sorry, for some reasons the request failed ");
            
        });
    }
   
};
//closeAllInfoWindows();
ko.applyBindings(new MapViewModel());


$utils.package("core.mapkit");

var MapKits = function(){

	this.geo = undefined;
	this.init =function(){
		/*$utils.include("https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false");*/
		this.geo =new google.maps.Geocoder(); 
	};

	/*search gps by address*/
	this.GPS = function(address, callback, error){
		if(address){
			this.geo.geocode({'address':address},function(results, status){
		    	if (status == google.maps.GeocoderStatus.OK) {
		    		loc = results[0].geometry.location;
		    		var lat,lng;
		    		if(loc){
						lat =  Math.round(loc.lat()*1000)/1000;
						lng = Math.round(loc.lng()*1000)/1000;
					}
					if(callback)
						callback(lat, lng);		
		    	}else {
		    		//console.log('Geocode was not successful for the following reason: ' + status);
		    		if(callback)
						callback();		
		    	}
		    });
		}else{
			navigator.geolocation.getCurrentPosition(function(location){
				callback(location.coords.latitude, location.coords.longitude);
			},error);
		}
	}
};
var $mk = new MapKits;
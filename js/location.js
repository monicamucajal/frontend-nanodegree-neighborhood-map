// JavaScript Document
/* Location Data Set */
var Locations = [{
        name: 'Wayfarers Chapel',
        address: '5755 Palos Verdes Dr, Rancho Palos Verdes, CA 90275'
    },
    {
        name: 'Abalone Cove',
        address: '5970 Palos Verdes Dr, Rancho Palos Verdes, CA 90275'
    },
    {
        name: 'Del Cerro Park',
        address: '2 Park Pl, Rancho Palos Verdes, CA 90275'
    },
    {
        name: 'Palos Verdes Art Center',
        address: '5504 Crestridge Rd, Rancho Palos Verdes, CA 90275'
    },
    {
        name: 'The SEA Lab',
        address: '1021 N Harbor Dr, Redondo Beach, CA 90277'
    },
    {
        name: 'Redondo Beach Pier',
        address: '121 West Torrance Boulevard #103, Redondo Beach, CA 90277'
    },
    {
        name: 'South Coast Botanic Garden',
        address: '26300 Crenshaw Blvd, Palos Verdes Estates, CA 90274'
    }
];

/* Global Variables */
var markers = [];
var infoWindow;
var map;

/* Retrieve Foursquare Info using API */
function foursquareInfo(location) {
    var clientID = 'CMJZORWEWUFBQJJZEO5PPUN4VKFMZQ22FYRKD1Y0LYCRYOVV';
    var clientSecret = 'R222RJPDOLTV1HSSRXK5M0IJ15IM0J4X0WO0XHZ25WRMXDKQ';
    var position = '' + location.marker.position;
    position = position.replace('(', '').replace(')', '');
    var contentString = '';
    var reqURL = 'https://api.foursquare.com/v2/venues/search?ll=' + position + '&query="' + location.name + '"&limit=1&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20171116';
    $.getJSON(reqURL).done(function(data) {
        var response = data.response.venues[0];
        var address1 = response.location.formattedAddress[0];
        var address2 = response.location.formattedAddress[1];
        var address3 = response.location.formattedAddress[2];
        var category = response.categories[0].name;
        contentString = '<div id="iw-container">' +
            '<div class="iw-title">' + location.name + '</div>' +
            '<div class="iw-content">' +
            '<div class="iw-subTitle">' + category + '</div>' +
            '<p>' + address1 + '<br>' +
            address2 + '<br>' +
            address3 + '</p>' +
            '<p>Data in this information window courtesy of Foursquare Labs, Inc.</p>';
        infoWindow.setContent(contentString);
        infoWindow.open(map, location.marker);
    }).fail(function(data) {
        alert('error');
    });
}

/* Initializing Google Map Interface */
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 33.803558,
            lng: -118.391487
        },
        zoom: 12,
        mapTypeControl: true,
        fullscreenControl: false,
        gestureHandling: 'greedy'
    });

    infoWindow = new google.maps.InfoWindow({
        maxWidth: 350
    });

    google.maps.event.addListener(infoWindow, 'domready', function() {
        var iwOuter = $('.gm-style-iw');
        var iwBackground = iwOuter.prev();
        iwBackground.children(':nth-child(2)').css({
            'display': 'none'
        });
        iwBackground.children(':nth-child(4)').css({
            'display': 'none'
        });
        iwOuter.parent().parent().css({
            left: '0px'
        });
        iwBackground.children(':nth-child(3)').find('div').children().css({
            'box-shadow': 'rgba(52, 99, 151, 0.6) 0px 1px 6px',
            'z-index': '1'
        });
        var iwCloseBtn = iwOuter.next();
        iwCloseBtn.css({
            opacity: '1',
            width: '22px',
            height: '22px',
            right: '38px',
            top: '4px',
            border: '5px solid #346397',
            'border-radius': '25px',
            'box-shadow': '0 0 5px #3990B9'
        });
        if ($('.iw-content').height() < 140) {
            $('.iw-bottom-gradient').css({
                display: 'none'
            });
        }
        iwCloseBtn.mouseout(function() {
            $(this).css({
                opacity: '1'
            });
            map.setZoom(12);
        });
    });

    var addressLocator = new google.maps.Geocoder();

    Locations.forEach(function(location) {
        createMarkerWithAddress(addressLocator, map, location);
    });

    ko.applyBindings(new ViewModel());
}


/* Geolocating Address and creating markers on map */
function createMarkerWithAddress(addressLocator, resultsMap, location) {
    var address = location.address;

    addressLocator.geocode({
        'address': address
    }, function(results, status) {
        if (status === 'OK') {
            resultsMap.setCenter(results[0].geometry.location);
            location.marker = new google.maps.Marker({
                map: resultsMap,
                animation: google.maps.Animation.DROP,
                position: results[0].geometry.location
            });

            google.maps.event.addListener(location.marker, 'click', function() {
                foursquareInfo(location);
                resultsMap.setCenter(location.marker.position);
                resultsMap.setZoom(13);
                if (location.marker.getAnimation() !== null) {
                    location.marker.setAnimation(null);
                } else {
                    location.marker.setAnimation(google.maps.Animation.BOUNCE);
                    setTimeout(function() {
                        location.marker.setAnimation(null);
                    }, 1000);
                }
            });

            markers.push({
                name: location.name,
                marker: location.marker
            });

        } else {
            alert('Error locating Address: ' + status);
        }
    });
}


/* Knockout process of locations */
var ViewModel = function() {
    var self = this;
	self.name = ko.observable();
    this.filter = ko.observable("");
    this.filteredLocations = ko.computed(function() {
        var filter = self.filter().toLowerCase();
        if (!filter) {
            Locations.forEach(function(location) {
                if (location.marker) {
                    location.marker.setVisible(true);
                }
            });
            return Locations;
        } else {
            return ko.utils.arrayFilter(Locations, function(location) {
                var match = location.name.toLowerCase().indexOf(filter) !== -1;
                if (match) {
                    location.marker.setVisible(true);
                } else {
                    location.marker.setVisible(false);
                }
                map.setZoom(13);
                return match;
            });
        }
    });
    
 
    /* Map error handling */
    function mapErrorHandling() {
    alert("Failed to load resources. Please check your internet connection and try again.");
    }

	
	/* Knockout handling of clicks */
    
    self.clickOnMarker = function() {
		var name = this.name;
		markers.forEach(function(markerItem) {
			if (markerItem.name == name) {
				google.maps.event.trigger(markerItem.marker, 'click');
			}
		});
	};
};
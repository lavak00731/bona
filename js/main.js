let iframeChannelReady = false;
let iframeResizeEventReceived = false;
let resizeAttempts = 0;

if (window.addEventListener) {
    window.addEventListener("message", onMessage, false);
} else if (window.attachEvent) {
    window.attachEvent("onmessage", onMessage, false);
}

function acknowledgeChannelReady() {
    console.log("CHANNEL IS READY IN PARENT!");
    iframeChannelReady = true;
}
function acknowledgeIframeSizeReceived() {
    iframeResizeEventReceived = true;
}

function onMessage(event) {

    const data = event.data;
    if(data.func) {
        switch (data.func) {
            case 'acknowledgeIframeSizeReceived' :
                acknowledgeIframeSizeReceived();
                break;
            case 'acknowledgeChannelReady' :
                acknowledgeChannelReady();
                break;
        }
    }
}

function mostrarParte2() {
    $('#parte-2').show();
    $('#parte-2-title').show();
}

function resizeFrame() {
    resizeAttempts++;
    const height = $('body').height() + 100;

    window.parent.postMessage({
        'func': 'resizeCancerFrame',
        'height': height + 'px',
    }, "*");

    /* RETRY RESIZE FRAME UNTIL PARENT IS READY AND INFORMED HE RECEIVED THE RESIZE EVENT */
    if(!iframeChannelReady || !iframeResizeEventReceived) {
        setTimeout(function() {
            resizeFrame();
        },100);
    }
}

function focusOnTarget(target) {
    const targetElem = document.querySelector('#'+target);
    document.querySelectorAll('[data-remove="true"]').forEach((subsection) => subsection.setAttribute('hidden', true));
    targetElem.removeAttribute('hidden');
    document.querySelectorAll('.bona-side-container')[1].classList.add('bona-bckgrd')
    targetElem.scrollIntoView({
        behavior: "smooth"
    });

}

function getBoundsZoomLevel(bounds, mapDim) {
    var WORLD_DIM = { height: 256, width: 256 };
    var ZOOM_MAX = 21;

    function latRad(lat) {
        var sin = Math.sin(lat * Math.PI / 180);
        var radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
        return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
    }

    function zoom(mapPx, worldPx, fraction) {
        return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
    }

    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();

    var latFraction = (latRad(ne.lat()) - latRad(sw.lat())) / Math.PI;

    var lngDiff = ne.lng() - sw.lng();
    var lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;

    var latZoom = zoom(mapDim.height, WORLD_DIM.height, latFraction);
    var lngZoom = zoom(mapDim.width, WORLD_DIM.width, lngFraction);

    return Math.min(latZoom, lngZoom, ZOOM_MAX);
}

// Converts numeric degrees to radians
function toRad(Value)
{
    return Value * Math.PI / 180;
}

function toDeg (Value) {
    return Value * 180 / Math.PI;
}

//-- Define middle point function
function middlePoint(lat1, lng1, lat2, lng2) {

    //-- Longitude difference
    var dLng = toRad(lng2 - lng1);

    //-- Convert to radians
    lat1 = toRad(lat1);
    lat2 = toRad(lat2);
    lng1 = toRad(lng1);

    var bX = Math.cos(lat2) * Math.cos(dLng);
    var bY = Math.cos(lat2) * Math.sin(dLng);
    var lat3 = Math.atan2(Math.sin(lat1) + Math.sin(lat2), Math.sqrt((Math.cos(lat1) + bX) * (Math.cos(lat1) + bX) + bY * bY));
    var lng3 = lng1 + Math.atan2(bY, Math.cos(lat1) + bX);

    //-- Return result
    return {lat:toDeg(lat3),lng:toDeg(lng3)};
}

//This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
function calcCrow(lat1, lon1, lat2, lon2)
{
    var R = 6371; // km
    var dLat = toRad(lat2-lat1);
    var dLon = toRad(lon2-lon1);
    var lat1 = toRad(lat1);
    var lat2 = toRad(lat2);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d;
}

function getClosestStore(lng,lat) {
    $.ajax({
        type: "POST",
        url: '/controller.php',
        data: {
            action: "get_closest_store",
            lat: lat,
            lng: lng
        },
        dataType: 'json',
        success: function(response) {
            console.log(response)
            if(response.closestStore) {
                let myPosition = {lat: lat, lng: lng};
                let storePosition = {lat: response.closestStore.latitude, lng: response.closestStore.longitude};
                console.log('Closest store: ' , response.closestStore);

                var midPoint = middlePoint(myPosition.lat, myPosition.lng, storePosition.lat,storePosition.lng);
                var distance = calcCrow(myPosition.lat, myPosition.lng, storePosition.lat,storePosition.lng) * 1000;
                console.log(distance);


                var circle = new google.maps.Circle({radius: distance/2, center: new google.maps.LatLng(midPoint)});

                // map.panTo(new google.maps.LatLng(midPoint));
                map.fitBounds(circle.getBounds());

                // map.setCenter({lat: lat, lng: lng});

                // map.panTo(new google.maps.LatLng({lat: lat, lng: lng}));
                // map.panTo(new google.maps.LatLng({lat: response.closestStore.latitude, lng: response.closestStore.longitude}));
                // map.setZoom(12);
                // map.fitBounds(bounds);
                // map.panTo(myCenter);
                // var newCenterMarker = new google.maps.Marker({
                //     position: myCenter,
                //     map: map,
                //     animation:google.maps.Animation.DROP
                // });
            }
        },
        error: function(response) {
            console.log('error');
        }
    });
}

function showPosition(position) {
    console.log('My Position: ',position.coords);
    getClosestStore(position.coords.longitude, position.coords.latitude);
}

function searchByPostalCode(postalCode) {

    //get lat and longitude from postal code
    $.ajax({
        type: "POST",
        url: '/controller.php',
        data: {
            action: "get_lat_lng",
            postal_code: postalCode
        },
        dataType: 'json',
        success: function(response) {
            console.log('GET LAT LNG:',response)
            if(response.lat && response.lng) {
                //search nearest store and display map
                getClosestStore(response.lng, response.lat);
            }
        },
        error: function(response) {
            console.log('error');
        }
    });
}

(function () {

    function scrollHandling(e) {
        const target = e.target.dataset.target;
        focusOnTarget(target)
    }

    document.querySelectorAll('button[data-target]').forEach((elem) => {
        elem.addEventListener('click', scrollHandling);
    });

    $('body').resize(function() {
        resizeFrame();
    });

    $('#share-location').on('click',function(){
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition)
        }
    });

    $('#localizar').on('submit', function(e) {
        e.preventDefault();
        if($('#cp').val()) {
            searchByPostalCode($('#cp').val());
        }
    });

    $('#retirar').on('submit', function(e) {
        e.preventDefault();
        $.ajax({
            type: "POST",
            url: '/controller.php',
            data: $(this).serialize(),
            dataType: 'json',
            success: function(response) {
                console.log(response)
                focusOnTarget('finform');
            },
            error: function(response) {
                console.log(response)
                focusOnTarget('finform');
            }
        });
    })

    resizeFrame();
})();

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
                console.log('Closest store: ' , response.closestStore);
                var bounds = new google.maps.LatLngBounds(
                    new google.maps.LatLng({lat: lat, lng: lng}),
                    new google.maps.LatLng({lat: response.closestStore.latitude, lng: response.closestStore.longitude})
                );

                map.setCenter(bounds.getCenter());
                map.panTo(bounds.getCenter());
                map.setZoom(12);
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

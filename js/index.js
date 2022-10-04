"use strict";
// Initialize and add the map
function initMap() {
    var mex = { lat: 19.432608, lng: -99.133209 };
    // The map, centered at mex
    var map = new google.maps.Map(document.getElementById("map"), {
        zoom: 11,
        center: mex,
    });
    drawMarkers(map);
}
function drawMarkers(map) {
    var markers = [];
    var points = [
        {
            title: 'Pepe',
            lat: 19.452608,
            lng: -99.143209
        },
        {
            title: 'Pepe 2',
            lat: 19.422608,
            lng: -99.123209
        }
    ];
    points.forEach(function (point) {
        markers.push(new google.maps.Marker({
            position: new google.maps.LatLng(point.lat, point.lng),
            title: point.title,
            icon: 'https://bonafont.ngrok.io/assets/img/walmart.png',
            map: map
        }));
    });
}
window.initMap = initMap;

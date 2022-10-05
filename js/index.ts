// Initialize and add the map
function initMap(): void {
    const mex = { lat: 19.392608, lng:-99.133209 };

    // The map, centered at mex
    window.map = new google.maps.Map(
        document.getElementById("map") as HTMLElement,
        {
            zoom: 11,
            center: mex,
            disableDefaultUI: true,
            language: 'es'
        }
    );

    drawMarkers(map);
}

function drawMarkers(map : google.maps.Map): void {
    const markers : google.maps.Marker[] = [];

    window.storePoints.forEach((point ) => {
        let marker = new google.maps.Marker( {
            position: new google.maps.LatLng(point.lat, point.lng),
            title: point.title,
            icon: 'https://tapasquealigeran.bonafont.com.mx/assets/img/walmart-30x30.png',
            map: map
        });

        marker['infowindow'] = new google.maps.InfoWindow({
            content: '<div class="infowindow"><b>' + point.title + '</b><br>' +
                point.address + '<br>' +
                point.city + '</div>'
        });

        google.maps.event.addListener(marker, 'click', function() {
            this['infowindow'].open(map, this);
        });
    });
}

declare global {
    interface Window {
        initMap: () => void;
    }
}
window.initMap = initMap;
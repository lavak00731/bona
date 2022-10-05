// Initialize and add the map
function initMap(): void {
    const mex = { lat: 19.432608, lng:-99.133209 };

    // The map, centered at mex
    window.map = new google.maps.Map(
        document.getElementById("map") as HTMLElement,
        {
            zoom: 11,
            center: mex,
            disableDefaultUI: true,
        }
);

    drawMarkers(map);
}

function drawMarkers(map : google.maps.Map): void {
    const markers : google.maps.Marker[] = [];

    const points = [
        {
            title:'Pepe',
            lat: 19.452608,
            lng:-99.143209
        },
        {
            title:'Pepe 2',
            lat: 19.422608,
            lng:-99.123209
        }
    ]

    points.forEach((point ) => {
        markers.push(new google.maps.Marker( {
            position: new google.maps.LatLng(point.lat, point.lng),
            title: point.title,
            icon: 'https://bonafont.ngrok.io/assets/img/walmart.png',
            map: map
        }));
    });
}

declare global {
    interface Window {
        initMap: () => void;
    }
}
window.initMap = initMap;

export {};
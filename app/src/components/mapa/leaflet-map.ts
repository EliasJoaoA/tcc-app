import type { MapPoint } from '../../services/map.service';

const markerColors: Record<MapPoint['type'], string> = {
  quiet_zone: '#2878B5', rest_point: '#3A8D5D', building: '#68737D', service: '#D97706',
};

export function createLeafletMapHtml(points: MapPoint[], bridge: 'native' | 'web'): string {
  const safePoints = JSON.stringify(points).replace(/</g, '\\u003c');
  const safeColors = JSON.stringify(markerColors);
  const sendSelection = bridge === 'native'
    ? 'window.ReactNativeWebView.postMessage(String(id));'
    : 'window.parent.postMessage({ type: "campus-point", id: id }, window.location.origin);';

  return `<!doctype html><html lang="pt-BR"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
  <style>html,body,#map{width:100%;height:100%;margin:0;background:#eef3f5}.campus-marker{width:25px;height:25px;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 5px rgba(0,0,0,.35)}.campus-marker span{display:block;width:7px;height:7px;margin:6px;border-radius:50%;background:rgba(255,255,255,.9)}.leaflet-control-attribution{font-size:10px}</style>
</head><body><div id="map" aria-label="Mapa do campus da UEPG"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><script>
const points=${safePoints},colors=${safeColors};
const map=L.map('map',{zoomControl:true}).setView([-25.0947,-50.1618],17);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
const bounds=[];
points.forEach(point=>{const icon=L.divIcon({className:'',html:'<div class="campus-marker" style="background:'+colors[point.type]+'"><span></span></div>',iconSize:[31,31],iconAnchor:[15,30]});const marker=L.marker([Number(point.latitude),Number(point.longitude)],{icon}).addTo(map);marker.bindTooltip(point.name,{direction:'top',offset:[0,-25]});marker.on('click',()=>{const id=point.id;${sendSelection}});bounds.push([Number(point.latitude),Number(point.longitude)]);});
if(bounds.length>1)map.fitBounds(bounds,{padding:[35,35],maxZoom:17});if(bounds.length===1)map.setView(bounds[0],18);
</script></body></html>`;
}

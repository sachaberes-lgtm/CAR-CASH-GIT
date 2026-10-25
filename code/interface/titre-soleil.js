/* ===== LE SOLEIL DU TITRE (2026-10-25, Sacha : « l'accueil est tout le temps à la même heure ; il faut plusieurs ambiances qui s'adaptent à l'horaire de
   l'appareil, et à la saison, comme dans Animal Crossing ») =====
   Les heures de l'accueil ne sont plus des seuils fixes (nuit 22 h-5 h…) : elles se calent sur le LEVER et le COUCHER du soleil du jour, calculés
   d'après la date, le fuseau horaire et l'heure d'été de l'appareil. Aucun réseau, aucune permission de position : le lieu est deviné du fuseau
   (TITRE_ZONES, la grande ville du fuseau) ; un fuseau inconnu prend sa latitude moyenne et sa longitude de l'heure légale. L'hémisphère Sud a
   donc ses saisons à l'envers. Formule du NOAA (équation du temps + déclinaison), juste à quelques minutes, plus que ce qu'il faut pour une ambiance.
   titreSoleil(d,lat,lon) → {lever,coucher} en heures locales · titreLieu(d,zone) → [lat,lon] · dbgSoleil('2026-06-21T22:00','Europe/Paris') (banc). */
const TITRE_ZONES={'Europe/Paris':[48.9,2.4],'Europe/London':[51.5,-.1],'Europe/Dublin':[53.3,-6.3],'Europe/Lisbon':[38.7,-9.1],'Europe/Madrid':[40.4,-3.7],
  'Europe/Brussels':[50.8,4.4],'Europe/Amsterdam':[52.4,4.9],'Europe/Berlin':[52.5,13.4],'Europe/Zurich':[47.4,8.5],'Europe/Rome':[41.9,12.5],
  'Europe/Vienna':[48.2,16.4],'Europe/Warsaw':[52.2,21],'Europe/Stockholm':[59.3,18.1],'Europe/Oslo':[59.9,10.7],'Europe/Helsinki':[60.2,24.9],
  'Europe/Athens':[38,23.7],'Europe/Istanbul':[41,29],'Europe/Moscow':[55.8,37.6],'Europe/Kiev':[50.5,30.5],'Europe/Kyiv':[50.5,30.5],
  'Africa/Casablanca':[33.6,-7.6],'Africa/Algiers':[36.8,3.1],'Africa/Tunis':[36.8,10.2],'Africa/Cairo':[30,31.2],'Africa/Lagos':[6.5,3.4],
  'Africa/Johannesburg':[-26.2,28],'Africa/Nairobi':[-1.3,36.8],'Asia/Dubai':[25.2,55.3],'Asia/Tehran':[35.7,51.4],'Asia/Kolkata':[22.6,88.4],
  'Asia/Calcutta':[22.6,88.4],'Asia/Karachi':[24.9,67],'Asia/Dhaka':[23.8,90.4],'Asia/Bangkok':[13.8,100.5],'Asia/Jakarta':[-6.2,106.8],
  'Asia/Singapore':[1.3,103.8],'Asia/Hong_Kong':[22.3,114.2],'Asia/Shanghai':[31.2,121.5],'Asia/Seoul':[37.6,127],'Asia/Tokyo':[35.7,139.7],
  'Asia/Manila':[14.6,121],'Australia/Sydney':[-33.9,151.2],'Australia/Melbourne':[-37.8,145],'Australia/Brisbane':[-27.5,153],
  'Australia/Perth':[-32,115.9],'Australia/Adelaide':[-34.9,138.6],'Pacific/Auckland':[-36.8,174.8],'America/New_York':[40.7,-74],
  'America/Toronto':[43.7,-79.4],'America/Montreal':[45.5,-73.6],'America/Halifax':[44.6,-63.6],'America/Chicago':[41.9,-87.6],'America/Denver':[39.7,-105],
  'America/Phoenix':[33.4,-112],'America/Los_Angeles':[34,-118.2],'America/Vancouver':[49.3,-123.1],'America/Anchorage':[61.2,-149.9],
  'Pacific/Honolulu':[21.3,-157.9],'America/Mexico_City':[19.4,-99.1],'America/Bogota':[4.7,-74.1],'America/Lima':[-12,-77],'America/Santiago':[-33.4,-70.7],
  'America/Sao_Paulo':[-23.5,-46.6],'America/Argentina/Buenos_Aires':[-34.6,-58.4],'America/Martinique':[14.6,-61],'America/Guadeloupe':[16.2,-61.5],
  'America/Cayenne':[4.9,-52.3],'Indian/Reunion':[-21.1,55.5],'Pacific/Noumea':[-22.3,166.5],'Pacific/Tahiti':[-17.5,-149.6]};
function titreLieu(d,zone){ // [latitude, longitude est] du fuseau de l'appareil
  if(zone===undefined){try{zone=Intl.DateTimeFormat().resolvedOptions().timeZone;}catch(e){zone='';}}
  const z=TITRE_ZONES[zone];if(z)return z;
  const y=d.getFullYear(),legale=-Math.max(new Date(y,0,1).getTimezoneOffset(),new Date(y,6,1).getTimezoneOffset())/60; // heure légale hors heure d'été
  const sud=/^(Australia|Antarctica)\/|Auckland|Sao_Paulo|Santiago|Lima|Johannesburg|Argentina|Montevideo|La_Paz|Asuncion|Maputo|Harare|Lusaka|Windhoek|Antananarivo|Fiji|Tongatapu|Apia|Reunion|Noumea|Tahiti/.test(zone||'');
  return [sud?-30:/^Europe\//.test(zone||'')?48:/^America\//.test(zone||'')?38:35,legale*15];}
function titreSoleil(d,lat,lon){ // lever et coucher du soleil ce jour-là, en heures LOCALES (l'heure d'été de l'appareil est déjà dedans)
  const R=Math.PI/180,n=Math.floor((d-new Date(d.getFullYear(),0,0))/864e5),g=2*Math.PI/365*(n-1);
  const eq=229.18*(7.5e-5+1.868e-3*Math.cos(g)-3.2077e-2*Math.sin(g)-1.4615e-2*Math.cos(2*g)-4.0849e-2*Math.sin(2*g)); // l'équation du temps (min)
  const dec=6.918e-3-.399912*Math.cos(g)+.070257*Math.sin(g)-6.758e-3*Math.cos(2*g)+9.07e-4*Math.sin(2*g)-2.697e-3*Math.cos(3*g)+1.48e-3*Math.sin(3*g); // la déclinaison (rad)
  let c=Math.cos(90.833*R)/(Math.cos(lat*R)*Math.cos(dec))-Math.tan(lat*R)*Math.tan(dec);c=Math.max(-.985,Math.min(.985,c)); // (jour ou nuit polaire : un jour de 1 h 20 à 22 h 40, jamais de trou)
  const ha=Math.acos(c)/R,decal=-d.getTimezoneOffset(); // demi-arc du jour (°) · décalage de l'appareil à ce jour (min)
  return {lever:(720-4*(lon+ha)-eq+decal)/60,coucher:(720-4*(lon-ha)-eq+decal)/60};}
window.dbgSoleil=function(iso,zone){ // (banc) dbgSoleil('2026-06-21T22:00') : l'heure du titre à cet instant ; zone = un fuseau d'IANA (sinon celui de l'appareil)
  const d=iso?new Date(iso):new Date(),L=titreLieu(d,zone),S=titreSoleil(d,L[0],L[1]),f=function(h){const m=Math.round(h*60);return Math.floor(m/60)+'h'+('0'+m%60).slice(-2);};
  return {date:d.toString(),lieu:L,lever:f(S.lever),coucher:f(S.coucher),heure:titreHeureDe(d,zone)};};

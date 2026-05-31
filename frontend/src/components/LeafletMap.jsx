import { useEffect, useRef } from "react";

/**
 * LeafletMap — interactive OpenStreetMap with route + pickup/drop + live driver.
 * Uses Leaflet directly (no react-leaflet) to avoid hydration issues with portal-style mounting.
 *
 * Props:
 *   pickup: { lat, lng, address? }
 *   drop:   { lat, lng, address? }
 *   driver: { lat, lng } | null
 *   onMapClick: (latlng) => void
 *   showUser: boolean — show pulsing user-location dot at pickup
 *   interactive: boolean (default true)
 *   className: string
 */
export const LeafletMap = ({
  pickup, drop, driver, onMapClick,
  showUser = true, interactive = true, className = "",
}) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layersRef = useRef({});

  useEffect(() => {
    let L;
    (async () => {
      L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (!containerRef.current || mapRef.current) return;

      const startLat = pickup?.lat || 25.6093;
      const startLng = pickup?.lng || 85.1235;

      const map = L.map(containerRef.current, {
        zoomControl: interactive,
        attributionControl: false,
        dragging: interactive,
        scrollWheelZoom: interactive,
        doubleClickZoom: interactive,
        touchZoom: interactive,
      }).setView([startLat, startLng], 13);

      const isDark = document.documentElement.classList.contains("dark");
      L.tileLayer(
        isDark
          ? "https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
          : "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
        { maxZoom: 19, subdomains: "abcd" }
      ).addTo(map);

      mapRef.current = map;
      layersRef.current.L = L;
      layersRef.current.markers = L.layerGroup().addTo(map);
      layersRef.current.routes = L.layerGroup().addTo(map);

      if (onMapClick) {
        map.on("click", (e) => onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng }));
      }

      requestUpdate();
    })();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layersRef.current = {};
      }
    };
    // eslint-disable-next-line
  }, []);

  const requestUpdate = () => {
    const L = layersRef.current.L;
    const map = mapRef.current;
    if (!L || !map) return;
    const markers = layersRef.current.markers;
    const routes = layersRef.current.routes;
    markers.clearLayers();
    routes.clearLayers();

    const pinIcon = (color, label) =>
      L.divIcon({
        className: "",
        html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:grid;place-items:center;color:#fff;font-weight:900;font-size:11px;">${label}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

    const userIcon = L.divIcon({
      className: "",
      html: `<div style="position:relative;width:18px;height:18px;">
        <div style="position:absolute;inset:0;border-radius:50%;background:#0A2E6D;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>
        <div style="position:absolute;inset:-10px;border-radius:50%;border:2px solid rgba(10,46,109,0.4);animation:lm-pulse 1.8s ease-out infinite;"></div>
      </div>
      <style>@keyframes lm-pulse { 0%{transform:scale(0.6);opacity:0.9} 100%{transform:scale(1.8);opacity:0} }</style>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });

    const driverIcon = L.divIcon({
      className: "",
      html: `<div style="width:36px;height:36px;border-radius:50%;background:#16A34A;border:4px solid #fff;box-shadow:0 4px 14px rgba(22,163,74,0.5);display:grid;place-items:center;color:#fff;font-weight:900;font-size:16px;">🚗</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const bounds = [];
    if (pickup) {
      markers.addLayer(L.marker([pickup.lat, pickup.lng], { icon: showUser ? userIcon : pinIcon("#0A2E6D", "P") }));
      bounds.push([pickup.lat, pickup.lng]);
    }
    if (drop) {
      markers.addLayer(L.marker([drop.lat, drop.lng], { icon: pinIcon("#FF7A00", "D") }));
      bounds.push([drop.lat, drop.lng]);
    }
    if (driver?.lat && driver?.lng) {
      markers.addLayer(L.marker([driver.lat, driver.lng], { icon: driverIcon }));
      bounds.push([driver.lat, driver.lng]);
    }
    if (pickup && drop) {
      const line = L.polyline(
        [[pickup.lat, pickup.lng], [drop.lat, drop.lng]],
        { color: "#FF7A00", weight: 5, opacity: 0.85, dashArray: "1, 10", lineCap: "round" }
      );
      routes.addLayer(line);
    }
    if (bounds.length >= 2) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 14);
    }
  };

  useEffect(() => { requestUpdate(); /* eslint-disable-next-line */ }, [pickup, drop, driver]);

  return <div ref={containerRef} className={`relative w-full h-full ${className}`} data-testid="leaflet-map" />;
};

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { MapPin, Navigation, Compass, Building, UserCheck, ArrowRight } from 'lucide-react';

// Custom Marker Icons using SVG DIVs
function createCustomIcon(category: 'destination' | 'attraction' | 'hotel' | 'guide', name: string) {
  let bgColor = '#323232';
  let badgeText = 'D';

  if (category === 'attraction') {
    bgColor = '#735E51';
    badgeText = 'A';
  } else if (category === 'hotel') {
    bgColor = '#4A5568';
    badgeText = 'H';
  } else if (category === 'guide') {
    bgColor = '#5C4E44';
    badgeText = 'G';
  }

  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background-color: ${bgColor};
        color: white;
        border: 2px solid #FFFFFF;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        width: 34px;
        height: 34px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 13px;
        cursor: pointer;
        transition: transform 0.2s ease;
      " title="${name}">
        ${badgeText}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -20],
  });
}

export interface MapItem {
  id: string;
  name: string;
  category: 'destination' | 'attraction' | 'hotel' | 'guide';
  latitude: number;
  longitude: number;
  slug?: string;
  imageUrl?: string;
  subtitle?: string;
  link: string;
}

interface IndiaMapProps {
  items: MapItem[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  interactive?: boolean;
}

// Controller to smoothly fly to bounds or center when coordinates change
const MapUpdater: React.FC<{ center?: [number, number]; zoom?: number; items?: MapItem[] }> = ({
  center,
  zoom,
  items,
}) => {
  const map = useMap();

  useEffect(() => {
    if (center && zoom) {
      map.setView(center, zoom, { animate: true });
    } else if (items && items.length > 0) {
      const bounds = L.latLngBounds(items.map((i) => [i.latitude, i.longitude]));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      }
    }
  }, [center, zoom, items, map]);

  return null;
};

export const IndiaMap: React.FC<IndiaMapProps> = ({
  items,
  center = [21.5, 78.9],
  zoom = 5,
  height = '500px',
  interactive = true,
}) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setLocating(false);
      },
      () => {
        setLocating(false);
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-default shadow-xs" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={interactive}
        dragging={interactive}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater center={userLocation || center} zoom={userLocation ? 11 : zoom} items={userLocation ? undefined : items} />

        {/* User Current Location Marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={L.divIcon({
              className: 'user-loc-marker',
              html: `<div style="background-color:#2563EB; width:18px; height:18px; border-radius:50%; border:3px solid white; box-shadow:0 0 12px rgba(37,99,235,0.7);"></div>`,
              iconSize: [18, 18],
              iconAnchor: [9, 9],
            })}
          >
            <Popup>
              <div className="text-xs font-semibold text-[#323232]">Your Current Location</div>
            </Popup>
          </Marker>
        )}

        {/* Dynamic Markers */}
        {items.map((item) => (
          <Marker
            key={`${item.category}-${item.id}`}
            position={[item.latitude, item.longitude]}
            icon={createCustomIcon(item.category, item.name)}
          >
            <Popup>
              <div className="w-56 p-1">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-28 object-cover rounded-lg mb-2 border border-default/50"
                  />
                )}
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-[#DDD0C8]/40 text-[#323232]">
                    {item.category}
                  </span>
                </div>
                <h4 className="font-serif font-bold text-sm text-[#323232] leading-tight mb-1">
                  {item.name}
                </h4>
                {item.subtitle && (
                  <p className="text-xs text-[#555555] line-clamp-2 mb-2">
                    {item.subtitle}
                  </p>
                )}
                <Link
                  to={item.link}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#323232] hover:underline"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Geolocation Button */}
      {interactive && (
        <button
          onClick={handleLocateMe}
          disabled={locating}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-xl bg-white text-[#323232] shadow-md border border-default hover:bg-gray-50 transition-colors flex items-center gap-2 text-xs font-semibold"
          title="Find My Location in India"
          aria-label="Locate me"
        >
          <Navigation className={`w-4 h-4 ${locating ? 'animate-spin text-blue-600' : 'text-[#323232]'}`} />
          <span className="hidden sm:inline">{locating ? 'Locating...' : 'My Location'}</span>
        </button>
      )}

      {/* Marker Legend */}
      <div className="absolute bottom-4 left-4 z-20 hidden md:flex items-center gap-3 bg-white/95 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-default shadow-xs text-xs font-medium text-[#323232]">
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-[#323232] text-white text-[9px] flex items-center justify-center font-bold">
            D
          </span>
          Destinations
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-[#735E51] text-white text-[9px] flex items-center justify-center font-bold">
            A
          </span>
          Attractions
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-[#4A5568] text-white text-[9px] flex items-center justify-center font-bold">
            H
          </span>
          Hotels
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-[#5C4E44] text-white text-[9px] flex items-center justify-center font-bold">
            G
          </span>
          Guides
        </span>
      </div>
    </div>
  );
};

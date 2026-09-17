import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMapEvents, useMap } from 'react-leaflet';
import { MapPin, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Component to handle map center updates
const MapCenterUpdater = ({ setCenter }) => {
  useMapEvents({
    moveend: (e) => {
      const map = e.target;
      setCenter(map.getCenter());
    },
  });
  return null;
};

// Component to fly to user location on load
const FlyToLocation = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 16);
    }
  }, [position, map]);
  return null;
};

const MapModal = ({ isOpen, onClose, onConfirm }) => {
  // Default to New Delhi coordinates
  const [center, setCenter] = useState({ lat: 28.6139, lng: 77.2090 });
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Try to get user location when modal opens
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const currentPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setUserLocation(currentPos);
            setCenter(currentPos);
          },
          (err) => {
            console.error("Geolocation error:", err);
          },
          { enableHighAccuracy: true }
        );
      }
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${center.lat}&lon=${center.lng}`);
      const data = await res.json();
      
      let streetStr = '';
      let city = '';
      let state = '';
      let pincode = '';
      
      if (data && data.address) {
        const addr = data.address;
        streetStr = [addr.road, addr.suburb, addr.neighbourhood, addr.residential].filter(Boolean).join(', ');
        city = addr.city || addr.town || addr.village || addr.county || '';
        state = addr.state || '';
        pincode = addr.postcode || '';
      }
      
      onConfirm({
        street: streetStr,
        city,
        state,
        pincode,
        lat: center.lat,
        lng: center.lng
      });
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      // Fallback
      onConfirm({
        lat: center.lat,
        lng: center.lng
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-2xl h-[80vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl relative z-10"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-serif text-[var(--primary)] font-bold">Select Location</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
                <X size={24} />
              </button>
            </div>
            
            {/* Map Area */}
            <div className="flex-1 relative bg-gray-100">
              <MapContainer 
                center={userLocation || center} 
                zoom={14} 
                style={{ height: '100%', width: '100%', zIndex: 0 }}
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapCenterUpdater setCenter={setCenter} />
                <FlyToLocation position={userLocation} />
              </MapContainer>
              
              {/* Center Pin Overlay */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none flex flex-col items-center">
                <div className="bg-white px-3 py-1 rounded-full shadow-md text-xs font-bold text-gray-700 mb-2 whitespace-nowrap">
                  Move map to pin
                </div>
                <div className="relative text-red-500 pb-8 animate-bounce">
                  <MapPin size={40} fill="currentColor" strokeWidth={1.5} className="text-red-500 drop-shadow-md" />
                  {/* Pin shadow/base */}
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-black/20 rounded-full blur-[1px]"></div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-white border-t border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="text-sm text-gray-600 flex-1">
                Drag the map to place the red pin at your exact delivery location.
              </div>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 bg-[var(--primary)] text-white rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-[var(--primary)]/90 transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> <span>Confirming...</span></>
                ) : (
                  <><span>Confirm Location</span></>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MapModal;

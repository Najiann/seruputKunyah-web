import React, { useEffect, useState } from 'react';
import {
  APIProvider,
  APILoadingStatus,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
  useApiLoadingStatus,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { ExternalLink, Loader2, MapPin, Navigation } from 'lucide-react';
import { StoreConfig } from '../types';

const INITIAL_MAPS_API_KEY =
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) ||
  (typeof __GOOGLE_MAPS_API_KEY__ !== 'undefined' ? __GOOGLE_MAPS_API_KEY__ : '');

const COORD_REGEX = /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/;

interface ResolvedPlaceData {
  location: google.maps.LatLngLiteral;
  formattedAddress?: string;
  googleMapsURI?: string;
  displayName?: string;
  attributions?: Array<{ provider?: string; providerURI?: string }>;
}

export function buildExternalMapsUrl(
  storeConfig: StoreConfig,
  resolvedUri?: string | null
): string {
  const customUrl = storeConfig.gmapsUrl?.trim();
  if (customUrl && /^https?:\/\//i.test(customUrl)) {
    return customUrl;
  }
  if (resolvedUri && /^https?:\/\//i.test(resolvedUri)) {
    return resolvedUri;
  }
  const query = storeConfig.gmapsQuery?.trim() || storeConfig.storeAddress?.trim() || 'Pasar Minggu';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

const MapCameraSync: React.FC<{ center: google.maps.LatLngLiteral }> = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    map.panTo(center);
    map.setZoom(16);
  }, [map, center.lat, center.lng]);

  return null;
};

interface LocationMapInnerProps {
  storeConfig: StoreConfig;
  onResolvedUriChange?: (uri: string | null) => void;
}

const LocationMapInner: React.FC<LocationMapInnerProps> = ({
  storeConfig,
  onResolvedUriChange,
}) => {
  const apiStatus = useApiLoadingStatus();
  const placesLib = useMapsLibrary('places');
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoWindowOpen, setInfoWindowOpen] = useState(true);
  const [resolved, setResolved] = useState<ResolvedPlaceData | null>(null);
  const [isSearching, setIsSearching] = useState(true);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const queryText =
    storeConfig.gmapsQuery?.trim() || storeConfig.storeAddress?.trim() || '';

  useEffect(() => {
    if (apiStatus === APILoadingStatus.AUTH_FAILURE) {
      window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
    }
  }, [apiStatus]);

  useEffect(() => {
    let cancelled = false;

    if (!queryText) {
      setResolved(null);
      setIsSearching(false);
      setLookupError('Alamat lokasi belum diatur.');
      onResolvedUriChange?.(null);
      return;
    }

    const coordMatch = queryText.match(COORD_REGEX);
    if (coordMatch) {
      const lat = Number.parseFloat(coordMatch[1]);
      const lng = Number.parseFloat(coordMatch[2]);
      if (
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
      ) {
        setResolved({
          location: { lat, lng },
          formattedAddress: storeConfig.storeAddress,
        });
        setLookupError(null);
        setIsSearching(false);
        setInfoWindowOpen(true);
        onResolvedUriChange?.(null);
        return;
      }
    }

    if (!placesLib) {
      return;
    }

    const resolveAddress = async () => {
      setIsSearching(true);
      setLookupError(null);

      try {
        const request: google.maps.places.SearchByTextRequest = {
          textQuery: queryText,
          fields: ['displayName', 'formattedAddress', 'location', 'googleMapsURI'],
          language: 'id',
          region: 'id',
          maxResultCount: 1,
        };

        const { places } = await placesLib.Place.searchByText(request);
        if (cancelled) return;

        const topPlace = places?.[0];
        if (topPlace?.location) {
          const nextData: ResolvedPlaceData = {
            location: {
              lat: topPlace.location.lat(),
              lng: topPlace.location.lng(),
            },
            formattedAddress: topPlace.formattedAddress ?? undefined,
            googleMapsURI: topPlace.googleMapsURI ?? undefined,
            displayName: topPlace.displayName ?? undefined,
          };
          setResolved(nextData);
          setInfoWindowOpen(true);
          onResolvedUriChange?.(nextData.googleMapsURI ?? null);
        } else {
          setResolved(null);
          onResolvedUriChange?.(null);
          setLookupError(
            'Titik lokasi belum ditemukan otomatis. Kamu tetap bisa membuka alamat ini langsung di Google Maps.'
          );
        }
      } catch (err) {
        if (cancelled) return;
        const errText = err instanceof Error ? `${err.name} ${err.message}` : String(err);
        const errStatus =
          typeof err === 'object' && err !== null && 'status' in err
            ? String((err as { status?: unknown }).status)
            : '';
        const combined = `${errText} ${errStatus}`.toUpperCase();

        if (
          combined.includes('RESOURCE_EXHAUSTED') ||
          combined.includes('OVER_QUERY_LIMIT') ||
          combined.includes('QUOTA') ||
          combined.includes('429')
        ) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }

        setResolved(null);
        onResolvedUriChange?.(null);
        setLookupError(
          'Peta interaktif sedang tidak dapat dimuat. Gunakan tombol Buka di Google Maps untuk petunjuk arah.'
        );
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    };

    void resolveAddress();

    return () => {
      cancelled = true;
    };
  }, [placesLib, queryText, storeConfig.storeAddress, onResolvedUriChange]);

  const externalUrl = buildExternalMapsUrl(storeConfig, resolved?.googleMapsURI);

  if (
    apiStatus === APILoadingStatus.FAILED ||
    apiStatus === APILoadingStatus.AUTH_FAILURE
  ) {
    return (
      <MapFallbackCard
        storeConfig={storeConfig}
        externalUrl={externalUrl}
        message="Peta interaktif sedang mengalami kendala koneksi atau kuota. Silakan buka lokasi langsung di aplikasi Google Maps."
      />
    );
  }

  if (isSearching && !resolved) {
    return (
      <div className="w-full h-[340px] sm:h-[400px] bg-[#F5E7B8]/60 flex flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="w-11 h-11 rounded-2xl bg-[#C7320B]/10 text-[#C7320B] flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-[#C7320B]">
            Memuat Peta Lokasi...
          </p>
          <p className="text-xs text-[#6E2C1B]">
            {storeConfig.storeAddress}
          </p>
        </div>
      </div>
    );
  }

  if (!resolved) {
    return (
      <MapFallbackCard
        storeConfig={storeConfig}
        externalUrl={externalUrl}
        message={
          lookupError ||
          'Gunakan tombol di bawah untuk melihat lokasi lengkap di Google Maps.'
        }
      />
    );
  }

  return (
    <div className="relative w-full h-[340px] sm:h-[400px] bg-[#F5E7B8]">
      <GoogleMap
        mapId="DEMO_MAP_ID"
        defaultCenter={resolved.location}
        defaultZoom={16}
        gestureHandling="cooperative"
        mapTypeControl={false}
        streetViewControl={true}
        fullscreenControl={true}
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        style={{ width: '100%', height: '100%' }}
      >
        <MapCameraSync center={resolved.location} />

        <AdvancedMarker
          ref={markerRef}
          position={resolved.location}
          title={`SERUPUT & KUNYAH — ${storeConfig.storeAddress}`}
          onClick={() => setInfoWindowOpen((prev) => !prev)}
        >
          <Pin
            background="#C7320B"
            borderColor="#8F2205"
            glyphColor="#FCF6E0"
            scale={1.15}
          />
        </AdvancedMarker>

        {infoWindowOpen && marker && (
          <InfoWindow
            anchor={marker}
            maxWidth={260}
            onCloseClick={() => setInfoWindowOpen(false)}
          >
            <div className="p-1 text-[#3E1004] space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-[#C7320B] shrink-0" />
                <p className="font-bold text-xs text-[#C7320B] tracking-tight">
                  SERUPUT &amp; KUNYAH
                </p>
              </div>
              <p className="text-xs font-semibold text-[#3E1004] leading-snug">
                {storeConfig.storeAddress}
              </p>
              {resolved.formattedAddress &&
                resolved.formattedAddress.toLowerCase() !==
                  storeConfig.storeAddress.toLowerCase() && (
                  <p className="text-[11px] text-[#6E2C1B] leading-snug">
                    {resolved.formattedAddress}
                  </p>
                )}
              <p className="text-[11px] text-[#6E2C1B]">
                {storeConfig.operationalHours}
              </p>
              <a
                href={externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#C7320B] hover:text-[#A12606] underline pt-0.5"
              >
                <Navigation className="w-3 h-3" />
                <span>Buka di Google Maps</span>
              </a>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

interface MapFallbackCardProps {
  storeConfig: StoreConfig;
  externalUrl: string;
  message: string;
}

const MapFallbackCard: React.FC<MapFallbackCardProps> = ({
  storeConfig,
  externalUrl,
  message,
}) => (
  <div className="w-full h-[300px] sm:h-[340px] bg-[#F5E7B8]/60 flex flex-col items-center justify-center px-6 text-center gap-4">
    <div className="w-12 h-12 rounded-2xl bg-[#C7320B]/15 text-[#C7320B] flex items-center justify-center">
      <MapPin className="w-6 h-6" />
    </div>
    <div className="max-w-md space-y-1.5">
      <h4 className="font-heading font-black text-base text-[#C7320B]">
        {storeConfig.storeAddress}
      </h4>
      <p className="text-xs text-[#6E2C1B] leading-relaxed">{message}</p>
    </div>
    <a
      href={externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C7320B] hover:bg-[#A12606] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
    >
      <ExternalLink className="w-3.5 h-3.5" />
      <span>Buka di Google Maps</span>
    </a>
  </div>
);

interface StoreLocationMapProps {
  storeConfig: StoreConfig;
  onResolvedUriChange?: (uri: string | null) => void;
}

export const StoreLocationMap: React.FC<StoreLocationMapProps> = ({
  storeConfig,
  onResolvedUriChange,
}) => {
  const [mapsApiKey, setMapsApiKey] = useState<string>(INITIAL_MAPS_API_KEY);
  const [isLoadingKey, setIsLoadingKey] = useState<boolean>(!INITIAL_MAPS_API_KEY);
  const fallbackUrl = buildExternalMapsUrl(storeConfig);

  useEffect(() => {
    if (INITIAL_MAPS_API_KEY) {
      return;
    }

    let cancelled = false;
    const loadRuntimeConfig = async () => {
      try {
        const res = await fetch('/api/maps-config', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as { apiKey?: string };
        if (!cancelled && data.apiKey) {
          setMapsApiKey(data.apiKey);
        }
      } catch {
        // Fallback UI handles static environments without backend
      } finally {
        if (!cancelled) {
          setIsLoadingKey(false);
        }
      }
    };

    void loadRuntimeConfig();
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoadingKey) {
    return (
      <div className="w-full h-[340px] sm:h-[400px] bg-[#F5E7B8]/60 flex flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="w-11 h-11 rounded-2xl bg-[#C7320B]/10 text-[#C7320B] flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-[#C7320B]">
            Menyiapkan Google Maps...
          </p>
          <p className="text-xs text-[#6E2C1B]">
            {storeConfig.storeAddress}
          </p>
        </div>
      </div>
    );
  }

  if (!mapsApiKey) {
    return (
      <MapFallbackCard
        storeConfig={storeConfig}
        externalUrl={fallbackUrl}
        message="Klik tombol di bawah untuk melihat rute dan titik lokasi langsung di aplikasi Google Maps."
      />
    );
  }

  return (
    <APIProvider
      apiKey={mapsApiKey}
      libraries={['places', 'marker']}
      language="id"
      region="ID"
    >
      <LocationMapInner
        storeConfig={storeConfig}
        onResolvedUriChange={onResolvedUriChange}
      />
    </APIProvider>
  );
};


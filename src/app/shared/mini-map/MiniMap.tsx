'use client';

import {
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import { useFormContext } from 'react-hook-form';
import L, { LeafletMouseEvent, Marker as LeafletMarker } from 'leaflet';
import {
  PiCrosshairBold,
  PiMagnifyingGlassBold,
  PiMapPinFill,
  PiSpinnerGapBold,
  PiWarningCircleBold,
  PiXBold,
} from 'react-icons/pi';
import 'leaflet/dist/leaflet.css';

type Coordinates = [number, number];

type NominatimAddress = Partial<
  Record<
    | 'country'
    | 'state'
    | 'province'
    | 'county'
    | 'municipality'
    | 'city'
    | 'town'
    | 'village'
    | 'suburb'
    | 'city_district'
    | 'quarter'
    | 'neighbourhood'
    | 'road'
    | 'pedestrian'
    | 'residential'
    | 'footway'
    | 'path'
    | 'house_number'
    | 'postcode',
    string
  >
>;

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  type?: string;
  name?: string;
  display_name?: string;
  address?: NominatimAddress;
}

interface MiniMapProps {
  className?: string;
  locationPrefix?: 'factory' | 'office' | string;
  setAddress?: (address: string) => void;
}

const DEFAULT_POSITION: Coordinates = [35.6892523, 51.3896004];
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';

const markerIcon = L.divIcon({
  className: '',
  html: `
    <span style="display:flex;width:38px;height:38px;align-items:center;justify-content:center;border:3px solid white;border-radius:50% 50% 50% 0;background:#dc2626;box-shadow:0 5px 14px rgba(15,23,42,.3);transform:rotate(-45deg)">
      <span style="display:block;width:11px;height:11px;border:3px solid white;border-radius:9999px;transform:rotate(45deg)"></span>
    </span>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -36],
});

const normalizePersianText = (value = '') =>
  value.replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/\s+/g, ' ').trim();

const hasCoordinateValue = (value: unknown) =>
  value !== undefined && value !== null && value !== '';

const getSearchCore = (query: string) => {
  const clauses = query
    .split(/[،,]/)
    .map((part) => part.trim())
    .filter(Boolean);
  const neighbourhood = clauses.find((part) => /^(محله|ناحیه)\s+/.test(part));

  return neighbourhood
    ? neighbourhood.replace(/^(محله|ناحیه)\s+/, '').trim()
    : query;
};

const stripPrefix = (value: string, prefixes: string[]) => {
  let result = normalizePersianText(value);
  prefixes.forEach((prefix) => {
    result = result.replace(new RegExp(`^${prefix}\\s*`), '').trim();
  });
  return result;
};

const isPersianLocationText = (value?: string) =>
  Boolean(value && /[\u0600-\u06ff]/.test(value));

const firstPersianValue = (...values: Array<string | undefined>) =>
  values.map(normalizePersianText).find(isPersianLocationText) || '';

const formatPersianAddress = (result: NominatimResult) => {
  const address = result.address || {};
  const state = firstPersianValue(address.state, address.province);
  const city = firstPersianValue(
    address.city,
    address.town,
    address.village,
    address.municipality,
    address.county
  );
  const district = firstPersianValue(
    address.city_district,
    address.suburb,
    address.quarter
  );
  const neighbourhood = firstPersianValue(address.neighbourhood);
  const road = firstPersianValue(
    address.road,
    address.pedestrian,
    address.residential,
    address.footway,
    address.path
  );
  const houseNumber = normalizePersianText(address.house_number);
  const country = firstPersianValue(address.country) || 'ایران';
  const roadPrefix = ['service', 'living_street', 'path', 'footway'].includes(
    result.type || ''
  )
    ? 'کوچه '
    : 'خیابان ';

  const parts = [
    country,
    state ? `استان ${stripPrefix(state, ['استان'])}` : '',
    city ? `شهر ${stripPrefix(city, ['شهرستان', 'شهر'])}` : '',
    district
      ? `${/^(منطقه|ناحیه)/.test(district) ? '' : 'منطقه '}${district}`
      : '',
    neighbourhood
      ? `${/^(محله|ناحیه)/.test(neighbourhood) ? '' : 'محله '}${neighbourhood}`
      : '',
    road
      ? `${
          /^(خیابان|کوچه|بلوار|بزرگراه|میدان|جاده)/.test(road) ? '' : roadPrefix
        }${road}`
      : '',
    houseNumber ? `پلاک ${houseNumber}` : '',
  ].filter(Boolean);

  const uniqueParts = parts.filter(
    (part, index) => parts.findIndex((item) => item === part) === index
  );

  if (uniqueParts.length >= 3) return uniqueParts.join('، ');

  const fallback = normalizePersianText(result.display_name);
  return isPersianLocationText(fallback) ? fallback : uniqueParts.join('، ');
};

const getAdministrativeValues = (result: NominatimResult) => {
  const address = result.address || {};

  return {
    state: stripPrefix(firstPersianValue(address.state, address.province), [
      'استان',
    ]),
    city: stripPrefix(
      firstPersianValue(
        address.city,
        address.town,
        address.village,
        address.municipality,
        address.county
      ),
      ['شهرستان', 'شهر']
    ),
    postcode: normalizePersianText(address.postcode).replace(/[^0-9۰-۹]/g, ''),
  };
};

function MapViewport({
  position,
  zoom,
}: {
  position: Coordinates;
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    map.flyTo(position, zoom, { duration: 0.8 });
  }, [map, position, zoom]);

  return null;
}

function MapInteractions({
  onPick,
}: {
  onPick: (coordinates: Coordinates) => void;
}) {
  useMapEvents({
    click(event: LeafletMouseEvent) {
      onPick([event.latlng.lat, event.latlng.lng]);
    },
  });

  return null;
}

export default function MiniMap({
  className = '',
  locationPrefix = '',
  setAddress,
}: MiniMapProps) {
  const { setValue, unregister, watch } = useFormContext();
  const latitudeField = `${locationPrefix}Latitude`;
  const longitudeField = `${locationPrefix}Longitude`;
  const stateField = `${locationPrefix}State`;
  const cityField = `${locationPrefix}City`;
  const addressField = `${locationPrefix}Location`;
  const latitude = watch(latitudeField);
  const longitude = watch(longitudeField);
  const formState = watch(stateField) || '';
  const formCity = watch(cityField) || '';
  const formAddress = watch(addressField) || '';

  const [position, setPosition] = useState<Coordinates>(() => {
    const initialLatitude = Number(latitude);
    const initialLongitude = Number(longitude);
    return hasCoordinateValue(latitude) &&
      hasCoordinateValue(longitude) &&
      Number.isFinite(initialLatitude) &&
      Number.isFinite(initialLongitude)
      ? [initialLatitude, initialLongitude]
      : DEFAULT_POSITION;
  });
  const [targetZoom, setTargetZoom] = useState(
    hasCoordinateValue(latitude) && hasCoordinateValue(longitude) ? 16 : 12
  );
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [selectedAddress, setSelectedAddress] = useState(() =>
    normalizePersianText(formAddress)
  );
  const [isSearching, setIsSearching] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [isCenteringState, setIsCenteringState] = useState(false);
  const [error, setError] = useState('');
  const abortController = useRef<AbortController | null>(null);
  const cityAbortController = useRef<AbortController | null>(null);
  const lastCenteredState = useRef('');
  const isStateSelected = Boolean(normalizePersianText(formState));

  useEffect(() => {
    const nextLatitude = Number(latitude);
    const nextLongitude = Number(longitude);
    if (
      hasCoordinateValue(latitude) &&
      hasCoordinateValue(longitude) &&
      Number.isFinite(nextLatitude) &&
      Number.isFinite(nextLongitude)
    ) {
      setPosition([nextLatitude, nextLongitude]);
      setTargetZoom(16);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    if (formAddress) setSelectedAddress(normalizePersianText(formAddress));
  }, [formAddress]);

  useEffect(
    () => () => {
      abortController.current?.abort();
      cityAbortController.current?.abort();
    },
    []
  );

  useEffect(() => {
    const normalizedState = normalizePersianText(formState);

    if (!normalizedState) {
      lastCenteredState.current = '';
      return;
    }

    if (normalizedState.length < 2 || lastCenteredState.current === normalizedState) {
      return;
    }

    if (
      !lastCenteredState.current &&
      hasCoordinateValue(latitude) &&
      hasCoordinateValue(longitude)
    ) {
      lastCenteredState.current = normalizedState;
      return;
    }

    const timer = window.setTimeout(async () => {
      cityAbortController.current?.abort();
      const controller = new AbortController();
      cityAbortController.current = controller;
      setIsCenteringState(true);
      setError('');
      setQuery('');
      setResults([]);

      try {
        const params = new URLSearchParams({
          format: 'jsonv2',
          q: [normalizedState, 'ایران'].filter(Boolean).join('، '),
          addressdetails: '1',
          countrycodes: 'ir',
          limit: '1',
          'accept-language': 'fa-IR,fa',
        });
        const response = await fetch(`${NOMINATIM_URL}/search?${params}`, {
          signal: controller.signal,
          headers: { 'Accept-Language': 'fa-IR,fa;q=0.9' },
        });
        if (!response.ok) throw new Error('city-search-failed');
        const cityResults = (await response.json()) as NominatimResult[];
        const cityResult = cityResults[0];

        if (!cityResult) {
          setError('استان واردشده پیدا نشد؛ نام استان را بررسی کنید.');
          return;
        }

        lastCenteredState.current = normalizedState;
        setPosition([Number(cityResult.lat), Number(cityResult.lon)]);
        setTargetZoom(12);
        unregister([latitudeField, longitudeField]);
      } catch (requestError) {
        if ((requestError as Error).name !== 'AbortError') {
          setError('امکان یافتن استان وجود ندارد؛ دوباره تلاش کنید.');
        }
      } finally {
        if (!controller.signal.aborted) setIsCenteringState(false);
      }
    }, 600);

    return () => window.clearTimeout(timer);
  }, [formState, latitude, latitudeField, longitude, longitudeField, unregister]);

  const applyLocation = useCallback(
    (result: NominatimResult, coordinates: Coordinates) => {
      const persianAddress = formatPersianAddress(result);
      const administrative = getAdministrativeValues(result);

      setPosition(coordinates);
      setTargetZoom(16);
      setValue(latitudeField, coordinates[0], {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue(longitudeField, coordinates[1], {
        shouldDirty: true,
        shouldValidate: true,
      });

      if (administrative.state) {
        lastCenteredState.current = normalizePersianText(administrative.state);
        setValue(stateField, administrative.state, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
      if (administrative.city) {
        setValue(cityField, administrative.city, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
      if (persianAddress) {
        setSelectedAddress(persianAddress);
        setAddress?.(persianAddress);
      }
    },
    [
      cityField,
      latitudeField,
      longitudeField,
      setAddress,
      setValue,
      stateField,
    ]
  );

  const reverseGeocode = useCallback(
    async (coordinates: Coordinates) => {
      abortController.current?.abort();
      const controller = new AbortController();
      abortController.current = controller;
      setPosition(coordinates);
      setResults([]);
      setError('');
      setIsResolving(true);

      try {
        const params = new URLSearchParams({
          format: 'jsonv2',
          lat: String(coordinates[0]),
          lon: String(coordinates[1]),
          zoom: '18',
          addressdetails: '1',
          'accept-language': 'fa-IR,fa',
        });
        const response = await fetch(`${NOMINATIM_URL}/reverse?${params}`, {
          signal: controller.signal,
          headers: { 'Accept-Language': 'fa-IR,fa;q=0.9' },
        });
        if (!response.ok) throw new Error('reverse-geocode-failed');
        const result = (await response.json()) as NominatimResult;
        applyLocation(result, coordinates);
      } catch (requestError) {
        if ((requestError as Error).name !== 'AbortError') {
          setError(
            'نشانی این نقطه دریافت نشد؛ دوباره تلاش کنید یا نشانی را دستی وارد نمایید.'
          );
          setValue(latitudeField, coordinates[0], { shouldDirty: true });
          setValue(longitudeField, coordinates[1], { shouldDirty: true });
        }
      } finally {
        if (!controller.signal.aborted) setIsResolving(false);
      }
    },
    [applyLocation, latitudeField, longitudeField, setValue]
  );

  const search = async () => {
    if (!isStateSelected) {
      setError('ابتدا نام استان را وارد کنید تا نقشه روی همان استان قرار بگیرد.');
      return;
    }

    const normalizedQuery = normalizePersianText(query);
    if (normalizedQuery.length < 3) {
      setError('برای جست‌وجو دست‌کم سه حرف وارد کنید.');
      return;
    }

    abortController.current?.abort();
    const controller = new AbortController();
    abortController.current = controller;
    setIsSearching(true);
    setError('');
    setResults([]);

    const locationContext = [formCity, formState]
      .map(normalizePersianText)
      .filter((value) => value && !normalizedQuery.includes(value))
      .join('، ');
    const searchCore = getSearchCore(normalizedQuery);
    const contextualQuery = locationContext
      ? `${searchCore}، ${locationContext}، ایران`
      : `${searchCore}، ایران`;

    try {
      const params = new URLSearchParams({
        format: 'jsonv2',
        q: contextualQuery,
        addressdetails: '1',
        countrycodes: 'ir',
        limit: '6',
        dedupe: '1',
        'accept-language': 'fa-IR,fa',
      });
      const response = await fetch(`${NOMINATIM_URL}/search?${params}`, {
        signal: controller.signal,
        headers: { 'Accept-Language': 'fa-IR,fa;q=0.9' },
      });
      if (!response.ok) throw new Error('search-failed');
      const searchResults = (await response.json()) as NominatimResult[];
      setResults(searchResults);
      if (searchResults.length === 0) {
        setError(
          'نتیجه‌ای پیدا نشد. نام محله یا خیابان را کوتاه‌تر وارد کنید؛ سپس نقطه دقیق را روی نقشه انتخاب نمایید.'
        );
      }
    } catch (requestError) {
      if ((requestError as Error).name !== 'AbortError') {
        setError('جست‌وجوی نشانی در دسترس نیست؛ لطفاً دوباره تلاش کنید.');
      }
    } finally {
      if (!controller.signal.aborted) setIsSearching(false);
    }
  };

  const selectSearchResult = (result: NominatimResult) => {
    const nextPosition: Coordinates = [Number(result.lat), Number(result.lon)];
    setResults([]);
    setQuery(formatPersianAddress(result));
    applyLocation(result, nextPosition);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('مکان‌یابی در این مرورگر پشتیبانی نمی‌شود.');
      return;
    }

    setError('');
    setIsResolving(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => reverseGeocode([coords.latitude, coords.longitude]),
      () => {
        setIsResolving(false);
        setError('دسترسی به موقعیت فعلی ممکن نشد.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const markerHandlers = useMemo(
    () => ({
      dragend(event: L.DragEndEvent) {
        const marker = event.target as LeafletMarker;
        const coordinates = marker.getLatLng();
        reverseGeocode([coordinates.lat, coordinates.lng]);
      },
    }),
    [reverseGeocode]
  );

  return (
    <div
      dir="rtl"
      className={`overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm ${className}`}
    >
      <div className="relative border-b border-gray-200 bg-gray-50 p-3 sm:p-4">
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <PiMagnifyingGlassBold
              className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
              aria-hidden="true"
            />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setError('');
              }}
              onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void search();
                }
              }}
              aria-label="جست‌وجوی نشانی"
              placeholder={isStateSelected ? 'مثلاً نام شهر، محله یا خیابان' : 'ابتدا استان را وارد کنید'}
              disabled={!isStateSelected || isCenteringState}
              className="h-11 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-10 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
            />
            {query && !isSearching && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setResults([]);
                }}
                aria-label="پاک کردن جست‌وجو"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              >
                <PiXBold className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => void search()}
            disabled={!isStateSelected || isSearching || isCenteringState}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-wait disabled:opacity-70"
          >
            {isSearching ? (
              <PiSpinnerGapBold className="h-5 w-5 animate-spin" />
            ) : (
              <PiMagnifyingGlassBold className="h-5 w-5" />
            )}
            <span className="hidden sm:inline">جست‌وجو</span>
          </button>
          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={!isStateSelected || isCenteringState}
            title="استفاده از موقعیت فعلی"
            aria-label="استفاده از موقعیت فعلی"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-300 bg-white text-gray-700 transition hover:border-gray-900 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PiCrosshairBold className="h-5 w-5" />
          </button>
        </div>

        {results.length > 0 && (
          <div className="absolute inset-x-3 top-[64px] z-[1100] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl sm:inset-x-4 sm:top-[68px]">
            <ul className="max-h-64 overflow-y-auto py-1">
              {results.map((result) => (
                <li key={result.place_id}>
                  <button
                    type="button"
                    onClick={() => selectSearchResult(result)}
                    className="flex w-full items-start gap-3 px-4 py-3 text-right transition hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                  >
                    <PiMapPinFill className="text-red-600 mt-0.5 h-5 w-5 shrink-0" />
                    <span className="text-sm leading-6 text-gray-800">
                      {formatPersianAddress(result)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="bg-amber-50 text-amber-800 mt-3 flex items-start gap-2 rounded-lg px-3 py-2 text-xs leading-5"
          >
            <PiWarningCircleBold className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="relative h-[360px] min-h-[360px] w-full bg-gray-100">
        <MapContainer
          center={position}
          zoom={14}
          scrollWheelZoom
          className="z-0 h-full w-full"
          attributionControl
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; مشارکت‌کنندگان <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <Marker
            position={position}
            icon={markerIcon}
            draggable
            eventHandlers={markerHandlers}
          >
            <Popup>
              <div dir="rtl" className="max-w-64 text-right text-xs leading-6">
                {selectedAddress || 'نشانگر را جابه‌جا کنید یا روی نقشه بزنید.'}
              </div>
            </Popup>
          </Marker>
          <MapViewport position={position} zoom={targetZoom} />
          {isStateSelected && !isCenteringState && (
            <MapInteractions onPick={reverseGeocode} />
          )}
        </MapContainer>

        {!isStateSelected && (
          <div className="absolute inset-0 z-[600] flex items-center justify-center bg-white/75 p-6 text-center backdrop-blur-[2px]">
            <div className="max-w-sm rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm font-medium leading-7 text-gray-700 shadow-lg">
              ابتدا نام استان را در فرم وارد کنید؛ نقشه به‌صورت خودکار روی همان استان قرار می‌گیرد.
            </div>
          </div>
        )}

        {isCenteringState && (
          <div className="absolute inset-0 z-[600] flex items-center justify-center bg-white/65 backdrop-blur-[1px]">
            <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-lg">
              <PiSpinnerGapBold className="h-5 w-5 animate-spin" />
              در حال انتقال نقشه به استان انتخاب‌شده…
            </div>
          </div>
        )}

        {isResolving && (
          <div className="bg-white/45 pointer-events-none absolute inset-0 z-[500] flex items-center justify-center backdrop-blur-[1px]">
            <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-lg">
              <PiSpinnerGapBold className="h-5 w-5 animate-spin" />
              در حال دریافت نشانی فارسی…
            </div>
          </div>
        )}
      </div>

      <div className="flex items-start gap-2 border-t border-gray-200 bg-white px-4 py-3 text-xs leading-5 text-gray-600">
        <PiMapPinFill className="text-red-600 mt-0.5 h-4 w-4 shrink-0" />
        <span>
          برای ثبت دقیق، روی نقشه بزنید یا نشانگر را جابه‌جا کنید. استان، شهر و
          نشانی فارسی به‌صورت خودکار تکمیل می‌شود.
        </span>
      </div>
    </div>
  );
}

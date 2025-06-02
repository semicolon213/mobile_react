import { useRef, useCallback, useEffect } from 'react';
import { Point } from '../types';

const TMAP_API_KEY = process.env.REACT_APP_TMAP_API_KEY;

export const useMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const initMap = useCallback(() => {
    if (window.Tmapv2 && mapRef.current) {
      mapInstanceRef.current = new window.Tmapv2.Map(mapRef.current, {
        center: new window.Tmapv2.LatLng(37.49241689559544, 127.03171389453507),
        width: "100%",
        height: "100%",
        zoom: 15,
        zoomControl: false,
        scrollwheel: true,
        mapType: 'DARK',
      });
    }
  }, []);

  const setMarker = useCallback((position: Point) => {
    if (window.Tmapv2 && mapInstanceRef.current) {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      markerRef.current = new window.Tmapv2.Marker({
        position: new window.Tmapv2.LatLng(position.lat, position.lng),
        map: mapInstanceRef.current,
        icon: '/assets/marker-modern.svg',
        iconSize: new window.Tmapv2.Size(44, 44),
        label: '내 위치',
      });
      mapInstanceRef.current.setCenter(new window.Tmapv2.LatLng(position.lat, position.lng));
    }
  }, []);

  const getCurrentLocation = useCallback(async (): Promise<Point> => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            resolve({ lat: latitude, lng: longitude });
          },
          (error) => {
            reject(error);
          }
        );
      } else {
        reject(new Error('이 브라우저는 위치를 지원하지 않습니다.'));
      }
    });
  }, []);

  useEffect(() => {
    initMap();
  }, [initMap]);

  return {
    mapRef,
    mapInstanceRef,
    markerRef,
    setMarker,
    getCurrentLocation,
  };
}; 
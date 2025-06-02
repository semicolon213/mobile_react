import { useState, useEffect, useCallback } from 'react';
import { Location, Point } from '../types';

export const useLocations = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [address, setAddress] = useState('');

  // 여행지 데이터 로드
  useEffect(() => {
    fetch(process.env.PUBLIC_URL + '/locations.csv')
      .then(res => res.text())
      .then(text => {
        const lines = text.trim().split('\n').slice(1);
        const locs = lines.map(line => {
          const cols = line.split(',');
          const name = cols[0];
          const lat = parseFloat(cols[4]);
          const lng = parseFloat(cols[5]);
          if (!isNaN(lat) && !isNaN(lng)) {
            return { name, lat, lng };
          }
          return null;
        }).filter(Boolean) as Location[];
        setLocations(locs);
      });
  }, []);

  // 현재 위치 및 주소 가져오기 (마커 제어는 상위에서)
  const fetchCurrentLocation = useCallback(async (getCurrentLocation: () => Promise<Point>) => {
    try {
      const position = await getCurrentLocation();
      const url = `https://apis.openapi.sk.com/tmap/geo/reversegeocoding?version=1&lat=${position.lat}&lon=${position.lng}&coordType=WGS84GEO&addressType=A10&appKey=${process.env.REACT_APP_TMAP_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.addressInfo) {
        const { legalDong, roadName, buildingName } = data.addressInfo;
        const simplifiedAddress = `${legalDong} ${roadName}${buildingName ? ' ' + buildingName : ''}`;
        setAddress(simplifiedAddress);
      } else {
        setAddress(`위도: ${position.lat.toFixed(5)}, 경도: ${position.lng.toFixed(5)}`);
      }
      return position;
    } catch (error) {
      setAddress('위치를 가져오는 데 실패했습니다.');
      return null;
    }
  }, []);

  return {
    locations,
    address,
    setAddress,
    fetchCurrentLocation,
  };
}; 
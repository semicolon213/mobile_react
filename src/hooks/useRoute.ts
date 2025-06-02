import { useState, useCallback } from 'react';
import $ from 'jquery';
import { RouteInfo, Point } from '../types';

const TMAP_API_KEY = process.env.REACT_APP_TMAP_API_KEY;

export const useRoute = (mapInstanceRef: React.MutableRefObject<any>) => {
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  // 자동차 경로 생성
  const createCarRoute = useCallback(async (startPoint: Point, endPoint: Point) => {
    if (!mapInstanceRef.current) return;
    try {
      const headers = { appKey: TMAP_API_KEY };
      const response = await $.ajax({
        type: "POST",
        headers: headers,
        url: `https://apis.openapi.sk.com/tmap/routes?version=1&format=json&callback=result&appKey=${TMAP_API_KEY}`,
        data: {
          startX: startPoint.lng,
          startY: startPoint.lat,
          endX: endPoint.lng,
          endY: endPoint.lat,
          reqCoordType: "WGS84GEO",
          resCoordType: "EPSG3857",
          searchOption: "0",
          trafficInfo: "Y"
        }
      });

      const resultData = response.features;
      const result = resultData[0].properties;
      setRouteInfo({
        distance: (result.totalDistance / 1000),
        time: (result.totalTime / 60),
        fare: result.totalFare
      });

      resultData.forEach((data: any) => {
        if (data.geometry.type === "LineString") {
          const coordinates = data.geometry.coordinates.map((coord: number[]) => {
            const point = new window.Tmapv2.Point(coord[0], coord[1]);
            return window.Tmapv2.Projection.convertEPSG3857ToWGS84GEO(point);
          });

          const trafficColors = {
            0: "#5B8CFF", // 정보없음: 연파랑
            1: "#61AB25", // 원활: 연두
            2: "#FFD700", // 서행: 노랑
            3: "#FF8C00", // 지체: 주황
            4: "#D61125"  // 정체: 빨강
          };

          if (data.geometry.traffic && data.geometry.traffic.length > 0) {
            data.geometry.traffic.forEach((traffic: number[]) => {
              const sectionPoint = coordinates.slice(traffic[0], traffic[1] + 1);
              const lineColor = trafficColors[traffic[2] as keyof typeof trafficColors] || trafficColors[0];
              new window.Tmapv2.Polyline({
                path: sectionPoint,
                strokeColor: lineColor,
                strokeWeight: 8,
                strokeOpacity: 0.85,
                strokeStyle: 'longdash',
                map: mapInstanceRef.current
              });
            });
          } else {
            new window.Tmapv2.Polyline({
              path: coordinates,
              strokeColor: "#5B8CFF",
              strokeWeight: 8,
              strokeOpacity: 0.85,
              strokeStyle: 'longdash',
              map: mapInstanceRef.current
            });
          }
        }
      });
    } catch (error) {
      throw new Error('경로를 생성하는데 실패했습니다.');
    }
  }, [mapInstanceRef]);

  // 대중교통 경로 생성
  const createTransitRoute = useCallback(async (startPoint: Point, endPoint: Point) => {
    if (!mapInstanceRef.current) return;
    try {
      const headers = new Headers({
        'accept': 'application/json',
        'content-type': 'application/json',
        'appKey': TMAP_API_KEY || ''
      });
      const response = await fetch('https://apis.openapi.sk.com/transit/routes', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          startX: startPoint.lng,
          startY: startPoint.lat,
          endX: endPoint.lng,
          endY: endPoint.lat,
          lang: 0,
          format: 'json',
          count: 1
        })
      });
      const data = await response.json();
      let totalDistance = 0;
      let totalTime = 0;
      let totalFare = 0;

      if (data.metaData && data.metaData.plan && data.metaData.plan.itineraries && data.metaData.plan.itineraries.length > 0) {
        const itinerary = data.metaData.plan.itineraries[0];
        totalDistance = itinerary.distance / 1000;
        totalTime = Math.round(itinerary.duration / 60);
        totalFare = itinerary.fare ? itinerary.fare.regular.totalFare : 0;

        itinerary.legs.forEach((leg: any) => {
          if (leg.mode === 'WALK' || leg.mode === 'BUS' || leg.mode === 'SUBWAY') {
            const legPath = leg.passShape && leg.passShape.linestring
              ? leg.passShape.linestring.split(' ').map((pair: string) => {
                  const [lng, lat] = pair.split(',').map(Number);
                  return new window.Tmapv2.LatLng(lat, lng);
                })
              : [];

            if (legPath.length > 1) {
              let strokeColor;
              let strokeStyle = 'solid';
              switch (leg.mode) {
                case 'WALK':
                  strokeColor = '#888';
                  strokeStyle = 'shortdot';
                  break;
                case 'BUS':
                  strokeColor = '#8B5CF6'; // 보라
                  strokeStyle = 'solid';
                  break;
                case 'SUBWAY':
                  strokeColor = '#FF9800'; // 오렌지
                  strokeStyle = 'longdash';
                  break;
                default:
                  strokeColor = '#888';
              }

              new window.Tmapv2.Polyline({
                path: legPath,
                strokeColor: strokeColor,
                strokeWeight: 8,
                strokeOpacity: 0.85,
                strokeStyle: strokeStyle,
                map: mapInstanceRef.current
              });
            }
          }
        });

        setRouteInfo({
          distance: totalDistance,
          time: totalTime,
          fare: totalFare
        });
      } else {
        throw new Error('대중교통 경로를 찾을 수 없습니다.');
      }
    } catch (error) {
      throw new Error('대중교통 경로를 생성하는데 실패했습니다.');
    }
  }, [mapInstanceRef]);

  return {
    routeInfo,
    setRouteInfo,
    createCarRoute,
    createTransitRoute,
  };
}; 
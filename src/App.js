import './App.css'
import { useState, useEffect, useRef, useCallback } from 'react'
import $ from 'jquery'

// Tmap API 키 상수 정의
const TMAP_API_KEY = 'US3lRlDB4J7h64o8wkq6kUYZAtYW44e7BGFUBz58';

// App 컴포넌트 정의
function App() {
  // 이동수단, 시간, 주소 상태값 선언
  const [selectedTransports, setSelectedTransports] = useState([])
  const [time, setTime] = useState(20)
  const [address, setAddress] = useState('')
  const [locations, setLocations] = useState([])
  const [routeInfo, setRouteInfo] = useState(null)
  const [routeLine, setRouteLine] = useState(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [savedSettings, setSavedSettings] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // 지도, 마커, 원, 폴리곤 등 지도 객체를 저장할 ref 선언
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const outerCircleRef = useRef(null);
  const innerCircleRef = useRef(null);
  const ringPolygonRef = useRef(null);

  // 이동수단 토글 함수
  const toggleTransport = (type) => {
    setSelectedTransports((prev) => {
      // 자동차와 대중교통은 동시에 선택 불가
      if (type === 'car' && prev.includes('public')) {
        return ['car'];
      }
      if (type === 'public' && prev.includes('car')) {
        return ['public'];
      }
      // 기본 토글
      return prev.includes(type) ? [] : [type];
    });
  }

  // 현재 위치 가져오기 함수 (주소 변환 포함)
  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          if (latitude !== undefined && longitude !== undefined) {
            // Tmap API로 위경도를 주소로 변환
            const url = `https://apis.openapi.sk.com/tmap/geo/reversegeocoding?version=1&lat=${latitude}&lon=${longitude}&coordType=WGS84GEO&addressType=A10&appKey=${TMAP_API_KEY}`;

            fetch(url)
              .then(response => response.json())
              .then(data => {
                if (data && data.addressInfo) {
                  const { legalDong, roadName, buildingName } = data.addressInfo;
                  const simplifiedAddress = `${legalDong} ${roadName}${buildingName ? ' ' + buildingName : ''}`;
                  setAddress(simplifiedAddress);
                } else {
                  setAddress(`위도: ${latitude.toFixed(5)}, 경도: ${longitude.toFixed(5)}`);
                }
                // 지도에 마커 표시
                if (window.Tmapv2 && mapInstanceRef.current) {
                  if (markerRef.current) {
                    markerRef.current.setMap(null);
                  }
                  markerRef.current = new window.Tmapv2.Marker({
                    position: new window.Tmapv2.LatLng(latitude, longitude),
                    map: mapInstanceRef.current,
                  });
                  mapInstanceRef.current.setCenter(new window.Tmapv2.LatLng(latitude, longitude));
                }
              })
              .catch((error) => {
                console.error(error);
                alert('주소 변환에 실패했습니다.');
                setAddress(`위도: ${latitude.toFixed(5)}, 경도: ${longitude.toFixed(5)}`);
              });
          }
        },
        () => {
          alert('위치를 가져오는 데 실패했습니다.');
        }
      );
    } else {
      alert('이 브라우저는 위치를 지원하지 않습니다.');
    }
  }, [])

  // 컴포넌트 마운트 시 현재 위치 가져오고 지도 생성
  useEffect(() => {
    getCurrentLocation()
    if (window.Tmapv2 && mapRef.current) {
      mapInstanceRef.current = new window.Tmapv2.Map(mapRef.current, {
        center: new window.Tmapv2.LatLng(37.49241689559544, 127.03171389453507),
        width: "100%",
        height: "100%",
        zoom: 15,
        zoomControl: false,
        scrollwheel: true,
      });
    }
  }, [getCurrentLocation])

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + '/locations.csv')
      .then(res => res.text())
      .then(text => {
        // CSV 파싱 (첫 줄은 헤더)
        const lines = text.trim().split('\n').slice(1);
        const locs = lines.map(line => {
          const cols = line.split(',');
          const name = cols[0]; // 관광지명
          const lat = parseFloat(cols[4]);
          const lng = parseFloat(cols[5]);
          if (!isNaN(lat) && !isNaN(lng)) {
            return { name, lat, lng };
          }
          return null;
        }).filter(Boolean);
        console.log('CSV에서 파싱된 위치:', locs);
        setLocations(locs);
      });
  }, []);

  // 이동수단/시간 변경 시 원, 도넛형 영역 그리기
  useEffect(() => {
    if (!markerRef.current || !mapInstanceRef.current) {
      return;
    }
    // 기존 원/폴리곤 제거
    if (outerCircleRef.current) {
      outerCircleRef.current.setMap(null);
      outerCircleRef.current = null;
    }
    if (innerCircleRef.current) {
      innerCircleRef.current.setMap(null);
      innerCircleRef.current = null;
    }
    if (ringPolygonRef.current) {
      ringPolygonRef.current.setMap(null);
      ringPolygonRef.current = null;
    }
    if (selectedTransports.length === 0) {
      return;
    }
    const position = markerRef.current.getPosition();
    const latitude = position.lat();
    const longitude = position.lng();

    // 이동수단별 평균 속도(미터/시간)
    const speedTable = {
      car: 60000,
      public: 45000, // 버스, 지하철, 도보의 평균 속도
    };
    // 이동수단별 감속 계수
    const reductionTable = {
      car: 0.7,
      public: 0.5, // 대중교통의 평균 감속 계수
    };

    const transport = selectedTransports[0]; // 단일 선택만 가능
    const speed = speedTable[transport] || 0;
    const avgSpeedMpm = speed / 60; // 분당 미터
    let outerRadius = avgSpeedMpm * time; // 미터

    // 감속 계수 적용
    const reduction = reductionTable[transport] || 1;
    outerRadius = outerRadius * reduction;

    const innerRadius = outerRadius * 0.72;

    // 외부/내부 원 그리기 (투명)
    outerCircleRef.current = new window.Tmapv2.Circle({
      center: new window.Tmapv2.LatLng(latitude, longitude),
      radius: outerRadius,
      strokeWeight: 2,
      strokeColor: "#3399ff",
      strokeOpacity: 0.7,
      fillColor: "#3399ff",
      fillOpacity: 0,
      map: mapInstanceRef.current,
    });

    innerCircleRef.current = new window.Tmapv2.Circle({
      center: new window.Tmapv2.LatLng(latitude, longitude),
      radius: innerRadius,
      strokeWeight: 2,
      strokeColor: "#3399ff",
      strokeOpacity: 0.7,
      fillColor: "#3399ff",
      fillOpacity: 0,
      map: mapInstanceRef.current,
    });

    // 도넛형(링) 폴리곤 경로 계산
    const pointsCount = 60;
    const metersToLatLng = (lat, lng, dx, dy) => {
      const latConv = 111320;
      const lngConv = 111320 * Math.cos((lat * Math.PI) / 180);
      const newLat = lat + dy / latConv;
      const newLng = lng + dx / lngConv;
      return new window.Tmapv2.LatLng(newLat, newLng);
    };

    const outerPoints = [];
    const innerPoints = [];
    for (let i = 0; i <= pointsCount; i++) {
      const angle = (2 * Math.PI * i) / pointsCount;
      const ox = outerRadius * Math.cos(angle);
      const oy = outerRadius * Math.sin(angle);
      outerPoints.push(metersToLatLng(latitude, longitude, ox, oy));
    }
    for (let i = pointsCount; i >= 0; i--) {
      const angle = (2 * Math.PI * i) / pointsCount;
      const ix = innerRadius * Math.cos(angle);
      const iy = innerRadius * Math.sin(angle);
      innerPoints.push(metersToLatLng(latitude, longitude, ix, iy));
    }

    const ringPath = outerPoints.concat(innerPoints);

    ringPolygonRef.current = new window.Tmapv2.Polygon({
      paths: ringPath,
      strokeWeight: 2,
      strokeColor: "#3399ff",
      strokeOpacity: 0.7,
      fillColor: "#3399ff",
      fillOpacity: 0.2,
      map: mapInstanceRef.current,
    });

  }, [selectedTransports, time])

  // 경로 생성 함수
  const createRoute = useCallback(async (startPoint, endPoint) => {
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
          searchOption: selectedTransports.includes('car') ? "0" : "1", // 0: 자동차, 1: 대중교통
          trafficInfo: "Y"
        }
      });

      const resultData = response.features;
      const result = resultData[0].properties;
      
      // 경로 정보 저장
      setRouteInfo({
        distance: (result.totalDistance / 1000).toFixed(1),
        time: (result.totalTime / 60).toFixed(0),
        fare: result.totalFare
      });

      // 기존 경로 제거
      if (routeLine) {
        routeLine.setMap(null);
      }

      // 새로운 경로 그리기
      resultData.forEach(data => {
        if (data.geometry.type === "LineString") {
          const coordinates = data.geometry.coordinates.map(coord => {
            const point = new window.Tmapv2.Point(coord[0], coord[1]);
            return window.Tmapv2.Projection.convertEPSG3857ToWGS84GEO(point);
          });

          // 교통 상황에 따른 색상 설정
          const trafficColors = {
            0: "#06050D", // 정보없음
            1: "#61AB25", // 원활
            2: "#FFFF00", // 서행
            3: "#E87506", // 지체
            4: "#D61125"  // 정체
          };

          if (data.geometry.traffic && data.geometry.traffic.length > 0) {
            // 교통 상황별로 다른 색상의 선 그리기
            data.geometry.traffic.forEach(traffic => {
              const sectionPoint = coordinates.slice(traffic[0], traffic[1] + 1);
              const lineColor = trafficColors[traffic[2]] || trafficColors[0];

              const polyline = new window.Tmapv2.Polyline({
                path: sectionPoint,
                strokeColor: lineColor,
                strokeWeight: 6,
                map: mapInstanceRef.current
              });
              setRouteLine(polyline);
            });
          } else {
            // 교통 정보가 없는 경우 기본 색상으로 그리기
            const polyline = new window.Tmapv2.Polyline({
              path: coordinates,
              strokeColor: "#DD0000",
              strokeWeight: 6,
              map: mapInstanceRef.current
            });
            setRouteLine(polyline);
          }
        }
      });
    } catch (error) {
      console.error('경로 생성 에러:', error);
      alert('경로를 생성하는데 실패했습니다.');
    }
  }, [selectedTransports, routeLine]);

  // 랜덤 여행 버튼 클릭 핸들러 수정
  const handleRandomTravel = useCallback(() => {
    if (
      !markerRef.current ||
      !mapInstanceRef.current ||
      !outerCircleRef.current ||
      !innerCircleRef.current
    ) {
      alert('지도를 초기화하거나 이동수단/시간을 선택해주세요.');
      return;
    }

    // 중심과 반지름 정보 가져오기
    const center = outerCircleRef.current.getCenter();
    const outerRadius = outerCircleRef.current.getRadius();
    const innerRadius = innerCircleRef.current.getRadius();

    // 도넛 영역 내에 있는 위치만 필터링
    const latConv = 111320;
    const lngConv = 111320 * Math.cos((center.lat() * Math.PI) / 180);

    const filterInDonut = locations.filter(({ lat, lng }) => {
      const dLat = (lat - center.lat()) * latConv;
      const dLng = (lng - center.lng()) * lngConv;
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      return dist >= innerRadius && dist <= outerRadius;
    });

    if (filterInDonut.length === 0) {
      alert('도넛 영역 내에 여행지가 없습니다.');
      return;
    }

    // 랜덤 위치 선택
    const randomIdx = Math.floor(Math.random() * filterInDonut.length);
    const selectedLoc = filterInDonut[randomIdx];
    setSelectedLocation(selectedLoc);

    // 기존 랜덤 마커 제거
    if (window._randomTravelMarkerA) {
      window._randomTravelMarkerA.setMap(null);
    }
    if (window._randomTravelMarkerB) {
      window._randomTravelMarkerB.setMap(null);
    }

    // 출발지 마커
    window._randomTravelMarkerA = new window.Tmapv2.Marker({
      position: center,
      map: mapInstanceRef.current,
      label: 'A',
    });

    // 도착지 마커
    window._randomTravelMarkerB = new window.Tmapv2.Marker({
      position: new window.Tmapv2.LatLng(selectedLoc.lat, selectedLoc.lng),
      map: mapInstanceRef.current,
    });

    // 기존 InfoWindow 제거
    if (window._randomTravelInfoWindowB) {
      window._randomTravelInfoWindowB.setMap(null);
    }

    // 관광지명 InfoWindow 생성
    window._randomTravelInfoWindowB = new window.Tmapv2.InfoWindow({
      position: new window.Tmapv2.LatLng(selectedLoc.lat, selectedLoc.lng),
      content: `<div style="background:#fff;padding:4px 8px;border-radius:6px;border:1px solid #3399ff;font-size:14px;white-space:nowrap;">${selectedLoc.name}</div>`,
      type: 2,
      map: mapInstanceRef.current,
      offset: new window.Tmapv2.Point(0, -30),
    });

    // 경로 생성
    createRoute(
      { lat: center.lat(), lng: center.lng() },
      { lat: selectedLoc.lat, lng: selectedLoc.lng }
    );

    // 지도 중심 이동
    mapInstanceRef.current.setCenter(new window.Tmapv2.LatLng(selectedLoc.lat, selectedLoc.lng));
  }, [createRoute, locations]);

  // 설정 저장 함수
  const saveSettings = useCallback(() => {
    const settings = {
      selectedTransports,
      time,
      address
    };
    setSavedSettings(settings);
    setIsSettingsOpen(false);
  }, [selectedTransports, time, address]);

  // 저장된 설정으로 랜덤 여행 시작
  const handleRandomTravelWithSettings = useCallback(() => {
    if (savedSettings) {
      setSelectedTransports(savedSettings.selectedTransports);
      setTime(savedSettings.time);
      setAddress(savedSettings.address);
      
      // 약간의 지연 후 랜덤 여행 시작
      setTimeout(() => {
        handleRandomTravel();
      }, 100);
    } else {
      alert('먼저 설정을 저장해주세요.');
      setIsSettingsOpen(true);
    }
  }, [savedSettings, handleRandomTravel]);

  // 렌더링 부분
  return (
    <div className="app-wrapper">
      <div className="app-container">
        <header className="app-header">
          <div className="header-inner">
            <h1 className="header-logo">GOSTOP</h1>
          </div>
          <button 
            className="settings-btn"
            onClick={() => setIsSettingsOpen(true)}
            title="설정"
          >
            <i className="fas fa-cog"></i>
          </button>
        </header>

        <main className="app-main">
          {/* 지도 표시 */}
          <div className="map-container">
            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
          </div>

          {/* 여행 정보 표시 */}
          <div className="travel-info">
            {routeInfo ? (
              <div className="travel-info-section">
                <div className="travel-info-header">
                  <h3 className="section-title">여행 정보</h3>
                  <button 
                    className="detail-btn"
                    onClick={() => setIsDetailOpen(true)}
                    title="상세 정보 보기"
                  >
                    <i className="fas fa-info-circle"></i>
                  </button>
                </div>
                <div className="route-info">
                  <div className="route-info-item">
                    <i className="fas fa-road"></i>
                    <span>총 거리: {routeInfo.distance}km</span>
                  </div>
                  <div className="route-info-item">
                    <i className="fas fa-clock"></i>
                    <span>예상 소요 시간: {routeInfo.time}분</span>
                  </div>
                  {routeInfo.fare > 0 && (
                    <div className="route-info-item">
                      <i className="fas fa-won-sign"></i>
                      <span>예상 요금: {routeInfo.fare}원</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="no-route-message">
                <i className="fas fa-map-marked-alt"></i>
                <p>랜덤 여행을 시작하면 여행 정보가 표시됩니다.</p>
              </div>
            )}
          </div>

          {/* 랜덤 여행 버튼 */}
          <button
            className="start-btn"
            onClick={handleRandomTravelWithSettings}
          >
            <i className="fas fa-random"></i>
            랜덤 여행 시작하기
          </button>
        </main>
      </div>

      {/* 설정 팝업 */}
      {isSettingsOpen && (
        <div className="settings-popup-overlay">
          <div className="settings-popup">
            <div className="settings-popup-header">
              <h2>설정</h2>
              <button 
                className="close-btn"
                onClick={saveSettings}
                title="설정 저장"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="settings-popup-content">
              <div className="settings-grid">
                {/* 현재 위치 입력/버튼 */}
                <section className="location-section">
                  <h3 className="section-title">현재 위치</h3>
                  <div className="location-input-wrapper">
                    <input
                      type="text"
                      placeholder="위치를 입력하세요"
                      className="location-input"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                    <button 
                      className="location-btn" 
                      onClick={getCurrentLocation}
                      title="현재 위치 가져오기"
                    >
                      <i className="fas fa-location-crosshairs"></i>
                    </button>
                  </div>
                </section>

                {/* 이동수단 선택 */}
                <section className="transport-section">
                  <h3 className="section-title">이동 수단</h3>
                  <div className="transport-grid">
                    {[
                      { icon: 'car', type: 'car', label: '자동차' },
                      { icon: 'bus', type: 'public', label: '대중교통' },
                    ].map((item) => (
                      <button
                        key={item.type}
                        className={`transport-btn ${selectedTransports.includes(item.type)
                          ? 'transport-btn-selected'
                          : 'transport-btn-default'
                          }`}
                        onClick={() => toggleTransport(item.type)}
                      >
                        <i className={`fas fa-${item.icon}`}></i>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </section>

                {/* 시간 설정 */}
                <section className="time-section">
                  <h3 className="section-title">여행 시간</h3>
                  <div className="time-range-container">
                    <input
                      type="range"
                      min="20"
                      max="720"
                      value={time}
                      onChange={(e) => setTime(parseInt(e.target.value))}
                      className="time-range-slider"
                      step="10"
                    />
                    <div className="time-range-labels">
                      <span>20분</span>
                      <span className="current-time">
                        {Math.floor(time / 60)}시간 {time % 60}분
                      </span>
                      <span>12시간</span>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 상세 정보 팝업 */}
      {isDetailOpen && selectedLocation && (
        <div className="detail-popup-overlay">
          <div className="detail-popup">
            <div className="detail-popup-header">
              <h2>여행 상세 정보</h2>
              <button 
                className="close-btn"
                onClick={() => setIsDetailOpen(false)}
                title="닫기"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="detail-popup-content">
              <div className="detail-grid">
                <div className="detail-section">
                  <h3 className="detail-title">
                    <i className="fas fa-map-marker-alt"></i>
                    여행지 정보
                  </h3>
                  <div className="detail-info">
                    <div className="detail-info-item">
                      <i className="fas fa-map-marker-alt"></i>
                      <span>{selectedLocation.name}</span>
                    </div>
                    <div className="detail-info-item">
                      <i className="fas fa-location-arrow"></i>
                      <span>위도: {selectedLocation.lat.toFixed(6)}</span>
                    </div>
                    <div className="detail-info-item">
                      <i className="fas fa-location-arrow"></i>
                      <span>경도: {selectedLocation.lng.toFixed(6)}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3 className="detail-title">
                    <i className="fas fa-route"></i>
                    이동 경로
                  </h3>
                  <div className="detail-info">
                    <div className="detail-info-item">
                      <i className="fas fa-road"></i>
                      <span>총 거리: {routeInfo.distance}km</span>
                    </div>
                    <div className="detail-info-item">
                      <i className="fas fa-clock"></i>
                      <span>예상 소요 시간: {routeInfo.time}분</span>
                    </div>
                    {routeInfo.fare > 0 && (
                      <div className="detail-info-item">
                        <i className="fas fa-won-sign"></i>
                        <span>예상 요금: {routeInfo.fare}원</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="detail-section">
                  <h3 className="detail-title">
                    <i className="fas fa-car"></i>
                    이동 수단
                  </h3>
                  <div className="detail-info">
                    <div className="detail-info-item">
                      <i className={selectedTransports.includes('car') ? 'fas fa-car' : 'fas fa-bus'}></i>
                      <span>{selectedTransports.includes('car') ? '자동차' : '대중교통'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
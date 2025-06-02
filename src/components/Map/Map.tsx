import React from 'react';
import styled from 'styled-components';
import { useMap } from '../../hooks/useMap';

const MapContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

export const Map: React.FC = () => {
  const { mapRef } = useMap();

  return (
    <MapContainer>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </MapContainer>
  );
}; 
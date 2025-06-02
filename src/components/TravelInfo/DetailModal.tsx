import React from 'react';
import styled from 'styled-components';
import { Modal } from '../common/Modal';
import { Location, RouteInfo } from '../../types';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLocation: Location | null;
  routeInfo: RouteInfo | null;
  selectedTransports: string[];
}

const DetailGrid = styled.div`
  display: grid;
  gap: 20px;
`;

const DetailSection = styled.section`
  h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 12px 0;
    font-size: 1.1rem;
    color: #333;

    i {
      color: #3399ff;
    }
  }
`;

const DetailInfo = styled.div`
  display: grid;
  gap: 8px;
`;

const DetailInfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;

  i {
    color: #3399ff;
    width: 16px;
  }
`;

export const DetailModal: React.FC<DetailModalProps> = ({
  isOpen,
  onClose,
  selectedLocation,
  routeInfo,
  selectedTransports,
}) => {
  if (!selectedLocation || !routeInfo) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="여행 상세 정보">
      <DetailGrid>
        <DetailSection>
          <h3>
            <i className="fas fa-map-marker-alt" />
            여행지 정보
          </h3>
          <DetailInfo>
            <DetailInfoItem>
              <i className="fas fa-map-marker-alt" />
              <span>{selectedLocation.name}</span>
            </DetailInfoItem>
            <DetailInfoItem>
              <i className="fas fa-location-arrow" />
              <span>위도: {selectedLocation.lat.toFixed(6)}</span>
            </DetailInfoItem>
            <DetailInfoItem>
              <i className="fas fa-location-arrow" />
              <span>경도: {selectedLocation.lng.toFixed(6)}</span>
            </DetailInfoItem>
          </DetailInfo>
        </DetailSection>

        <DetailSection>
          <h3>
            <i className="fas fa-route" />
            이동 경로
          </h3>
          <DetailInfo>
            <DetailInfoItem>
              <i className="fas fa-road" />
              <span>총 거리: {routeInfo.distance}km</span>
            </DetailInfoItem>
            <DetailInfoItem>
              <i className="fas fa-clock" />
              <span>예상 소요 시간: {routeInfo.time}분</span>
            </DetailInfoItem>
            {routeInfo.fare > 0 && (
              <DetailInfoItem>
                <i className="fas fa-won-sign" />
                <span>예상 요금: {routeInfo.fare}원</span>
              </DetailInfoItem>
            )}
          </DetailInfo>
        </DetailSection>

        <DetailSection>
          <h3>
            <i className="fas fa-car" />
            이동 수단
          </h3>
          <DetailInfo>
            <DetailInfoItem>
              <i className={selectedTransports.includes('car') ? 'fas fa-car' : 'fas fa-bus'} />
              <span>{selectedTransports.includes('car') ? '자동차' : '대중교통'}</span>
            </DetailInfoItem>
          </DetailInfo>
        </DetailSection>
      </DetailGrid>
    </Modal>
  );
}; 
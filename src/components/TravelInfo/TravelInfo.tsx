import React from 'react';
import styled from 'styled-components';
import { Button } from '../common/Button';
import { RouteInfo } from '../../types';

interface TravelInfoProps {
  routeInfo: RouteInfo | null;
  onDetailClick: () => void;
}

const Container = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  color: #333;
`;

const InfoGrid = styled.div`
  display: grid;
  gap: 12px;
`;

const InfoItem = styled.div`
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

const NoRouteMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #666;
  text-align: center;
  padding: 20px;

  i {
    font-size: 24px;
    color: #3399ff;
  }
`;

export const TravelInfo: React.FC<TravelInfoProps> = ({
  routeInfo,
  onDetailClick,
}) => {
  if (!routeInfo) {
    return (
      <Container>
        <NoRouteMessage>
          <i className="fas fa-map-marked-alt" />
          <p>랜덤 여행을 시작하면 여행 정보가 표시됩니다.</p>
        </NoRouteMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>여행 정보</Title>
        <Button
          icon="info-circle"
          onClick={onDetailClick}
          title="상세 정보 보기"
        />
      </Header>
      <InfoGrid>
        <InfoItem>
          <i className="fas fa-road" />
          <span>총 거리: {routeInfo.distance}km</span>
        </InfoItem>
        <InfoItem>
          <i className="fas fa-clock" />
          <span>예상 소요 시간: {routeInfo.time}분</span>
        </InfoItem>
        {routeInfo.fare > 0 && (
          <InfoItem>
            <i className="fas fa-won-sign" />
            <span>예상 요금: {routeInfo.fare}원</span>
          </InfoItem>
        )}
      </InfoGrid>
    </Container>
  );
}; 
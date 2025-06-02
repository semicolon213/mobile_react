import React from 'react';
import styled from 'styled-components';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { TransportType } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTransports: string[];
  onTransportChange: (type: TransportType) => void;
  time: number;
  onTimeChange: (time: number) => void;
  address: string;
  onAddressChange: (address: string) => void;
  onGetCurrentLocation: () => void;
  onSave: () => void;
}

const SettingsGrid = styled.div`
  display: grid;
  gap: 20px;
`;

const Section = styled.section`
  h3 {
    margin: 0 0 10px 0;
    font-size: 1.1rem;
    color: #333;
  }
`;

const LocationInputWrapper = styled.div`
  display: flex;
  gap: 8px;
`;

const LocationInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #3399ff;
  }
`;

const TransportGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
`;

const TransportButton = styled(Button)<{ isSelected: boolean }>`
  background-color: ${props => props.isSelected ? '#3399ff' : '#ffffff'};
  color: ${props => props.isSelected ? '#ffffff' : '#333333'};
`;

const TimeRangeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TimeRangeSlider = styled.input`
  width: 100%;
`;

const TimeRangeLabels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
`;

const CurrentTime = styled.span`
  color: #3399ff;
  font-weight: bold;
`;

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  selectedTransports,
  onTransportChange,
  time,
  onTimeChange,
  address,
  onAddressChange,
  onGetCurrentLocation,
  onSave,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="설정">
      <SettingsGrid>
        <Section>
          <h3>현재 위치</h3>
          <LocationInputWrapper>
            <LocationInput
              type="text"
              placeholder="위치를 입력하세요"
              value={address}
              onChange={(e) => onAddressChange(e.target.value)}
            />
            <Button
              icon="location-crosshairs"
              onClick={onGetCurrentLocation}
              title="현재 위치 가져오기"
            />
          </LocationInputWrapper>
        </Section>

        <Section>
          <h3>이동 수단</h3>
          <TransportGrid>
            <TransportButton
              isSelected={selectedTransports.includes('car')}
              onClick={() => onTransportChange('car')}
              icon="car"
            >
              자동차
            </TransportButton>
            <TransportButton
              isSelected={selectedTransports.includes('public')}
              onClick={() => onTransportChange('public')}
              icon="bus"
            >
              대중교통
            </TransportButton>
          </TransportGrid>
        </Section>

        <Section>
          <h3>여행 시간</h3>
          <TimeRangeContainer>
            <TimeRangeSlider
              type="range"
              min="20"
              max="720"
              value={time}
              onChange={(e) => onTimeChange(parseInt(e.target.value))}
              step="10"
            />
            <TimeRangeLabels>
              <span>20분</span>
              <CurrentTime>
                {Math.floor(time / 60)}시간 {time % 60}분
              </CurrentTime>
              <span>12시간</span>
            </TimeRangeLabels>
          </TimeRangeContainer>
        </Section>

        <Button primary onClick={onSave}>
          설정 저장
        </Button>
      </SettingsGrid>
    </Modal>
  );
}; 
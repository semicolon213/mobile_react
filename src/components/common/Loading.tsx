import React from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../../styles/theme';

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.xl};
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid ${theme.colors.gray[200]};
  border-top: 4px solid ${theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  color: ${theme.colors.gray[600]};
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.medium};
`;

interface LoadingProps {
  text?: string;
}

export const Loading: React.FC<LoadingProps> = ({ text = '로딩 중...' }) => {
  return (
    <LoadingWrapper>
      <Spinner />
      <LoadingText>{text}</LoadingText>
    </LoadingWrapper>
  );
}; 
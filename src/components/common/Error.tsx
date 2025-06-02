import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Button } from './Button';

const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.xl};
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  color: ${theme.colors.danger};
`;

const ErrorTitle = styled.h3`
  font-size: ${theme.typography.fontSize.xl};
  color: ${theme.colors.danger};
  font-weight: ${theme.typography.fontWeight.bold};
  margin: 0;
`;

const ErrorMessage = styled.p`
  font-size: ${theme.typography.fontSize.md};
  color: ${theme.colors.gray[600]};
  margin: 0;
`;

interface ErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const Error: React.FC<ErrorProps> = ({
  title = '오류가 발생했습니다',
  message = '잠시 후 다시 시도해주세요',
  onRetry,
}) => {
  return (
    <ErrorWrapper>
      <ErrorIcon>
        <i className="fas fa-exclamation-circle" />
      </ErrorIcon>
      <ErrorTitle>{title}</ErrorTitle>
      <ErrorMessage>{message}</ErrorMessage>
      {onRetry && (
        <Button primary onClick={onRetry}>
          다시 시도
        </Button>
      )}
    </ErrorWrapper>
  );
}; 
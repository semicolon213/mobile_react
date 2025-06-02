import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const Label = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[700]};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const StyledInput = styled.input<{ hasError?: boolean }>`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${props => props.hasError ? theme.colors.danger : theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.md};
  color: ${theme.colors.black};
  background-color: ${theme.colors.white};
  transition: border-color ${theme.transitions.default};

  &:focus {
    border-color: ${props => props.hasError ? theme.colors.danger : theme.colors.primary};
  }

  &::placeholder {
    color: ${theme.colors.gray[400]};
  }

  &:disabled {
    background-color: ${theme.colors.gray[100]};
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.span`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.danger};
`;

export const Input: React.FC<InputProps> = ({
  label,
  error,
  ...props
}) => {
  return (
    <InputWrapper>
      {label && <Label>{label}</Label>}
      <StyledInput hasError={!!error} {...props} />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputWrapper>
  );
}; 
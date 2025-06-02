import React from 'react';
import styled from 'styled-components';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  primary?: boolean;
  icon?: string;
  ariaLabel?: string;
}

const StyledButton = styled.button<{ primary?: boolean }>`
  background-color: ${props => props.primary ? '#3399ff' : '#ffffff'};
  color: ${props => props.primary ? '#ffffff' : '#333333'};
  padding: 10px 20px;
  border-radius: 4px;
  border: 1px solid #3399ff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  i {
    font-size: 16px;
  }

  @media (max-width: 576px) {
    font-size: 12px;
    padding: 8px 12px;
  }
`;

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  primary, 
  icon, 
  ariaLabel,
  ...props 
}) => {
  return (
    <StyledButton primary={primary} aria-label={ariaLabel} {...props}>
      {icon && <i className={`fas fa-${icon}`} aria-hidden="true" />}
      {children}
    </StyledButton>
  );
}; 
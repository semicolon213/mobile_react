import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

export const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    
    @media screen and (max-width: ${theme.breakpoints.md}) {
      font-size: 14px;
    }
    
    @media screen and (max-width: ${theme.breakpoints.sm}) {
      font-size: 12px;
    }
  }

  body {
    font-family: ${theme.typography.fontFamily};
    font-size: ${theme.typography.fontSize.md};
    color: ${theme.colors.black};
    background-color: ${theme.colors.background};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    line-height: 1.5;
    -webkit-text-size-adjust: 100%;
  }

  button {
    font-family: inherit;
    border: none;
    background: none;
    cursor: pointer;
    font-size: inherit;
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    
    @media screen and (max-width: ${theme.breakpoints.sm}) {
      padding: ${theme.spacing.xs} ${theme.spacing.sm};
    }
    
    &:focus {
      outline: none;
    }
  }

  input {
    font-family: inherit;
    font-size: inherit;
    padding: ${theme.spacing.sm};
    
    @media screen and (max-width: ${theme.breakpoints.sm}) {
      padding: ${theme.spacing.xs};
    }
    
    &:focus {
      outline: none;
    }
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  ul, ol {
    list-style: none;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  #root {
    width: 100%;
    height: 100vh;
  }

  /* 모바일 환경에서의 터치 영역 최적화 */
  @media screen and (max-width: ${theme.breakpoints.sm}) {
    button, 
    a, 
    input[type="button"], 
    input[type="submit"] {
      min-height: 44px;
      min-width: 44px;
    }
  }
`; 
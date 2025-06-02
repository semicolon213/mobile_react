import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

export const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    font-family: ${theme.typography.fontFamily};
    font-size: ${theme.typography.fontSize.md};
    color: ${theme.colors.black};
    background-color: ${theme.colors.background};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  button {
    font-family: inherit;
    border: none;
    background: none;
    cursor: pointer;
    &:focus {
      outline: none;
    }
  }

  input {
    font-family: inherit;
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
`; 
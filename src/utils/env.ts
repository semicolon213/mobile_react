export function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`환경 변수 ${key}가 설정되어 있지 않습니다.`);
  }
  return value;
}

export const TMAP_API_KEY = getEnv('REACT_APP_TMAP_API_KEY'); 
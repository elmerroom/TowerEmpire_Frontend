// src/entities/user/lib/session.ts

export const clearSession = () => {
  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('accessToken');
};

export const getSessionToken = () => {
  return (
    sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken')
  );
};

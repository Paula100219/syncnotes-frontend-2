import { useState, useEffect } from 'react';
import { getMe } from '../services/Api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      getMe().then(setUser).catch(() => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      });
    }
  }, [token]);

  return { token, user };
}
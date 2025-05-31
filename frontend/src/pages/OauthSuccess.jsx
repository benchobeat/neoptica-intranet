import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OauthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      navigate('/dashboard'); // Cambia a la ruta principal de tu app si es diferente
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return <div>Autenticando...</div>;
}

import React from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function SocialLoginButtons() {
  return (
    <div>
      <button
        onClick={() => window.location.href = `${API_URL}/google`}
        style={{ margin: 8 }}
      >
        Iniciar sesión con Google
      </button>
      <button
        onClick={() => window.location.href = `${API_URL}/facebook`}
        style={{ margin: 8 }}
      >
        Iniciar sesión con Facebook
      </button>
      <button
        onClick={() => window.location.href = `${API_URL}/instagram`}
        style={{ margin: 8 }}
      >
        Iniciar sesión con Instagram
      </button>
    </div>
  );
}

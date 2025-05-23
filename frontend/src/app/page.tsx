'use client';
// Esto le indica a Next.js que este componente usa lógica de cliente (hooks, handlers, etc).

import { Button, Alert } from 'antd'; // Importamos Button y Alert de Ant Design

export default function Home() {
  return (
    <main style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Bienvenido a Neóptica Intranet</h1>
      {/* Botón primario de Ant Design */}
      <Button
        type="primary"
        onClick={() => alert('¡Bienvenido a la intranet de Neóptica!')}
        style={{ margin: '16px' }}
      >
        Presiona aquí
      </Button>
      {/* Alerta informativa de Ant Design */}
      <Alert
        message="Esta es una alerta de información."
        description="Ant Design está correctamente integrado en tu proyecto."
        type="info"
        showIcon
        style={{ maxWidth: 400, margin: 'auto', marginTop: 32 }}
      />
    </main>
  );
}

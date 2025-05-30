import React from "react";

export default function Terminos() {
  return (
    <main style={{ maxWidth: 600, margin: "40px auto", padding: "24px", background: "#fff", borderRadius: "12px", boxShadow: "0 2px 16px #eee" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: 12 }}>Términos y Condiciones de Uso</h1>
      <ol>
        <li>
          <strong>Uso de la plataforma:</strong> La aplicación está diseñada para autenticación de usuarios, reserva de servicios y gestión de información clínica y comercial relacionada con el sector óptico.
        </li>
        <li>
          <strong>Responsabilidad del usuario:</strong> Debes proporcionar información verídica y mantener la confidencialidad de tus credenciales de acceso.
        </li>
        <li>
          <strong>Protección de datos:</strong> Nos comprometemos a proteger tus datos conforme a nuestra Política de Privacidad.
        </li>
        <li>
          <strong>Modificaciones:</strong> Neóptica se reserva el derecho de actualizar estos términos en cualquier momento. Se notificará a los usuarios de cualquier cambio importante.
        </li>
        <li>
          <strong>Contacto:</strong> Para consultas o soporte, escríbenos a <a href="mailto:ruben_mosquerav@hotmail.com">ruben_mosquerav@hotmail.com</a>.
        </li>
      </ol>
      <p>
        El uso de la aplicación implica la aceptación de estos términos.
      </p>
    </main>
  );
}

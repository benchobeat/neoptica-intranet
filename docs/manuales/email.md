# GESTIÓN DE CORREO ELECTRÓNICO TRANSACCIONAL Y AUDITORÍA DE ENVÍOS

## **A. Administración de Correo para Notificaciones y Facturación**

- El sistema debe permitir la configuración y administración segura del correo emisor utilizado para:
    - Envío de facturas electrónicas y comprobantes al cliente.
    - Notificaciones automáticas (stock bajo, pedidos, alertas, avisos administrativos, etc.).
- Panel exclusivo para administración/soporte donde se pueda:
    - Ver y editar las credenciales del correo emisor (usuario, servidor SMTP/Sendgrid/API, configuración de seguridad y pruebas).
    - Probar el envío de un correo de test para validar la conexión.
    - Consultar logs de actividad (envíos exitosos, fallos, rebotes, etc.).

## **B. Registro y Auditoría de Envíos de Correo**

- Cada intento de envío (factura, alerta, notificación) debe registrarse en una tabla `log_envio_correo` con los siguientes datos mínimos:
    - Fecha/hora del intento.
    - Tipo de correo (factura, alerta, notificación, recuperación de contraseña, etc.).
    - Usuario destinatario (cliente, empleado) y correo destino.
    - Entidad asociada (pedido, factura, alerta, id polimórfico si aplica).
    - Estado del envío (enviado, fallido, en cola, reintento, entregado, abierto, rebotado, etc.).
    - Mensaje de error detallado si aplica.
    - Usuario o proceso que originó el envío (manual, automático, por API).

- Estos registros serán consultables por el panel de administración y exportables para auditoría o reclamos.

## **C. Flujos de usuario y funcionalidades afectadas**

- **Vendedor**: Al finalizar una venta, puede optar por enviar la factura/comprobante por correo al cliente. El estado del envío queda registrado y visible.
- **Admin/Gerente**: Acceso a panel de configuración de correo y logs. Puede ver estadísticas de envíos, fallos, reintentos y detalles de cualquier correo enviado desde el sistema.
- **Optometrista**: Puede generar y enviar notificaciones clínicas/documentos adjuntos a clientes, según permisos, quedando todo registrado.
- **Cliente**: Recibe notificaciones y comprobantes en su correo registrado. En el historial de su perfil, puede ver los correos enviados y su estado.
- **Alertas y reintentos**: Si un correo falla (SMTP caído, correo inválido, bloqueo, etc.), el sistema debe mostrar advertencia al usuario interno y permitir reintento manual o automático.

## **D. Seguridad y cumplimiento**

- Los datos de configuración del correo deben guardarse de forma segura y encriptada.
- Todas las acciones de edición y prueba de configuración deben quedar logueadas para auditoría.
- Los envíos de facturas electrónicas deben cumplir requisitos legales y fiscales del país (SRI Ecuador u otro), incluyendo campos obligatorios y formatos de correo.

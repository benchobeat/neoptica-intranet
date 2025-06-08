# Auditoría - [NOMBRE_DEL_MODELO]

## Eventos Auditados

### Creación
- **Campos registrados**: Todos los campos
- **Nivel de detalle**: Alto
- **Ubicación de logs**: `/var/log/app/creacion_[nombre_modelo].log`

### Actualización
- **Campos registrados**: Solo campos modificados (antes/después)
- **Nivel de detalle**: Medio
- **Ubicación de logs**: `/var/log/app/actualizacion_[nombre_modelo].log`

### Eliminación
- **Campos registrados**: Estado anterior
- **Nivel de detalle**: Alto
- **Ubicación de logs**: `/var/log/app/eliminacion_[nombre_modelo].log`

## Estructura del Log

```json
{
  "evento": "tipo_evento",
  "fecha_hora": "YYYY-MM-DDTHH:mm:ss.SSSZ",
  "usuario_id": "uuid_del_usuario",
  "ip_origen": "192.168.1.1",
  "recurso_afectado": "nombre_modelo",
  "recurso_id": "id_recurso",
  "cambios": {
    "campo": {
      "antes": "valor_anterior",
      "despues": "nuevo_valor"
    }
  },
  "metadatos": {
    "user_agent": "Mozilla/5.0...",
    "endpoint": "/api/ruta"
  }
}
```

## Retención de Logs

| Tipo de Dato | Período de Retención | Ubicación |
|--------------|----------------------|-----------|
| Logs de auditoría | 1 año | Almacenamiento en frío |
| Backups | 30 días | Disco local |
| Reportes | 5 años | Almacenamiento en la nube |

## Consultas de Auditoría

### Ejemplo de consulta de cambios recientes

```sql
SELECT * 
FROM log_auditoria 
WHERE recurso_afectado = 'nombre_modelo'
  AND fecha_hora >= NOW() - INTERVAL '7 days'
ORDER BY fecha_hora DESC;
```

### Ejemplo de consulta de acciones por usuario

```sql
SELECT usuario_id, COUNT(*) as total_acciones
FROM log_auditoria
WHERE recurso_afectado = 'nombre_modelo'
  AND fecha_hora >= NOW() - INTERVAL '30 days'
GROUP BY usuario_id
ORDER BY total_acciones DESC;
```

## Alertas de Seguridad

### Configuración de Alertas

| Tipo de Alerta | Condición | Acción |
|----------------|-----------|--------|
| Múltiples intentos fallidos | >5 intentos en 5 minutos | Bloquear IP temporalmente |
| Acceso fuera de horario | Entre 10 PM y 6 AM | Notificar al administrador |
| Cambios masivos | >100 registros en 1 minuto | Revisión manual |

### Integración con SIEM

- Formato: CEF (Common Event Format)
- Frecuencia: En tiempo real
- Campos requeridos:
  - timestamp
  - sourceAddress
  - destinationAddress
  - eventName
  - outcome

## Cumplimiento Normativo

### Estándares Aplicables
- RGPD: Artículos 5, 32, 33
- ISO 27001: A.12.4, A.16.1
- PCI DSS: Req. 10

### Documentación Requerida
- Política de Retención de Logs
- Procedimiento de Respuesta a Incidentes
- Acuerdos de Nivel de Servicio (SLA) para recuperación

## Herramientas Recomendadas

1. **Análisis de Logs**
   - ELK Stack (Elasticsearch, Logstash, Kibana)
   - Splunk
   - Graylog

2. **Monitoreo en Tiempo Real**
   - Prometheus
   - Grafana
   - Datadog

3. **Gestión de Incidentes**
   - PagerDuty
   - Opsgenie
   - ServiceNow

## Procedimientos de Respuesta

### Para Accesos No Autorizados
1. Registrar el evento
2. Notificar al equipo de seguridad
3. Bloquear el acceso si es necesario
4. Investigar el origen
5. Implementar medidas correctivas

### Para Pérdida de Datos
1. Aislar los sistemas afectados
2. Evaluar el alcance
3. Restaurar desde backup
4. Investigar la causa raíz
5. Implementar medidas preventivas

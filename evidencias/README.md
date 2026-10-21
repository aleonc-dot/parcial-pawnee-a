# Evidencias

## Verificación de resoluciones
Fecha: 2026-10-21. Las primeras pruebas de interfaz usaron respuestas HTTP interceptadas y no representaron persistencia en MongoDB. Luego se reinició el backend obsoleto que atendía el puerto 3000; se usó la instancia local conectada a `parcial_e1530`, sin cambiar código ni configuración.

### A-01
El formulario creó un avistamiento; su detalle mostró la criatura asociada y siguió disponible tras recargar. Una referencia inexistente respondió 404 y no creó otro registro.

### A-02 
La API devolvió las criaturas relacionadas como objetos y el listado mostró sus nombres. La consulta de una criatura sin avistamientos respondió 200 con cero resultados.

### A-03
En una criatura temporal, el nivel 7 respondió 200; 999, 400. Un GET confirmó que se conservó 7. Eliminé los registros temporales.

### A-04
El filtro actualizó la lista al seleccionar mitica y mecanica, mostró carga y regresó a Todos. También probé el estado de error con una falla de red simulada y confirmé que la vista se recuperó al reintentar.

### Validación
`npm run check` terminó correctamente para backend y frontend. La API respondió **200** en `/api/salud`. La página `/` mostró las tres criaturas semilla. No se incluyeron capturas ni credenciales; los resultados observados quedan descritos arriba.

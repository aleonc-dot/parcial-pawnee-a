# Evidencias

## Verificación de resoluciones
Fecha: 2026-10-21. Las primeras pruebas de interfaz usaron respuestas HTTP interceptadas y no representaron persistencia en MongoDB. Luego se reinició el backend obsoleto que atendía el puerto 3000; se usó la instancia local conectada a `parcial_e1530`, sin cambiar código ni configuración.

### A-01 · Registrar avistamiento
- En el formulario real (`/avistamientos/nuevo`) se ingresó testigo `Verificación real A01`, ubicación `Prueba local descartable`, fecha `2026-10-21` y descripción temporal. El POST real respondió **201** y el cuerpo incluyó `criatura: "65a000000000000000000103"` (no `criaturaId`).
- La interfaz navegó al detalle del avistamiento. El GET del detalle respondió **200** y mostró la criatura relacionada `El Brillo del Río Wamapo`.
- Se eliminó el registro temporal mediante DELETE, que respondió **204**. El listado quedó con los cuatro avistamientos semilla.

### A-02 · Mostrar la criatura relacionada
- `GET http://127.0.0.1:3000/api/avistamientos` respondió **200**, con `total: 4` y la referencia `criatura` poblada como objeto en cada resultado.
- `GET /api/avistamientos?criaturaId=65a000000000000000000101` respondió **200** con `total: 2`.
- La lista real del frontend (`/avistamientos`) mostró los cuatro registros con nombres relacionados: `April Ludgate · El Brillo del Río Wamapo · Ribera`, `Tom Haverford · El Dragón del Estacionamiento · Estacionamiento`, `Ron Swandson · La Ardilla del Martes · Parque Ramsett` y `Leslie Yepp · La Ardilla del Martes · Parque Ramsett`.
- La rama de estado vacío también se comprobó previamente con una respuesta vacía simulada; esa prueba no consulta MongoDB.

### Validación
`npm run check` terminó correctamente para backend y frontend. La API respondió **200** en `/api/salud`. La página `/` mostró las tres criaturas semilla. No se incluyeron capturas ni credenciales; los resultados observados quedan descritos arriba.

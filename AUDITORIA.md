# Auditoría · Versión A
Código: A
Repositorio: https://github.com/aleonon/parcial-pawnee-a (visibilidad no comprobada)
Rama: examen/e017

## Alcance y entorno de pruebas
Se revisó `REPORTES.md` y se ejecutaron pruebas contra la API y la interfaz locales.

Al inicio, `/api/salud` respondía 200, pero la instancia del backend que atendía el puerto 3000 devolvía 500 en consultas de datos. Se comprobó que MongoDB y los servicios funcionaban mediante consultas directas y una instancia nueva del backend en el puerto 3001. Se reinició el backend en el puerto 3000, que usa el proxy de Vite; después del reinicio, las consultas respondieron 200 y la interfaz mostró las criaturas y avistamientos semilla. La causa operacional comprobada fue la instancia anterior del backend; no se cambió código para resolver ese 500.

`npm run check` terminó correctamente para backend y frontend.

## A-01 · No se registra el avistamiento
### Síntoma
Se completa el formulario con una criatura existente, testigo, ubicación, fecha y descripción, pero no se guarda el avistamiento. En la prueba HTTP se reprodujo el cuerpo que envía el formulario nuevo, con `criaturaId=65a000000000000000000101`. El resultado esperado era 201 y persistencia; se observó 400, `Campos no permitidos en el cuerpo`, sin crear un registro. No hubo una medición anterior independiente a esta auditoría.

### Causa
En `frontend/src/paginas/FormularioAvistamiento.tsx`, el formulario usa el campo `criaturaId` al crear. El servicio de `backend/src/services/avistamientos.service.ts` solo permite `criatura` en su lista blanca y exige ese campo. La petición del formulario se rechaza antes de crear el documento, por lo que nunca navega al detalle.

### Cambio
Se corrigió únicamente `frontend/src/paginas/FormularioAvistamiento.tsx`: tanto al crear como al editar, el formulario ahora envía el campo `criatura` que acepta el contrato de la API y exige el servicio. Antes, al crear enviaba `criaturaId`, campo que la lista blanca del backend rechazaba. No se modificaron otros archivos de código ni se creó un commit.

### Prueba
La prueba anterior con `criaturaId` devolvió 400 `Campos no permitidos en el cuerpo`. Después de corregir el formulario y reiniciar el backend, se envió el formulario real desde `/avistamientos/nuevo`: el POST respondió 201, el cuerpo incluyó `criatura` y el navegador abrió el detalle del registro; GET respondió 200 y mostró el nombre de la criatura. Se eliminó el registro temporal con DELETE 204 y se confirmó que quedaron los cuatro registros semilla. `npm run check` pasó para backend y frontend. Pasos y resultados en `evidencias/README.md`.

### Estado
Resuelto. El formulario envía el campo esperado y la prueba real confirmó creación, lectura del detalle con asociación a la criatura y limpieza del registro temporal.

## A-02 · La lista no identifica a la criatura
### Síntoma
Según el reporte, el listado de avistamientos no muestra el nombre de la criatura relacionada. El resultado esperado era mostrar el nombre en cada registro. Antes de la corrección, `GET /api/avistamientos` y `GET /api/avistamientos?criaturaId=65a000000000000000000101` respondieron 500, así que no se pudo observar los cuatro registros semilla en pantalla.

### Causa
`backend/src/services/avistamientos.service.ts` implementaba `listar` con `.lean()` y sin `populate('criatura')`, así que entregaba la referencia como id. La interfaz muestra el nombre cuando recibe el objeto `Criatura`, pero solo puede mostrar `ID: <id>` cuando recibe la referencia como cadena. El servicio `obtener` ya poblaba esa relación, por lo que las formas de lectura no eran coherentes.

### Cambio
Se añadió `.populate('criatura')` a la consulta de listado, conservando el filtro, el orden y `.lean()`. La respuesta ahora entrega la criatura relacionada como objeto, forma que ya admite `frontend/src/tipos.ts` y que `nombreCriatura` usa para mostrar el nombre en `frontend/src/paginas/ListaAvistamientos.tsx`. Se modificó solo el servicio necesario para esta corrección; no se hizo commit.

### Prueba
Tras reiniciar el backend, `GET /api/avistamientos` respondió 200 con total 4 y objetos `criatura` poblados; el filtro `?criaturaId=65a000000000000000000101` respondió 200 con total 2. En el navegador, `/avistamientos` mostró los cuatro testigos y los nombres relacionados (`El Brillo del Río Wamapo`, `El Dragón del Estacionamiento`, `La Ardilla del Martes`). También se verificó el estado vacío con una respuesta simulada. Pasos y resultados en `evidencias/README.md`.

### Estado
Resuelto. La API devuelve la relación poblada y el listado del frontend presenta el nombre de cada criatura usando los datos semilla reales.

## A-03 · Se acepta un peligro inválido
### Síntoma
Según el reporte, una actualización HTTP con `nivelPeligro: 999` se acepta, pese al rango esperado 1–10. Antes de reiniciar el backend se probó `PUT /api/criaturas/65a000000000000000000101` con `{"nivelPeligro":999}`; el resultado fue 500. Esa respuesta de la instancia anterior no determina el comportamiento actual de esta validación. Tampoco se probó el guardado válido de 7 ni se leyó el valor posterior en esta actualización.

### Causa
El esquema de `backend/src/modelos/Criatura.model.ts` declara `min: 1` y `max: 10`, pero `backend/src/services/criaturas.service.ts` hace `findByIdAndUpdate` sin `runValidators: true`. La validación del cuerpo solo comprueba que `nivelPeligro` sea un número finito; no verifica el rango. Así, la ruta de actualización no ejecuta las restricciones de rango del esquema.

### Cambio
Se añadió `runValidators: true` a las opciones de `Criatura.findByIdAndUpdate` en `backend/src/services/criaturas.service.ts`. Así Mongoose aplica las reglas `min: 1` y `max: 10` del esquema también durante las actualizaciones. Cambio puntual; no se hizo commit.

### Prueba
Con la criatura semilla `65a000000000000000000101`, `PUT {"nivelPeligro":7}` respondió 200 y GET confirmó el valor 7. Después, `PUT {"nivelPeligro":999}` respondió 400 con mensaje de máximo permitido 10; GET confirmó que el valor siguió en 7. Finalmente se restauró el valor original 2 con PUT 200. `npm run check` pasó para backend y frontend.

### Estado
Resuelto. El nivel válido se guarda, el valor fuera del rango se rechaza con 400 y el rechazo conserva el último valor válido.

## A-04 · El filtro no actualiza la pantalla
### Síntoma
Según el reporte, al cambiar de Todos a `mitica` y luego a `mecanica`, selección y resultados no corresponden hasta pulsar Actualizar lista. El resultado esperado era consultar automáticamente cada selección, distinguir carga/error/vacío y restaurar Todos. En el navegador, el selector cambió, pero la pantalla permaneció en error de carga de criaturas.

### Causa
En `frontend/src/paginas/ListaCriaturas.tsx`, el efecto que llama a `listarCriaturas(tipo)` depende de `[recarga]`, pero no de `tipo`. Cambiar el selector actualiza el estado `tipo` sin volver a ejecutar la consulta. El control manual sí incrementa `recarga`. `EstadoCarga` contempla estados loading, error y empty; no corrige la dependencia ausente. La semilla no contiene criaturas `mecanica`.

### Cambio
No se modificó el código ni se hizo commit de corrección, por instrucción. La causa queda identificada, pero el problema no está corregido.

### Prueba
En el navegador local se seleccionó `mitica` y después `mecanica`; el contador de solicitudes a la API durante ambos cambios fue 0 y el mensaje de error existente no cambió. Esto confirma que cambiar el selector no dispara consultas. Al mismo tiempo, la API responde 500 al cargar criaturas, por lo que no se pudieron validar resultados reales, el vacío de `mecanica` ni la restauración con datos. Evidencia: interacción de navegador en `/`; no se guardó captura ni archivo adicional.

### Estado
No resuelto. El efecto no vuelve a consultar al cambiar `tipo`; las verificaciones de resultados y estados con la semilla quedaron bloqueadas por el 500 de la API.

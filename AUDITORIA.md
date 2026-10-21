# Auditoría · Versión A
Código: A
Repositorio: https://github.com/aleonon/parcial-pawnee-a (visibilidad no comprobada)
Rama: examen/e017

## Alcance y entorno de pruebas
Se revisó `REPORTES.md` y se ejecutaron pruebas contra la API y la interfaz locales. No se corrigió código: solo se completa esta auditoría, por lo que no hay commit de corrección. El commit inspeccionado es `fa2973d`.

La API respondió 200 en `/api/salud` y el diagnóstico reportó conexión a MongoDB y 3 criaturas/4 avistamientos semilla. Sin embargo, las consultas y escrituras que requieren documentos respondieron 500 (`Error interno del servidor`). El POST temporal de criatura también respondió 500; no devolvió id ni creó registros. El diagnóstico posterior confirmó que las cantidades siguieron en 3/4. Este fallo común bloqueó las verificaciones que necesitaban leer o modificar datos. No se pudo determinar su causa en esta auditoría.

`npm run check` terminó correctamente para backend y frontend. No se creó un archivo aparte en `evidencias/`; los pasos y resultados quedan registrados aquí.

## A-01 · No se registra el avistamiento
### Síntoma
Según el reporte, se completa el formulario con una criatura existente, testigo, ubicación, fecha y descripción, pero no se guarda el avistamiento. En la prueba HTTP se reprodujo el cuerpo que envía el formulario nuevo, con `criaturaId=65a000000000000000000101`. El resultado esperado era 201 y persistencia; se observó 400, `Campos no permitidos en el cuerpo`, sin crear un registro. No hubo una medición anterior independiente a esta auditoría.

### Causa
En `frontend/src/paginas/FormularioAvistamiento.tsx`, el formulario usa el campo `criaturaId` al crear. El servicio de `backend/src/services/avistamientos.service.ts` solo permite `criatura` en su lista blanca y exige ese campo. La petición del formulario se rechaza antes de crear el documento, por lo que nunca navega al detalle.

### Cambio
No se modificó el código ni se hizo commit de corrección, por instrucción. La causa queda identificada, pero el problema no está corregido.

### Prueba
Se envió por `POST /api/avistamientos` el cuerpo `{"criaturaId":"65a000000000000000000101","testigo":"Auditoria temporal","ubicacion":"Prueba local","fecha":"2026-10-21"}`; resultado observado: 400 `Campos no permitidos en el cuerpo`, en vez de 201. Luego se probó una referencia inexistente usando el campo aceptado `criatura`; resultado observado: 500, no el 404 esperado, debido al fallo común de acceso a documentos descrito arriba. No fue posible verificar GET, persistencia, recarga ni asociación. Evidencia: resultados HTTP de esta auditoría; no hay archivo adicional.

### Estado
No resuelto. El desajuste entre `criaturaId` y `criatura` impide el alta desde el formulario. La prueba de referencia inexistente también quedó bloqueada por el 500 de la API.

## A-02 · La lista no identifica a la criatura
### Síntoma
Según el reporte, el listado de avistamientos no muestra el nombre de la criatura relacionada. El resultado esperado era mostrar el nombre en cada registro. En la prueba actual, `GET /api/avistamientos` y `GET /api/avistamientos?criaturaId=65a000000000000000000101` respondieron 500, así que no se pudo cargar el listado ni observar los cuatro registros semilla en pantalla.

### Causa
`backend/src/services/avistamientos.service.ts` implementa `listar` con `.lean()` y no hace `populate('criatura')`; entrega la referencia como id. En cambio, `frontend/src/paginas/ListaAvistamientos.tsx` llama a `nombreCriatura`, y `frontend/src/tipos.ts` convierte una referencia de texto en `ID: <id>`, no en el nombre. El servicio `obtener` sí popula la referencia, de modo que las formas de lectura no son coherentes.

### Cambio
No se modificó el código ni se hizo commit de corrección, por instrucción. La causa queda identificada, pero el problema no está corregido.

### Prueba
Se consultaron los dos GET indicados, con resultado observado 500 en ambos en vez de una respuesta 200 con los datos relacionados. Por el mismo error no se pudo probar la presentación de nombres ni una respuesta vacía real. El componente `EstadoCarga` sí contiene una rama de estado vacío, pero eso no sustituye la prueba de integración. Evidencia: resultados HTTP y revisión de las formas de lectura/renderizado en los archivos indicados; no hay archivo adicional.

### Estado
No resuelto. La lista no popula la referencia y la interfaz solo puede mostrar su id cuando recibe una cadena. La verificación visual con datos reales quedó bloqueada por el 500.

## A-03 · Se acepta un peligro inválido
### Síntoma
Según el reporte, una actualización HTTP con `nivelPeligro: 999` se acepta, pese al rango esperado 1–10. Se probó `PUT /api/criaturas/65a000000000000000000101` con `{"nivelPeligro":999}`; el resultado observado fue 500, no el 400 esperado. Tampoco se pudo probar el guardado válido de 7 ni leer el valor posterior, por el fallo común de acceso a documentos.

### Causa
El esquema de `backend/src/modelos/Criatura.model.ts` declara `min: 1` y `max: 10`, pero `backend/src/services/criaturas.service.ts` hace `findByIdAndUpdate` sin `runValidators: true`. La validación del cuerpo solo comprueba que `nivelPeligro` sea un número finito; no verifica el rango. Así, la ruta de actualización no ejecuta las restricciones de rango del esquema.

### Cambio
No se modificó el código ni se hizo commit de corrección, por instrucción. La causa queda identificada; el rechazo de 999 y la preservación del valor válido no quedaron validados en ejecución.

### Prueba
`PUT` con nivel 999 respondió 500. Como comprobación adicional no destructiva, se intentó crear una criatura temporal para probar después el valor 7 y retirar el registro; el `POST /api/criaturas` respondió 500 y no devolvió id, por lo que no se hicieron cambios en la base. El diagnóstico antes y después informó 3 criaturas y 4 avistamientos. Evidencia: respuestas HTTP y salida de `npm run diagnostico --prefix backend`; no hay archivo adicional.

### Estado
No resuelto. La falta de validadores en la actualización es visible en el código, pero la API indisponible para operaciones con documentos impidió confirmar el resultado funcional y el valor persistido.

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

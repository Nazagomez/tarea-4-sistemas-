# Tarea 4 — Bookstore con RabbitMQ

Las operaciones de libros, autores y editoriales no escriben la base de datos de inmediato. Cada alta, cambio o baja publica un JSON en la cola `bookstore`. Una función de tareas lee esa cola e invoca la función batch que sí modifica PostgreSQL.

## 1. CloudAMQP

1. Cree una cuenta en [CloudAMQP](https://www.cloudamqp.com/) y una instancia del plan gratuito Little Lemur.
2. Copie el AMQP URL.
3. En RabbitMQ Manager, cree una cola durable llamada `bookstore`.
4. Envíe un cambio desde el frontend y confirme en la pestaña Queues que el mensaje llegó.

Los mensajes de libros tienen la forma del tutorial: `{"method":"UPDATE","id":1,"body":{...}}`. Los de autores y editoriales agregan `"resource":"author"` o `"resource":"publisher"` para que cada función de tareas procese solo los suyos y devuelva el resto a la misma cola.

## 2. Base de datos

Cree una base PostgreSQL (Neon sirve) y ejecute `schema.sql` en el editor SQL. Copie la cadena de conexión a `DATABASE_URL`.

## 3. Variables

En Netlify, solo para este backend:

- `CLOUDAMQP_URL`: el AMQP URL de CloudAMQP
- `DATABASE_URL`: la conexión PostgreSQL
- `FUNCTIONS_BASE_URL`: `https://SU-SITIO.netlify.app/.netlify/functions/`

## 4. Publicar

El backend se publica en Netlify desde esta carpeta (`netlify.toml` ya apunta a `netlify/functions` y `public`). El frontend no va en ese sitio.

```bash
cd frontend
npm install
VITE_API_BASE=https://SU-SITIO.netlify.app npm run build
```

Publique el contenido de `frontend/dist` en GitHub Pages, Vercel u otro hosting estático.

## 5. Prueba manual

1. En el frontend, abra un libro, cambie el título y pulse **Guardar en cola**. La lista todavía muestra el título anterior.
2. En RabbitMQ Manager, abra la cola `bookstore` y confirme el mensaje `UPDATE`.
3. Abra `https://SU-SITIO.netlify.app/.netlify/functions/bookTasks`.
4. Recargue el frontend. El título nuevo debe venir de la base de datos.

Autores y editoriales se prueban igual, invocando `authorTasks` y `publisherTasks`.

## Ejecución local

```bash
npm install
npm test
npm run dev:api
npm run dev:web
```

Sin `DATABASE_URL`, la API local usa un archivo en `data/store.json`. Para la entrega use PostgreSQL. En local puede apuntar `CLOUDAMQP_URL` a su instancia de CloudAMQP.

<template>
  <div class="layout">
    <section class="panel">
      <h2>Libros</h2>
      <ul class="list">
        <li v-for="book in books" :key="book.id">
          <button type="button" :class="{ selected: form.id === book.id && !isNew }" @click="selectBook(book)">{{ book.title }}</button>
        </li>
      </ul>
      <div class="actions">
        <button type="button" @click="startCreate">Nuevo</button>
      </div>
    </section>
    <section class="panel">
      <h2>{{ isNew ? "Agregar libro" : "Modificar libro" }}</h2>
      <div class="grid">
        <label>Título<input v-model="form.title" type="text" /></label>
        <label>Edición<input v-model="form.edition" type="text" /></label>
        <label>Copyright<input v-model="form.copyright" type="text" /></label>
        <label>Idioma<input v-model="form.language" type="text" /></label>
        <label>Páginas<input v-model="form.pages" type="text" /></label>
        <label>Autor<input v-model="form.author" type="text" /></label>
        <label>Id de autor<input v-model="form.author_id" type="text" /></label>
        <label>Editorial<input v-model="form.publisher" type="text" /></label>
        <label>Id de editorial<input v-model="form.publisher_id" type="text" /></label>
      </div>
      <div class="actions">
        <button type="button" class="primary" :disabled="isBusy" @click="save">Guardar en cola</button>
        <button type="button" class="danger" :disabled="isBusy || isNew" @click="remove">Eliminar en cola</button>
        <button type="button" :disabled="isBusy" @click="processQueue">Procesar bookTasks</button>
      </div>
      <p class="status" role="status">{{ message }}</p>
    </section>
  </div>
</template>

<script>
import { endpoints, enqueue, readJson, runTasks } from "../api.js";

function emptyBook() {
  return { id: "", title: "", edition: "", copyright: "", language: "", pages: "", author: "", author_id: "", publisher: "", publisher_id: "" };
}

export default {
  data() {
    return { books: [], form: emptyBook(), isNew: true, isBusy: false, message: "" };
  },
  mounted() {
    this.loadBooks();
  },
  methods: {
    async loadBooks() {
      this.books = await readJson(endpoints.books);
    },
    selectBook(book) {
      this.isNew = false;
      this.form = { ...book };
      this.message = "";
    },
    startCreate() {
      this.isNew = true;
      this.form = emptyBook();
      this.message = "";
    },
    buildBody() {
      const body = { ...this.form };
      delete body.id;
      return body;
    },
    async save() {
      this.isBusy = true;
      this.message = "";
      try {
        if (this.isNew) {
          await enqueue(endpoints.bookInsert, "POST", this.buildBody());
        } else {
          await enqueue(endpoints.bookUpdate(this.form.id), "PUT", this.buildBody());
        }
        this.message = "Mensaje encolado en bookstore. Ejecute bookTasks para escribir el cambio en la base de datos.";
      } catch (error) {
        this.message = error.message;
      } finally {
        this.isBusy = false;
      }
    },
    async remove() {
      this.isBusy = true;
      this.message = "";
      try {
        await enqueue(endpoints.bookDelete(this.form.id), "DELETE");
        this.message = "Eliminación encolada. Ejecute bookTasks para aplicarla.";
      } catch (error) {
        this.message = error.message;
      } finally {
        this.isBusy = false;
      }
    },
    async processQueue() {
      this.isBusy = true;
      this.message = "";
      try {
        await runTasks(endpoints.bookTasks);
        await this.loadBooks();
        this.message = "bookTasks terminó. La lista muestra lo que quedó en la base de datos.";
      } catch (error) {
        this.message = error.message;
      } finally {
        this.isBusy = false;
      }
    }
  }
};
</script>

<template>
  <div class="layout">
    <section class="panel">
      <h2>Autores</h2>
      <ul class="list">
        <li v-for="author in authors" :key="author.id">
          <button type="button" :class="{ selected: form.id === author.id && !isNew }" @click="selectAuthor(author)">{{ author.author }}</button>
        </li>
      </ul>
      <div class="actions">
        <button type="button" @click="startCreate">Nuevo</button>
      </div>
    </section>
    <section class="panel">
      <h2>{{ isNew ? "Agregar autor" : "Modificar autor" }}</h2>
      <div class="grid">
        <label>Nombre<input v-model="form.author" type="text" /></label>
        <label>Nacionalidad<input v-model="form.nationality" type="text" /></label>
        <label>Año de nacimiento<input v-model="form.birth_year" type="text" /></label>
        <label>Campos<input v-model="form.fields" type="text" /></label>
      </div>
      <label>Libros (JSON)<textarea v-model="booksText" rows="5"></textarea></label>
      <div class="actions">
        <button type="button" class="primary" :disabled="isBusy" @click="save">Guardar en cola</button>
        <button type="button" class="danger" :disabled="isBusy || isNew" @click="remove">Eliminar en cola</button>
        <button type="button" :disabled="isBusy" @click="processQueue">Procesar authorTasks</button>
      </div>
      <p class="status" role="status">{{ message }}</p>
    </section>
  </div>
</template>

<script>
import { endpoints, enqueue, readJson, runTasks } from "../api.js";

function emptyAuthor() {
  return { id: "", author: "", nationality: "", birth_year: "", fields: "" };
}

export default {
  data() {
    return { authors: [], form: emptyAuthor(), booksText: "[]", isNew: true, isBusy: false, message: "" };
  },
  mounted() {
    this.loadAuthors();
  },
  methods: {
    async loadAuthors() {
      this.authors = await readJson(endpoints.authors);
    },
    selectAuthor(author) {
      this.isNew = false;
      this.form = { ...author };
      this.booksText = JSON.stringify(author.books || [], null, 2);
      this.message = "";
    },
    startCreate() {
      this.isNew = true;
      this.form = emptyAuthor();
      this.booksText = "[]";
      this.message = "";
    },
    buildBody() {
      let books = [];
      if (this.booksText.trim()) books = JSON.parse(this.booksText);
      if (!Array.isArray(books)) throw new Error("Los libros deben ser un arreglo JSON");
      return { author: this.form.author, nationality: this.form.nationality, birth_year: this.form.birth_year, fields: this.form.fields, books };
    },
    async save() {
      this.isBusy = true;
      this.message = "";
      try {
        const body = this.buildBody();
        if (this.isNew) {
          await enqueue(endpoints.authorInsert, "POST", body);
        } else {
          await enqueue(endpoints.authorUpdate(this.form.id), "PUT", body);
        }
        this.message = "Mensaje encolado en bookstore. Ejecute authorTasks para escribir el cambio en la base de datos.";
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
        await enqueue(endpoints.authorDelete(this.form.id), "DELETE");
        this.message = "Eliminación encolada. Ejecute authorTasks para aplicarla.";
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
        await runTasks(endpoints.authorTasks);
        await this.loadAuthors();
        this.message = "authorTasks terminó. La lista muestra lo que quedó en la base de datos.";
      } catch (error) {
        this.message = error.message;
      } finally {
        this.isBusy = false;
      }
    }
  }
};
</script>

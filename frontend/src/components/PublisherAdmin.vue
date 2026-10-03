<template>
  <div class="layout">
    <section class="panel">
      <h2>Editoriales</h2>
      <ul class="list">
        <li v-for="publisher in publishers" :key="publisher.id">
          <button type="button" :class="{ selected: form.id === publisher.id && !isNew }" @click="selectPublisher(publisher)">{{ publisher.publisher }}</button>
        </li>
      </ul>
      <div class="actions">
        <button type="button" @click="startCreate">Nuevo</button>
      </div>
    </section>
    <section class="panel">
      <h2>{{ isNew ? "Agregar editorial" : "Modificar editorial" }}</h2>
      <div class="grid">
        <label>Nombre<input v-model="form.publisher" type="text" /></label>
        <label>País<input v-model="form.country" type="text" /></label>
        <label>Fundación<input v-model="form.founded" type="text" /></label>
        <label>Género<input v-model="form.genere" type="text" /></label>
      </div>
      <label>Libros (JSON)<textarea v-model="booksText" rows="5"></textarea></label>
      <div class="actions">
        <button type="button" class="primary" :disabled="isBusy" @click="save">Guardar en cola</button>
        <button type="button" class="danger" :disabled="isBusy || isNew" @click="remove">Eliminar en cola</button>
        <button type="button" :disabled="isBusy" @click="processQueue">Procesar publisherTasks</button>
      </div>
      <p class="status" role="status">{{ message }}</p>
    </section>
  </div>
</template>

<script>
import { endpoints, enqueue, readJson, runTasks } from "../api.js";

function emptyPublisher() {
  return { id: "", publisher: "", country: "", founded: "", genere: "" };
}

export default {
  data() {
    return { publishers: [], form: emptyPublisher(), booksText: "[]", isNew: true, isBusy: false, message: "" };
  },
  mounted() {
    this.loadPublishers();
  },
  methods: {
    async loadPublishers() {
      this.publishers = await readJson(endpoints.publishers);
    },
    selectPublisher(publisher) {
      this.isNew = false;
      this.form = { ...publisher };
      this.booksText = JSON.stringify(publisher.books || [], null, 2);
      this.message = "";
    },
    startCreate() {
      this.isNew = true;
      this.form = emptyPublisher();
      this.booksText = "[]";
      this.message = "";
    },
    buildBody() {
      let books = [];
      if (this.booksText.trim()) books = JSON.parse(this.booksText);
      if (!Array.isArray(books)) throw new Error("Los libros deben ser un arreglo JSON");
      return { publisher: this.form.publisher, country: this.form.country, founded: this.form.founded, genere: this.form.genere, books };
    },
    async save() {
      this.isBusy = true;
      this.message = "";
      try {
        const body = this.buildBody();
        if (this.isNew) {
          await enqueue(endpoints.publisherInsert, "POST", body);
        } else {
          await enqueue(endpoints.publisherUpdate(this.form.id), "PUT", body);
        }
        this.message = "Mensaje encolado en bookstore. Ejecute publisherTasks para escribir el cambio en la base de datos.";
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
        await enqueue(endpoints.publisherDelete(this.form.id), "DELETE");
        this.message = "Eliminación encolada. Ejecute publisherTasks para aplicarla.";
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
        await runTasks(endpoints.publisherTasks);
        await this.loadPublishers();
        this.message = "publisherTasks terminó. La lista muestra lo que quedó en la base de datos.";
      } catch (error) {
        this.message = error.message;
      } finally {
        this.isBusy = false;
      }
    }
  }
};
</script>

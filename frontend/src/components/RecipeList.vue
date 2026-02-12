<template>
  <div>
    <div class="flex justify-between">
      <AddRecipe />
      <input class="input" v-model="query" @input="search" placeholder="Search by ingredient"/>
    </div>
    <hr class="my-10"/>
    <div v-if="state.loading">Loading...</div>
    <div class="flex" v-for="r in state.recipes" :key="r.id">
      <h3>{{ r.title }}</h3>
      <button @click="toggleFavorite(r.id)">
        {{ state.favorites.includes(r.id) ? "Unfavorite" : "Favorite" }}
      </button>
    </div>
    
  </div>
  
</template>

<script setup>
import { onMounted, reactive, ref, watch } from "vue";
import debounce from "../utils/debouncer.js";
import axios from "axios";
import AddRecipe from "./addRecipe.vue";
const api = axios.create({
  baseURL: "http://localhost:4000"
})
const state = reactive({
    recipes: [],
    favorites: JSON.parse(localStorage.getItem("favorites") || "[]"),
    loading: false,
    error: null,
    searchController: null
  });
const query = ref("");

async function fetchRecipes(search="") {
  // Axios call
  state.loading = true;
  if (state.searchController) {
    state.searchController.abort();
  }
  state.searchController = new AbortController();
  const response = await api.get("/recipes", { params: { search }, signal: state.searchController.signal }).catch(e => {
    state.error = e.message;
    state.loading = false;
    return { data: [] }
  });
  state.recipes = response.data;
  state.loading = false;
  return state.recipes
}

const searchRecipes = debounce(fetchRecipes, 500);

function toggleFavorite(id) {
  if (state.favorites.includes(id)) {
    state.favorites = state.favorites.filter(f => f !== id);
  } else {
    state.favorites.push(id);
  }
  localStorage.setItem("favorites", JSON.stringify(state.favorites));
}
onMounted(() => {
    fetchRecipes(query.value)
  }
);

watch(query, val => {
  searchRecipes(val)
});


</script>
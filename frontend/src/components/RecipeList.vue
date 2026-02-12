<template>
  <div>
    <input v-model="query" @input="search" placeholder="Search by ingredient"/>
    <div v-if="state.loading">Loading...</div>
    <div v-for="r in state.recipes" :key="r.id">
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
const initialRecipes = [
        { id: 1, title: "Pasta", ingredients: ["pasta", "tomato", "basil"] },
        { id: 2, title: "Salad", ingredients: ["lettuce", "tomato", "cucumber"] },
        { id: 3, title: "Pizza", ingredients: ["dough", "tomato", "cheese"] }
    ]
const state = reactive({
    recipes: [],
    favorites: JSON.parse(localStorage.getItem("favorites") || "[]"),
    loading: false,
    error: null,
  });
const query = ref("");

function fetchRecipes(search="") {
  // Axios call
  state.loading = true;
  state.recipes = initialRecipes.filter(r => r.ingredients.some(i => i.includes(search)));
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
<template>
  <div>
    <div class="flex justify-between">
      <AddRecipe @add="addRecipe" @updated="updateRecipe" @remove="removeRecipe" />
      <input class="input" v-model="query" @input="search" placeholder="Search by ingredient" />
    </div>
    <hr class="my-10" />
    <ToastContainer />
    <div v-if="state.loading" class="text-center py-6 text-gray-500 font-medium">
      Loading...
    </div>

    <div v-if="!state.loading && state.recipes.length > 0" class="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="r in state.recipes.sort((a, b) => state.favorites.includes(a.id) ? -1 : state.favorites.includes(b.id) ? 1 : 0)"
        :key="r.id" v-show="!r.deleted" class="card bg-base-100 shadow-md">
        <div class="card-body">
          <div class="flex justify-between">
            <h2 class="card-title break-words">{{ r.title }}</h2>
            <DeleteRecipe :recipe="r" @add="reAddRecipe" @remove="tempRemove" @permanent_remove="removeRecipe" />
          </div>
          <p class="text-gray-600 break-words">{{ r.ingredients.join(', ') }}</p>
          <div class="card-actions justify-between">
            <AddEditRecipe :recipe="r" @add="addRecipe" @updated="updateRecipe" @remove="removeRecipe" />
            <button :disabled="state.button_transactions_status.includes(r.id)" class="btn btn-sm" :class="state.favorites.includes(r.id) ? 'btn-error' : 'btn-primary'"
              @click="toggleFavorite(r.id)">
              {{ state.favorites.includes(r.id) ? "Unfavorite" : "Favorite" }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="!state.loading && state.recipes.length === 0" class="text-center py-6 text-gray-500 font-medium">
      No recipes found.
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch, toRaw } from "vue";
import debounce from "../utils/debouncer.js";
import AddRecipe from "./addEditRecipe.vue";
import AddEditRecipe from "./addEditRecipe.vue";
import { api } from "../utils/apiClient.js";
import DeleteRecipe from "./deleteRecipe.vue";
import ToastContainer from "./utility/ToastContainer.vue";
import { useToast } from "../utils/useToast.js";

const { show } = useToast();

const state = reactive({
  recipes: [],
  favorites: JSON.parse(localStorage.getItem("favorites") || "[]"),
  loading: false,
  error: null,
  searchController: null,
  button_transactions_status: []
});

const query = ref("");

function addRecipe(recipe) {
  state.recipes.unshift(recipe);
}

function updateRecipe(recipe) {
  const index = state.recipes.findIndex(r => r.id == recipe.id || r.id == recipe.temp_id);
  if (index !== -1) state.recipes[index] = recipe;
}

function removeRecipe(id) {
  state.recipes = state.recipes.filter(r => r.id !== id);
  state.favorites = state.favorites.filter(f => f !== id);
  localStorage.setItem("favorites", JSON.stringify(toRaw(state.favorites)));
}

function tempRemove(id) {
  state.recipes = state.recipes.map(r => r.id === id ? { ...r, deleted: true } : r);
}

function reAddRecipe(id) {
  state.recipes = state.recipes.map(r => r.id === id ? { ...r, deleted: false } : r);
}

async function fetchRecipes(search = "") {
  state.loading = true;
  if (state.searchController) state.searchController.abort();
  state.searchController = new AbortController();
  const response = await api.get("/recipes", { params: { search }, signal: state.searchController.signal })
    .catch(e => {
      state.error = e.message;
      state.loading = false;
      return { data: [] };
    });
  state.searchController = null;
  state.recipes = response.data;
  state.loading = false;
  return state.recipes;
}
async function fetchFavorites() {
  try {
    const response = await api.get("/favorites");
    state.favorites = response.data;
    localStorage.setItem("favorites", JSON.stringify(toRaw(state.favorites)));
  } catch (error) {
    show(error.response?.data?.error || error.message || "Failed to fetch favorites", "error", 3000);
  }
}

const searchRecipes = debounce(fetchRecipes, 100);

async function toggleFavorite(id) {
  state.button_transactions_status.push(id);
  const isFavorited = state.favorites.includes(id);
  if (isFavorited) {
    state.favorites = state.favorites.filter(f => f !== id)
  }
  else {
    state.favorites.push(id)
  };

  localStorage.setItem("favorites", JSON.stringify(toRaw(state.favorites)));

  try {
    if (isFavorited) {
      await api.delete(`/favorites/${id}`)
    }
    else {
      await api.post(`/favorites`, { id })
    };
  } catch (error) {
    if (isFavorited) { 
      state.favorites.push(id) 
    }
    else { 
      state.favorites = state.favorites.filter(f => f !== id) 
    };
    localStorage.setItem("favorites", JSON.stringify(toRaw(state.favorites)));
    show(error.response?.data?.error || error.message || "Failed to update favorite", "error", 3000);
  }
  finally {
      state.button_transactions_status = state.button_transactions_status.filter(f => f !== id);
  }
}

onMounted(() => {
  Promise.all([
    fetchFavorites(),
    fetchRecipes()
  ])
  .catch(err => {
    console.error("Failed to load initial data:", err);
  });
});


watch(query, val => {
  searchRecipes(val);
});
</script>

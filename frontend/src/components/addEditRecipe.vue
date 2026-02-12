<template>
    <button class="btn" @click="openModal()">{{ props.recipe ? "Edit" : "Add" }}</button>
    <dialog ref="modalRef" class="modal">
        <div class="modal-box">
            <fieldset class="fieldset p-4">
                <legend class="fieldset-legend">Page details</legend>

                <label class="label">Title</label>
                <input type="text" class="input" placeholder="Recipe Title" v-model="recipe.title" />
                <p v-if="state.errors.title" class="text-red-500 text-sm">
                    {{ state.errors.title[0] }}
                </p>


                <label class="label">Add ingredients</label>
                <div class="flex flex-wrap gap-2">
                    <input type="text" class="input" placeholder="Ingredients" v-model="newIngredient"
                        @keyup.enter="addIngredient" />
                    <button class="btn" @click="addIngredient">+</button>
                </div>
                <p v-if="state.errors.ingredienta" class="text-red-500 text-sm">
                    {{ state.errors.ingredients[0] }}
                </p>
                <div v-if="recipe.ingredients.length > 0 && !state.loading">
                    <label class="label">Ingredients</label>
                    <ul class="list-disc ml-5">
                        <li v-for="(ingredient, index) in recipe.ingredients" :key="index">
                            <div class="flex items-center gap-2">
                                {{ ingredient }}
                                <button class="btn btn-sm" @click="removeIngredient(index)">x</button>
                            </div>
                        </li>
                    </ul>
                </div>

                <label class="label">Instructions</label>
                <textarea type="text" rows="10" class="input" v-model="recipe.instructions"> </textarea>
                <p v-if="state.errors.instructions" class="text-red-500 text-sm">
                    {{ state.errors.instructions[0] }}
                </p>

            </fieldset>
            <div class="modal-action">
                <button class="btn btn-primary" @click="saveRecipe">Save</button>
                <form method="dialog">
                    <button @click="closeModal()" class="btn">Close</button>
                </form>
            </div>
        </div>
    </dialog>
</template>
<script setup>
import { reactive, ref } from "vue"
import { z } from "zod"
import { api } from "../utils/apiClient.js"
const modalRef = ref(null)

const recipeSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    ingredients: z.array(z.string().min(1, { message: "Ingredient must not be empty" }).refine(ingredient => ingredient.trim() !== "", { message: "Ingredient must not be empty space" }).min(1, "At least one ingredient required") ),
    instructions: z.string().min(10, "Instructions must be at least 10 characters")
})

function openModal() {
  modalRef.value.showModal()
}

function closeModal() {
  modalRef.value.close()
}
const newIngredient = ref("")

const state = reactive({
    loading: false,
    errors: {}
})

const props = defineProps({
    recipe: Object
})

const recipe = reactive({
    title: props.recipe?.title || "",
    ingredients: props.recipe?.ingredients ? [...props.recipe.ingredients] : [],
    instructions: props.recipe?.instructions || ""
})

function addIngredient() {
    if (newIngredient.value.trim() !== "") {
        recipe.ingredients.push(newIngredient.value.trim())
        newIngredient.value = ""
    }
}

function removeIngredient(index) {
    recipe.ingredients.splice(index, 1)
}

async function saveRecipe() {
    state.errors = {}
    const result = recipeSchema.safeParse(recipe)
    if (!result.success) {
        state.errors = result.error.flatten().fieldErrors
        return
    }
    state.loading = true
    try {
        if (props.recipe) {
            await api.put(`/recipes/${props.recipe.id}`, result.data)
        } else {
            await api.post("/recipes", result.data)
        }
        document.getElementById("my_modal_1").close()
    } catch (error) {
        console.error(error)
    } finally {
        state.loading = false
    }
}
</script>

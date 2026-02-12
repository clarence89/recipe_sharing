<template>
    <button class="btn" :class="props.recipe ? 'btn-sm btn-warning' : ''" @click="openModal()">{{ props.recipe ? "Edit"
        : "Add" }}</button>
    <dialog ref="modalRef" class="modal">
        <div class="modal-box">
            <fieldset class="fieldset p-4">
                <legend class="fieldset-legend">{{ props.recipe ? "Edit Recipe" : "Add Recipe" }}</legend>

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
                <p v-if="state.errors.ingredients" class="text-red-500 text-sm">
                    {{ state.errors.ingredients[0] }}
                </p>
                <div v-if="recipe.ingredients.length > 0">
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
                <button class="btn btn-primary" :disabled="state.loading" @click="saveRecipe">Save</button>
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
import { v4 as uuid } from 'uuid'
import { useToast } from "../utils/useToast.js"
const { show, errorHandler } = useToast()
const emit = defineEmits(['add', 'updated', 'remove', 'status'])

const modalRef = ref(null)

const recipeSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    ingredients: z
        .array(
            z
                .string()
                .min(1, { message: "Ingredient must not be empty" })
                .refine((i) => i.trim() !== "", { message: "Ingredient must not be only spaces" })
        )
        .min(1, { message: "At least one ingredient required" }),
    instructions: z.string().min(1, "Instructions must be at least 1 characters")
})

function openModal() {
    modalRef.value.showModal()
}
function resetForm() {
  Object.keys(initialRecipe).forEach(key => {
    recipe[key] = initialRecipe[key]
  })
  recipe.ingredients = []
  state.errors = {}
}
function closeModal() {
    modalRef.value.close()
    if (!props.recipe) {
        resetForm()
    }
}
const newIngredient = ref("")

const state = reactive({
    loading: false,
    errors: {}
})

const props = defineProps({
    recipe: Object
})

const initialRecipe = {
  id: props.recipe?.id || uuid(),
  title: props.recipe?.title || "",
  ingredients: props.recipe?.ingredients ? [...props.recipe.ingredients] : [],
  instructions: props.recipe?.instructions || "",
  updatedAt: props.recipe?.updatedAt || null
}

const recipe = reactive({ ...initialRecipe })

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
    const prop_data = { ...props.recipe }
    show("Saving recipe...", "info", 3000)
    try {
        if (props.recipe) {
            emit("updated", { ...recipe })
            result.data.updatedAt = props.recipe.updatedAt
            const res = await api.put(`/recipes/${props.recipe.id}`, result.data)
            emit("updated", { ...res.data })
            show("Recipe updated successfully", "success", 3000)
        } else {
            emit("add", { ...recipe })
            const res = await api.post("/recipes", result.data)
            emit("updated", { ...recipe, temp_id: recipe.id, id: res.data.id, updatedAt: res.data.updatedAt })
            show("Recipe added successfully", "success", 3000)
        }
        closeModal()
    } catch (error) {
        if (props.recipe) {
            emit("updated", { ...prop_data })
        } else {
            emit("remove", recipe.id)
        }
        errorHandler(error, 3000)
    } finally {
        state.loading = false
    }
}
</script>

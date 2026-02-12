<template>
    <button class="btn" :class="props.recipe ? 'btn-sm btn-error' : ''" @click="openModal()">X</button>
    <dialog ref="modalRef" class="modal">
        <div class="modal-box">
            <h3 class="font-bold text-lg">{{ props.recipe ? 'Delete Recipe' : 'Confirm Delete' }}</h3>
            <p class="py-4">Are you sure you want to delete the recipe "{{ props.recipe.title }}"?</p>
            <div class="modal-action">
                <button class="btn btn-primary" @click="deleteRecipe">Delete</button>
                <form method="dialog">
                    <button @click="closeModal()" class="btn">Close</button>
                </form>
            </div>
        </div>
    </dialog>
</template>
<script setup>
import { reactive, ref } from "vue"
import { api } from "../utils/apiClient.js"
import { v4 as uuid } from 'uuid'
import { useToast } from "../utils/useToast.js"
const { show, errorHandler } = useToast()
const emit = defineEmits(['add', 'remove', 'permanent_remove', 'status'])

const modalRef = ref(null)

function openModal() {
    modalRef.value.showModal()
}

function closeModal() {
    modalRef.value.close()
}
const state = reactive({
    loading: false,
    errors: {}
})

const props = defineProps({
    recipe: Object
})

const recipe = reactive({
    id: props.recipe?.id || uuid(),
    title: props.recipe?.title || "",
    ingredients: props.recipe?.ingredients ? [...props.recipe.ingredients] : [],
    instructions: props.recipe?.instructions || "",
    updatedAt: props.recipe?.updatedAt || null
})

async function deleteRecipe() {
    state.errors = {}
    state.loading = true
    try {
        emit("remove", recipe.id)
        await api.delete(`/recipes/${props.recipe.id}`)
        emit("permanent_remove", recipe.id)
        show("Recipe deleted successfully", "success", 3000)
        modalRef.value.close()
    } catch (error) {
        emit("add", recipe.id)
        errorHandler(error, 3000)
    } finally {
        state.loading = false
    }
}
</script>

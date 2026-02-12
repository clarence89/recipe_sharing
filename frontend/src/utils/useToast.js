import { ref } from "vue"

const toasts = ref([])

export function useToast() {

  function show(message, type = "success", duration = 3000) {
    const id = crypto.randomUUID()
    toasts.value.push({ id, message, type })

    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duration)
  }


  function errorHandler(error, duration = 3000) {
      let message = "Unexpected error"

  if (error.response?.data?.error) {
    message = error.response.data.error

  } else if (error.response?.data?.message) {
    message = error.response.data.message

  } else if (error.code === "ECONNABORTED") {
    message = "Request timed out"

  } else if (error.name === "CanceledError") {
    return

  } else if (!error.response) {
    message = "Network error"

  } else if (error.response.status === 404) {
    message = "Recipe not found"

  } else if (error.response.status === 403) {
    message = "Not authorized"

  } else if (error.response.status >= 500) {
    message = "Server error"
  }
    show(message, "error", duration)
  }
  return { toasts, show, errorHandler }
}

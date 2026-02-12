import express from "express"
import cors from "cors"
import { v4 as uuid } from "uuid"
import { z } from "zod"

const app = express()
app.use(cors())
app.use(express.json())
// Just for test, No database for the sake of the exam which feels frontend focused, We could use a database and add row locking for updates. Idempotency too, transactions, Atomic db operatioons...
// no jwt, no auth, no security everyone can access this end point
let recipes = []
let favorites = []
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

const delay = () =>
    new Promise(res => setTimeout(res, 300 + Math.random() * 900))

const maybeFail = () => Math.random() < 0.2

app.get("/recipes", async (req, res) => {
    await delay()
    const { search } = req.query
    if (!search) return res.json(recipes)
    const filtered = recipes.filter(r =>
        r.ingredients.some(i =>
            i.toLowerCase().includes(search.toLowerCase())
        )
    )
    res.json(filtered)
})

app.post("/recipes", async (req, res) => {
    await delay()
    if (maybeFail()) return res.status(500).json({ error: "Server Error: Create Failed, Please Try Again" })
    const result = recipeSchema.safeParse(req.body)
    if (!result.success) return res.status(400).json(result.error.flatten())
    const recipe = {
        id: uuid(),
        title: result.data.title,
        ingredients: result.data.ingredients,
        instructions: result.data.instructions,
        updatedAt: new Date().toISOString()
    }
    recipes.push(recipe)
    res.json(recipe)
})

app.put("/recipes/:id", async (req, res) => {
    await delay()
    const recipe = recipes.find(r => r.id === req.params.id)
    if (!recipe) return res.status(404).json({ error: "not found" })
    if (recipe.updatedAt !== req.body.updatedAt)
        return res.status(409).json({ error: "Update Failed: Version Conflict Note: Someone has already updated the recipe" })
    if (maybeFail()) return res.status(500).json({ error: "Server Error: Update Failed, Please Try Again" })
    const updated = {
        ...recipe,
        title: req.body.title,
        ingredients: req.body.ingredients,
        instructions: req.body.instructions,
        updatedAt: new Date().toISOString()
    }
    recipes = recipes.map(r => r.id === recipe.id ? updated : r)
    res.json(updated)
})

app.delete("/recipes/:id", async (req, res) => {
    await delay()
    if (maybeFail()) return res.status(500).json({ error: "Server Error: Delete Failed, Please Try Again" })
    recipes = recipes.filter(r => r.id !== req.params.id)
    res.json({ success: true })
})

// Favorites Endpoints
app.get("/favorites", async (req, res) => {
  await delay()
  res.json(favorites)
})

app.post("/favorites", async (req, res) => {
  await delay()
  if (maybeFail()) return res.status(500).json({ error: "Server Error: Could not add favorite" })

  const { id } = req.body
  if (!recipes.some(r => r.id === id)) return res.status(404).json({ error: "Recipe not found" })

  if (!favorites.includes(id)) favorites.push(id)
  res.json({ success: true, favorites })
})

app.delete("/favorites/:id", async (req, res) => {
  await delay()
  if (maybeFail()) return res.status(500).json({ error: "Server Error: Could not remove favorite" })

  const { id } = req.params
  favorites = favorites.filter(f => f !== id)
  res.json({ success: true, favorites })
})


app.listen(4000, () => console.log("backend on 4000"))

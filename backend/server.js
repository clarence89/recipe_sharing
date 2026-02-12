import express from "express"
import cors from "cors"
import { v4 as uuid } from "uuid"

const app = express()
app.use(cors())
app.use(express.json())
// Just for test, No database, We could use a database and add row locking for updates. Idempotency too, transactions, Atomic db operatioons...
// no jwt, no auth, no security everyone can access this end point
let recipes = []

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
    const recipe = {
        id: uuid(),
        title: req.body.title,
        ingredients: req.body.ingredients,
        instructions: req.body.instructions,
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

app.listen(4000, () => console.log("backend on 4000"))

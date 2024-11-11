const express = require("express")
const cors = require("cors")
const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Validation middleware
const validateRole = (req, res, next) => {
  const { name, type } = req.body
  if (!name || !type) {
    return res.status(400).json({
      message: "Name and type are required fields",
    })
  }
  next()
}

// Sample data
let userRoles = [
  {
    id: 1,
    name: "Superadmin",
    type: "DEFAULT",
    dateCreated: "Jan 1, 2023",
    status: "Active",
    users: [
      {
        id: 1,
        avatar: "/api/placeholder/200/200",
        fallback: "U1",
      },
      {
        id: 2,
        avatar: "/api/placeholder/200/200",
        fallback: "U2",
      },
    ],
  },
]

// Helper function to parse role ID
const parseRoleId = id => {
  const parsedId = parseInt(id, 10)
  if (isNaN(parsedId)) {
    throw new Error("Invalid role ID")
  }
  return parsedId
}

// Routes
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>User Roles API</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .endpoint { background: #f4f4f4; padding: 10px; margin: 10px 0; border-radius: 4px; }
          .method { font-weight: bold; color: #333; }
        </style>
      </head>
      <body>
        <h1>User Roles API</h1>
        <p>Available endpoints:</p>
        <div class="endpoint">
          <span class="method">GET</span> /api/roles - Get all roles
        </div>
        <div class="endpoint">
          <span class="method">GET</span> /api/roles/:id - Get a specific role
        </div>
        <div class="endpoint">
          <span class="method">GET</span> /api/roles/:id/users - Get users for a role
        </div>
        <div class="endpoint">
          <span class="method">POST</span> /api/roles/:id/users - Add a user to a role
        </div>
      </body>
    </html>
  `)
})

app.get("/api/roles", (req, res) => {
  res.json(userRoles)
})

app.get("/api/roles/:id", (req, res) => {
  try {
    const roleId = parseRoleId(req.params.id)
    const role = userRoles.find(r => r.id === roleId)
    if (!role) return res.status(404).json({ message: "Role not found" })
    res.json(role)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

app.post("/api/roles", validateRole, (req, res) => {
  const newRole = {
    id: userRoles.length + 1,
    name: req.body.name,
    type: req.body.type,
    dateCreated: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
    status: req.body.status || "Active",
    users: req.body.users || [],
  }
  userRoles.push(newRole)
  res.status(201).json(newRole)
})

app.put("/api/roles/:id", validateRole, (req, res) => {
  try {
    const roleId = parseRoleId(req.params.id)
    const role = userRoles.find(r => r.id === roleId)
    if (!role) return res.status(404).json({ message: "Role not found" })

    role.name = req.body.name
    role.type = req.body.type
    role.status = req.body.status || role.status
    role.users = req.body.users || role.users
    res.json(role)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

app.delete("/api/roles/:id", (req, res) => {
  try {
    const roleId = parseRoleId(req.params.id)
    const roleIndex = userRoles.findIndex(r => r.id === roleId)
    if (roleIndex === -1) return res.status(404).json({ message: "Role not found" })
    userRoles.splice(roleIndex, 1)
    res.status(204).send()
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

app.get("/api/roles/:id/users", (req, res) => {
  try {
    const roleId = parseRoleId(req.params.id)
    const role = userRoles.find(r => r.id === roleId)
    if (!role) return res.status(404).json({ message: "Role not found" })
    res.json(role.users || [])
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

app.post("/api/roles/:id/users", (req, res) => {
  try {
    const roleId = parseRoleId(req.params.id)
    const role = userRoles.find(r => r.id === roleId)
    if (!role) return res.status(404).json({ message: "Role not found" })

    if (!role.users) {
      role.users = []
    }

    const newUser = {
      id: role.users.length + 1,
      avatar: req.body.avatar || "/api/placeholder/200/200",
      fallback: req.body.fallback || `U${role.users.length + 1}`,
    }
    role.users.push(newUser)
    res.status(201).json(newUser)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "Something went wrong!" })
})

// Only start the server if we're not in a test environment
if (process.env.NODE_ENV !== "test") {
  app.listen(3001, () => {
    console.log("User roles API running at http://localhost:3001")
  })
}

module.exports = app

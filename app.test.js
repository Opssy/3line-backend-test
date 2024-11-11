const request = require("supertest")
const app = require("./app")

// Ensure we're in test environment
process.env.NODE_ENV = "test"

describe("User Roles API", () => {
  describe("GET /api/roles/:id/users", () => {
    it("should return users for a role", async () => {
      const res = await request(app).get("/api/roles/1/users")
      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBeTruthy()
      expect(res.body.length).toBe(2)
      expect(res.body[0]).toHaveProperty("fallback")
      expect(res.body[0]).toHaveProperty("avatar")
    })

    it("should return 404 if role not found", async () => {
      const res = await request(app).get("/api/roles/999/users")
      expect(res.status).toBe(404)
      expect(res.body).toHaveProperty("message")
    })

    it("should return 400 for invalid role ID", async () => {
      const res = await request(app).get("/api/roles/invalid/users")
      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty("message")
    })
  })

  describe("POST /api/roles/:id/users", () => {
    const newUser = {
      fallback: "U3",
      avatar: "/api/placeholder/200/200",
    }

    it("should add a new user to a role", async () => {
      const res = await request(app).post("/api/roles/1/users").send(newUser)
      expect(res.status).toBe(201)
      expect(res.body.fallback).toBe(newUser.fallback)
      expect(res.body.avatar).toBe(newUser.avatar)
      expect(res.body.id).toBeDefined()
    })

    it("should return 404 if role not found", async () => {
      const res = await request(app).post("/api/roles/999/users").send(newUser)
      expect(res.status).toBe(404)
      expect(res.body).toHaveProperty("message")
    })

    it("should return 400 for invalid role ID", async () => {
      const res = await request(app).post("/api/roles/invalid/users").send(newUser)
      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty("message")
    })
  })
})

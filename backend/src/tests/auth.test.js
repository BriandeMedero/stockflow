const request = require("supertest");
const app = require("../app");
const pool = require("../db");

describe("Auth", () => {

    const testUser = {
        name: "Usuario Test",
        email: `test_${Date.now()}@example.com`,
        password: "123456"
    };

    afterAll(async () => {
        // Limpiar el usuario creado y cerrar la conexión a la DB
        await pool.query("DELETE FROM users WHERE email = $1", [testUser.email]);
        await pool.end();
    });

    describe("POST /api/auth/register", () => {

        it("crea un usuario nuevo correctamente", async () => {

            const response = await request(app)
                .post("/api/auth/register")
                .send(testUser);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("id");
            expect(response.body.email).toBe(testUser.email);
            expect(response.body.role).toBe("USER");
            expect(response.body).not.toHaveProperty("password");
        });

        it("rechaza el registro si falta un campo obligatorio", async () => {

            const response = await request(app)
                .post("/api/auth/register")
                .send({ email: "incompleto@example.com" });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("error");
        });

        it("rechaza contraseñas de menos de 6 caracteres", async () => {

            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Otro",
                    email: `otro_${Date.now()}@example.com`,
                    password: "123"
                });

            expect(response.status).toBe(400);
        });

        it("rechaza un email ya registrado", async () => {

            const response = await request(app)
                .post("/api/auth/register")
                .send(testUser); // mismo email que el primer test

            expect(response.status).toBe(400);
            expect(response.body.error).toMatch(/ya está registrado/i);
        });

    });

    describe("POST /api/auth/login", () => {

        it("hace login correctamente con credenciales válidas", async () => {

            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("token");
            expect(response.body.user.email).toBe(testUser.email);
        });

        it("rechaza login con contraseña incorrecta", async () => {

            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: testUser.email,
                    password: "contraseña_mala"
                });

            expect(response.status).toBe(400);
        });

        it("rechaza login con email inexistente", async () => {

            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "no_existe@example.com",
                    password: "123456"
                });

            expect(response.status).toBe(400);
        });

    });

});
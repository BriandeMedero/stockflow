const express = require("express");

const router = express.Router();

const pool = require("../db");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Usuario Nuevo
 *               email:
 *                 type: string
 *                 example: usuario@test.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
 *       400:
 *         description: El email ya existe
 */


// Registrar usuario
router.post("/register", async (req, res) => {
    try {
        const {
            name,
            email,
            password
        } = req.body;   

        if (!name || !email || !password) {

            return res.status(400).json({
                error: "Todos los campos son obligatorios"
            });

        }

        if (password.length < 6) {

            return res.status(400).json({
                error: "La contraseña debe tener al menos 6 caracteres"
            });

        }


        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );


        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                error: "El email ya está registrado"
            });
        }


        const hashedPassword = await bcrypt.hash(
            password,
            10
        );


        const result = await pool.query(
            `INSERT INTO users
            (name, email, password, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, name, email, role`,
            [
                name,
                email,
                hashedPassword,
                "USER"
            ]
        );


        res.status(201).json(result.rows[0]);


    } catch (error) {

        console.error("Error SQL:", error);

        res.status(500).json({
            error: "Error al registrar usuario"
        });
    }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: prueba@stockflow.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login correcto, devuelve JWT
 *       400:
 *         description: Usuario o contraseña incorrectos
 */

// Login de usuario
router.post("/login", async (req, res) => {
    try {

        const {
            email,
            password
        } = req.body;

        if (!email || !password) {

            return res.status(400).json({
                error: "Email y contraseña son obligatorios"
            });

        }

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );


        if (result.rows.length === 0) {
            return res.status(400).json({
                error: "Usuario no encontrado"
            });
        }


        const user = result.rows[0];


        const passwordCorrect = await bcrypt.compare(
            password,
            user.password
        );


        if (!passwordCorrect) {
            return res.status(400).json({
                error: "Contraseña incorrecta"
            });
        }


    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "8h"
        }
    );


            res.json({
                message: "Login correcto",
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });


    } catch (error) {

        console.error("Error login:", error);

        res.status(500).json({
            error: "Error al iniciar sesión"
        });
    }
});

module.exports = router;
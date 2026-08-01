const express = require("express");

const router = express.Router();

const pool = require("../db");

const verifyToken = require("../middleware/auth");
const verifyAdmin = require("../middleware/roles");

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Obtener todas las categorías
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorías
 */

// Obtener todas las categorías
router.get("/", verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM categories"
        );

        res.json(result.rows);

    } catch (error) {
        console.error("Error SQL:", error);

        res.status(500).json({
            error: "Error al obtener categorías"
        });
    }
});

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Obtener una categoría por ID
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Categoría encontrada
 *       404:
 *         description: Categoría no encontrada
 */

// Obtener una categoría por ID
router.get("/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM categories WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Categoría no encontrada"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Error SQL:", error);

        res.status(500).json({
            error: "Error al obtener categoría"
        });
    }
});

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Crear una categoría
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Notebooks
 *     responses:
 *       201:
 *         description: Categoría creada correctamente
 *       401:
 *         description: Token no válido o faltante
 *       403:
 *         description: Se requieren permisos de administrador
 */

// Crear una categoría
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || name.trim().length < 3) {
            return res.status(400).json({
                error: "El nombre debe tener al menos 3 caracteres"
            });
        }

        const result = await pool.query(
            `INSERT INTO categories (name)
             VALUES ($1)
             RETURNING *`,
            [name]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error("Error SQL:", error);

        res.status(500).json({
            error: "Error al crear categoría"
        });
    }
});

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Actualizar una categoría
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Componentes PC
 *     responses:
 *       200:
 *         description: Categoría actualizada
 *       404:
 *         description: Categoría no encontrada
 *       401:
 *         description: Token no válido o faltante
 *       403:
 *         description: Se requieren permisos de administrador
 */

// Actualizar una categoría
router.put("/:id", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name || name.trim().length < 3) {
            return res.status(400).json({
                error: "El nombre debe tener al menos 3 caracteres"
            });
        }

        const result = await pool.query(
            `UPDATE categories
             SET name = $1
             WHERE id = $2
             RETURNING *`,
            [
                name,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Categoría no encontrada"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Error SQL:", error);

        res.status(500).json({
            error: "Error al actualizar categoría"
        });
    }
});

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Eliminar una categoría
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Categoría eliminada
 *       404:
 *         description: Categoría no encontrada
 *       401:
 *         description: Token no válido o faltante
 *       403:
 *         description: Se requieren permisos de administrador
 */

// Eliminar una categoría
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM categories WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Categoría no encontrada"
            });
        }

        res.json({
            message: "Categoría eliminada",
            category: result.rows[0]
        });

    } catch (error) {
        console.error("Error SQL:", error);

        // Si la categoría tiene productos asociados, la FK va a rechazar el DELETE
        if (error.code === "23503") {
            return res.status(400).json({
                error: "No se puede eliminar: hay productos asociados a esta categoría"
            });
        }

        res.status(500).json({
            error: "Error al eliminar categoría"
        });
    }
});


module.exports = router;
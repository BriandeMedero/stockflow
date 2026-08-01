const express = require("express");

const router = express.Router();

const pool = require("../db");

const verifyToken = require("../middleware/auth");
const { registerMovement } = require("../services/stockService");

/**
 * @swagger
 * /movements:
 *   post:
 *     summary: Crear un movimiento de inventario
 *     tags:
 *       - Movements
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: integer
 *                 example: 1
 *               type:
 *                 type: string
 *                 example: PURCHASE
 *                 enum:
 *                   - PURCHASE
 *                   - SALE
 *                   - RETURN
 *                   - ADJUSTMENT
 *               quantity:
 *                 type: integer
 *                 example: 10
 *     responses:
 *       201:
 *         description: Movimiento creado correctamente
 *       400:
 *         description: Stock insuficiente o datos inválidos
 */

// Crear movimiento de inventario
router.post("/", verifyToken, async (req, res) => {

    const { product_id, type, quantity } = req.body;

    if (!product_id) {
        return res.status(400).json({
            error: "El producto es obligatorio"
        });
    }

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        const movement = await registerMovement(client, {
            product_id,
            user_id: req.user.id,
            type,
            quantity
        });

        await client.query("COMMIT");

        res.status(201).json({
            message: "Movimiento creado",
            movement
        });

    } catch (error) {

        await client.query("ROLLBACK");

        if (error.status) {
            return res.status(error.status).json({
                error: error.message
            });
        }

        console.error("Error movimiento:", error);

        res.status(500).json({
            error: "Error al crear movimiento"
        });

    } finally {

        client.release();

    }

});

/**
 * @swagger
 * /movements:
 *   get:
 *     summary: Obtener historial de movimientos
 *     tags:
 *       - Movements
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de movimientos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movement'
 */

// Obtener historial de movimientos
router.get("/", verifyToken, async (req, res) => {

    try {

        const result = await pool.query(
            `
            SELECT 
                inventory_movements.id,
                products.name AS product,
                users.name AS user,
                inventory_movements.type,
                inventory_movements.quantity,
                inventory_movements.created_at
            FROM inventory_movements

            INNER JOIN products
            ON inventory_movements.product_id = products.id

            INNER JOIN users
            ON inventory_movements.user_id = users.id

            ORDER BY inventory_movements.created_at DESC
            `
        );

        res.json(result.rows);

    } catch (error) {

        console.error("Error movimientos:", error);

        res.status(500).json({
            error: "Error al obtener movimientos"
        });

    }

});

/**
 * @swagger
 * /movements/product/{id}:
 *   get:
 *     summary: Obtener movimientos de un producto
 *     tags:
 *       - Movements
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
 *         description: Historial del producto
 *       404:
 *         description: Producto no encontrado
 */

// Obtener movimientos de un producto
router.get("/product/:id", verifyToken, async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(
            `
            SELECT
                inventory_movements.id,
                products.name AS product,
                inventory_movements.type,
                inventory_movements.quantity,
                inventory_movements.created_at
            FROM inventory_movements

            INNER JOIN products
            ON inventory_movements.product_id = products.id

            WHERE products.id = $1

            ORDER BY inventory_movements.created_at DESC
            `,
            [id]
        );

        res.json(result.rows);

    } catch (error) {

        console.error("Error movimientos producto:", error);

        res.status(500).json({
            error: "Error al obtener movimientos del producto"
        });

    }

});

module.exports = router;
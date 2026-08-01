const express = require("express");

const router = express.Router();

const pool = require("../db");

const verifyToken = require("../middleware/auth");
const { registerMovement } = require("../services/stockService");

/**
 * @swagger
 * /sales:
 *   post:
 *     summary: Crear una venta
 *     tags:
 *       - Sales
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                       example: 1
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *     responses:
 *       201:
 *         description: Venta creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sale'
 *       400:
 *         description: Stock insuficiente o datos inválidos
 *       401:
 *         description: Token no válido o faltante
 */

// Crear una venta
router.post("/", verifyToken, async (req, res) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        const { items } = req.body;

        if (!Array.isArray(items) || items.length === 0) {

            await client.query("ROLLBACK");

            return res.status(400).json({
                error: "La venta debe contener al menos un producto"
            });

        }

        let total = 0;

        const products = [];

        for (const item of items) {

            if (!item.product_id || item.quantity <= 0) {

                await client.query("ROLLBACK");

                return res.status(400).json({
                    error: "Producto y cantidad son obligatorios"
                });

            }

            const productResult = await client.query(
                `SELECT id,
                        name,
                        sale_price,
                        stock
                 FROM products
                 WHERE id = $1`,
                [item.product_id]
            );

            if (productResult.rows.length === 0) {

                await client.query("ROLLBACK");

                return res.status(404).json({
                    error: `Producto ${item.product_id} no encontrado`
                });

            }

            const product = productResult.rows[0];

            if (product.stock < item.quantity) {

                await client.query("ROLLBACK");

                return res.status(400).json({
                    error: `Stock insuficiente para ${product.name}`
                });

            }

            const subtotal = Number(product.sale_price) * item.quantity;

            total += subtotal;

            products.push({
                ...product,
                quantity: item.quantity,
                subtotal
            });

        }

        // Crear la venta
        const saleResult = await client.query(
            `INSERT INTO sales
            (user_id, total)
            VALUES ($1, $2)
            RETURNING *`,
            [
                req.user.id,
                total
            ]
        );

        const sale = saleResult.rows[0];

        // Guardar detalle de cada producto vendido, actualizar stock y registrar movimiento
        for (const product of products) {

            await client.query(
                `INSERT INTO sale_details
                (sale_id, product_id, quantity, unit_price, subtotal)
                VALUES ($1, $2, $3, $4, $5)`,
                [
                    sale.id,
                    product.id,
                    product.quantity,
                    product.sale_price,
                    product.subtotal
                ]
            );

            await registerMovement(client, {
                product_id: product.id,
                user_id: req.user.id,
                type: "SALE",
                quantity: product.quantity
            });

        }

        await client.query("COMMIT");

        res.status(201).json({
            message: "Venta realizada correctamente",
            sale
        });

    } catch (error) {

        await client.query("ROLLBACK");

        if (error.status) {
            return res.status(error.status).json({
                error: error.message
            });
        }

        console.error("Error venta:", error);

        res.status(500).json({
            error: "Error al realizar la venta"
        });

    } finally {

        client.release();

    }

});

/**
 * @swagger
 * /sales:
 *   get:
 *     summary: Obtener todas las ventas
 *     tags:
 *       - Sales
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de ventas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Sale'
 */

// Obtener todas las ventas
router.get("/", verifyToken, async (req, res) => {

    try {

        const result = await pool.query(
            `
            SELECT
                sales.id,
                users.name AS user,
                sales.total,
                sales.created_at
            FROM sales

            INNER JOIN users
            ON sales.user_id = users.id

            ORDER BY sales.created_at DESC
            `
        );

        res.json(result.rows);

    } catch (error) {

        console.error("Error ventas:", error);

        res.status(500).json({
            error: "Error al obtener ventas"
        });

    }

});

/**
 * @swagger
 * /sales/{id}:
 *   get:
 *     summary: Obtener una venta por ID con sus detalles
 *     tags:
 *       - Sales
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
 *         description: Venta encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sale'
 *       404:
 *         description: Venta no encontrada
 */

// Obtener una venta por ID
router.get("/:id", verifyToken, async (req, res) => {

    try {

        const { id } = req.params;

        const saleResult = await pool.query(
            `
            SELECT
                sales.id,
                users.name AS user,
                sales.total,
                sales.created_at
            FROM sales

            INNER JOIN users
            ON sales.user_id = users.id

            WHERE sales.id = $1
            `,
            [id]
        );

        if (saleResult.rows.length === 0) {

            return res.status(404).json({
                error: "Venta no encontrada"
            });

        }

        const detailsResult = await pool.query(
            `
            SELECT
                products.name AS product,
                sale_details.quantity,
                sale_details.unit_price,
                sale_details.subtotal
            FROM sale_details

            INNER JOIN products
            ON sale_details.product_id = products.id

            WHERE sale_details.sale_id = $1
            `,
            [id]
        );

        res.json({
            ...saleResult.rows[0],
            items: detailsResult.rows
        });

    } catch (error) {

        console.error("Error venta detalle:", error);

        res.status(500).json({
            error: "Error al obtener venta"
        });

    }

});

module.exports = router;
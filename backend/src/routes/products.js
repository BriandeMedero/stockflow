const express = require("express");

const router = express.Router();

const pool = require("../db");

const verifyToken = require("../middleware/auth");
const verifyAdmin = require("../middleware/roles");
const { validate, productValidation } = require("../middleware/validations");

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Obtener todos los productos
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */

// Obtener todos los productos
router.get("/", verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
    `SELECT 
        products.*,
        categories.name AS category,
        categories.id AS category_id
        FROM products
        JOIN categories
        ON products.category_id = categories.id`
    );

        res.json(result.rows);

    } catch (error) {
        console.error("Error SQL:", error);

        res.status(500).json({
            error: "Error al obtener productos"
        });
    }
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Obtener un producto por ID
 *     tags:
 *       - Products
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
 *         description: Producto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Producto no encontrado
 */

// Obtener un producto por ID
router.get("/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
    `SELECT 
        products.id,
        products.name,
        products.description,
        products.purchase_price,
        products.sale_price,
        products.stock,
        products.category_id,
        products.created_at,
        categories.name AS category
    FROM products
    INNER JOIN categories
    ON products.category_id = categories.id
    WHERE products.id = $1`,
    [id]
);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Producto no encontrado"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Error SQL:", error);

        res.status(500).json({
            error: "Error al obtener producto"
        });
    }
});

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Crear un producto
 *     tags:
 *       - Products
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
 *                 example: Mouse Logitech
 *               description:
 *                 type: string
 *                 example: Mouse inalámbrico
 *               purchase_price:
 *                 type: number
 *                 example: 15000
 *               sale_price:
 *                 type: number
 *                 example: 20000
 *               stock:
 *                 type: integer
 *                 example: 10
 *               category_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Producto creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token no válido o faltante
 */

// Crear un producto
        router.post(
            "/",
            verifyToken,
            verifyAdmin,
            productValidation,
            validate,
            async (req,res)=>{


    try {
        const {
            name,
            description,
            purchase_price,
            sale_price,
            stock,
            category_id
        } = req.body;

        const result = await pool.query(
            `INSERT INTO products 
            (name, description, purchase_price, sale_price, stock, category_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [
                name,
                description,
                purchase_price,
                sale_price,
                stock,
                category_id
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error("Error SQL:", error);

        res.status(500).json({
            error: "Error al crear producto"
        });
    }
});

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Actualizar un producto
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Mouse Logitech
 *               description:
 *                 type: string
 *                 example: Mouse inalámbrico
 *               purchase_price:
 *                 type: number
 *                 example: 15000
 *               sale_price:
 *                 type: number
 *                 example: 20000
 *               stock:
 *                 type: integer
 *                 example: 10
 *               category_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Producto actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Producto no encontrado
 *       401:
 *         description: Token no válido o faltante
 */

// Actualizar un producto

        router.put(
            "/:id",
            verifyToken,
            verifyAdmin,
            productValidation,
            validate,
            async (req,res)=>{


    try {
        const { id } = req.params;

        const {
            name,
            description,
            purchase_price,
            sale_price,
            stock,
            category_id
        } = req.body;

        const result = await pool.query(
            `UPDATE products
             SET name = $1,
                 description = $2,
                 purchase_price = $3,
                 sale_price = $4,
                 stock = $5,
                 category_id = $6
             WHERE id = $7
             RETURNING *`,
            [
                name,
                description,
                purchase_price,
                sale_price,
                stock,
                category_id,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Producto no encontrado"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Error SQL:", error);

        res.status(500).json({
            error: "Error al actualizar producto"
        });
    }
});

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Eliminar un producto
 *     tags:
 *       - Products
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
 *         description: Producto eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Producto no encontrado
 */

        router.delete(
            "/:id",
                verifyToken,
            verifyAdmin,
            async (req, res) => {

        try {

        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM products WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Producto no encontrado"
            });
        }

        res.json({
            message: "Producto eliminado",
            product: result.rows[0]
        });

    } catch (error) {
        console.error("Error SQL:", error);

        res.status(500).json({
            error: "Error al eliminar producto"
        });
    }
});

module.exports = router;
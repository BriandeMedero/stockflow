const pool = require("../db");
const { registerMovement } = require("../services/stockService");

describe("stockService.registerMovement", () => {

    let testUserId;
    let testCategoryId;
    let testProductId;

    beforeAll(async () => {

        const userResult = await pool.query(
            `INSERT INTO users (name, email, password, role)
             VALUES ('Test Stock', $1, 'hash_falso', 'ADMIN')
             RETURNING id`,
            [`stock_test_${Date.now()}@example.com`]
        );
        testUserId = userResult.rows[0].id;

        const categoryResult = await pool.query(
            `INSERT INTO categories (name) VALUES ('Categoria Test Stock') RETURNING id`
        );
        testCategoryId = categoryResult.rows[0].id;

        const productResult = await pool.query(
            `INSERT INTO products (name, description, purchase_price, sale_price, stock, category_id)
             VALUES ('Producto Test Stock', 'desc', 100, 200, 10, $1)
             RETURNING id`,
            [testCategoryId]
        );
        testProductId = productResult.rows[0].id;
    });

    afterAll(async () => {
        await pool.query("DELETE FROM inventory_movements WHERE product_id = $1", [testProductId]);
        await pool.query("DELETE FROM products WHERE id = $1", [testProductId]);
        await pool.query("DELETE FROM categories WHERE id = $1", [testCategoryId]);
        await pool.query("DELETE FROM users WHERE id = $1", [testUserId]);
        await pool.end();
    });

    async function getStock() {
        const result = await pool.query("SELECT stock FROM products WHERE id = $1", [testProductId]);
        return result.rows[0].stock;
    }

    it("PURCHASE suma stock correctamente", async () => {

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            await registerMovement(client, {
                product_id: testProductId,
                user_id: testUserId,
                type: "PURCHASE",
                quantity: 5
            });

            await client.query("COMMIT");

        } finally {
            client.release();
        }

        expect(await getStock()).toBe(15); // 10 + 5
    });

    it("SALE resta stock correctamente", async () => {

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            await registerMovement(client, {
                product_id: testProductId,
                user_id: testUserId,
                type: "SALE",
                quantity: 3
            });

            await client.query("COMMIT");

        } finally {
            client.release();
        }

        expect(await getStock()).toBe(12); // 15 - 3
    });

    it("rechaza SALE si no hay stock suficiente, y NO modifica el stock", async () => {

        const stockAntes = await getStock(); // 12

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            await expect(
                registerMovement(client, {
                    product_id: testProductId,
                    user_id: testUserId,
                    type: "SALE",
                    quantity: 999
                })
            ).rejects.toMatchObject({ status: 400 });

            await client.query("ROLLBACK");

        } finally {
            client.release();
        }

        expect(await getStock()).toBe(stockAntes); // no cambió
    });

    it("rechaza ADJUSTMENT si no hay stock suficiente (regresión del bug corregido)", async () => {

        const stockAntes = await getStock(); // 12

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            await expect(
                registerMovement(client, {
                    product_id: testProductId,
                    user_id: testUserId,
                    type: "ADJUSTMENT",
                    quantity: 999
                })
            ).rejects.toMatchObject({ status: 400 });

            await client.query("ROLLBACK");

        } finally {
            client.release();
        }

        // Antes del fix esto hubiera dejado el stock en negativo
        expect(await getStock()).toBe(stockAntes);
        expect(stockAntes).toBeGreaterThanOrEqual(0);
    });

    it("rechaza un tipo de movimiento inválido", async () => {

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            await expect(
                registerMovement(client, {
                    product_id: testProductId,
                    user_id: testUserId,
                    type: "TIPO_INVENTADO",
                    quantity: 1
                })
            ).rejects.toMatchObject({ status: 400 });

            await client.query("ROLLBACK");

        } finally {
            client.release();
        }
    });

    it("rechaza cantidad menor o igual a 0", async () => {

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            await expect(
                registerMovement(client, {
                    product_id: testProductId,
                    user_id: testUserId,
                    type: "PURCHASE",
                    quantity: 0
                })
            ).rejects.toMatchObject({ status: 400 });

            await client.query("ROLLBACK");

        } finally {
            client.release();
        }
    });

});
const VALID_TYPES = ["PURCHASE", "SALE", "RETURN", "ADJUSTMENT"];

const INCREASE_TYPES = ["PURCHASE", "RETURN"];
const DECREASE_TYPES = ["SALE", "ADJUSTMENT"];

/**
 * Registra un movimiento de inventario y actualiza el stock del producto.
 * Debe llamarse DENTRO de una transacción ya iniciada (client con BEGIN hecho).
 * Lanza un Error con .status y .message si algo es inválido.
 */
async function registerMovement(client, { product_id, user_id, type, quantity }) {

    if (!VALID_TYPES.includes(type)) {
        const err = new Error("Tipo de movimiento inválido");
        err.status = 400;
        throw err;
    }

    if (quantity <= 0) {
        const err = new Error("La cantidad debe ser mayor a 0");
        err.status = 400;
        throw err;
    }

    const productResult = await client.query(
        "SELECT id, stock FROM products WHERE id = $1 FOR UPDATE",
        [product_id]
    );

    if (productResult.rows.length === 0) {
        const err = new Error("Producto no encontrado");
        err.status = 404;
        throw err;
    }

    const product = productResult.rows[0];

    if (DECREASE_TYPES.includes(type) && product.stock < quantity) {
        const err = new Error("Stock insuficiente");
        err.status = 400;
        throw err;
    }

    const movementResult = await client.query(
        `INSERT INTO inventory_movements (product_id, user_id, type, quantity)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [product_id, user_id, type, quantity]
    );

    const delta = INCREASE_TYPES.includes(type) ? quantity : -quantity;

    await client.query(
        `UPDATE products SET stock = stock + $1 WHERE id = $2`,
        [delta, product_id]
    );

    return movementResult.rows[0];
}

module.exports = { registerMovement };
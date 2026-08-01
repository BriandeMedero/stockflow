import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";

function Sales() {

    const [sales, setSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState("");
    const [cart, setCart] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [selectedSale, setSelectedSale] = useState(null);

    useEffect(() => {
        loadSales();
        loadProducts();
    }, []);

    const loadSales = async () => {
        const response = await api.get("/sales");
        setSales(response.data);
    };

    const loadProducts = async () => {
        const response = await api.get("/products");
        setProducts(response.data);
    };

    const addToCart = () => {
        if (!selectedProduct || quantity <= 0) return;

        const product = products.find((p) => p.id === Number(selectedProduct));
        if (!product) return;

        setCart([
            ...cart,
            {
                product_id: product.id,
                name: product.name,
                sale_price: product.sale_price,
                quantity: Number(quantity)
            }
        ]);

        setSelectedProduct("");
        setQuantity(1);
    };

    const removeFromCart = (index) => {
        setCart(cart.filter((_, i) => i !== index));
    };

    const total = cart.reduce((sum, item) => sum + item.sale_price * item.quantity, 0);

    const submitSale = async () => {
        setError("");

        if (cart.length === 0) {
            setError("Agregá al menos un producto");
            return;
        }

        try {
            await api.post("/sales", {
                items: cart.map((item) => ({
                    product_id: item.product_id,
                    quantity: item.quantity
                }))
            });

            setCart([]);
            setShowForm(false);
            loadSales();
            loadProducts();

        } catch (err) {
            setError(err.response?.data?.error || "Error al registrar la venta");
        }
    };

    const viewSale = async (id) => {
        const response = await api.get(`/sales/${id}`);
        setSelectedSale(response.data);
    };

    return (
        <>
            <Navbar />

            <div className="container mt-5">

                <div className="d-flex justify-content-between">
                    <h1>Ventas</h1>
                    <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                        Nueva venta
                    </button>
                </div>

                {showForm && (
                    <div className="card mt-4">
                        <div className="card-body">

                            {error && <div className="alert alert-danger py-2">{error}</div>}

                            <div className="d-flex gap-2 mb-3">
                                <select
                                    className="form-control"
                                    value={selectedProduct}
                                    onChange={(e) => setSelectedProduct(e.target.value)}
                                >
                                    <option value="">Seleccionar producto</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} (stock: {p.stock}) — ${p.sale_price}
                                        </option>
                                    ))}
                                </select>

                                <input
                                    className="form-control"
                                    type="number"
                                    min="1"
                                    style={{ maxWidth: "100px" }}
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                />

                                <button className="btn btn-outline-primary" onClick={addToCart}>
                                    Agregar
                                </button>
                            </div>

                            {cart.length > 0 && (
                                <table className="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Cant.</th>
                                            <th>Subtotal</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cart.map((item, i) => (
                                            <tr key={i}>
                                                <td>{item.name}</td>
                                                <td>{item.quantity}</td>
                                                <td>${item.sale_price * item.quantity}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => removeFromCart(i)}
                                                    >
                                                        X
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            <p className="fw-bold">Total: ${total}</p>

                            <button className="btn btn-success" onClick={submitSale}>
                                Confirmar venta
                            </button>

                        </div>
                    </div>
                )}

                <table className="table table-striped mt-4">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Usuario</th>
                            <th>Total</th>
                            <th>Fecha</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map((sale) => (
                            <tr key={sale.id}>
                                <td>{sale.id}</td>
                                <td>{sale.user}</td>
                                <td>${sale.total}</td>
                                <td>{new Date(sale.created_at).toLocaleString()}</td>
                                <td>
                                    <button className="btn btn-sm btn-info" onClick={() => viewSale(sale.id)}>
                                        Ver detalle
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {selectedSale && (
                    <div className="card mt-3">
                        <div className="card-body">
                            <h5>Venta #{selectedSale.id}</h5>
                            <ul className="list-group mb-2">
                                {selectedSale.items.map((item, i) => (
                                    <li key={i} className="list-group-item d-flex justify-content-between">
                                        <span>{item.product} x{item.quantity}</span>
                                        <span>${item.subtotal}</span>
                                    </li>
                                ))}
                            </ul>
                            <button className="btn btn-sm btn-secondary" onClick={() => setSelectedSale(null)}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </>
    );
}

export default Sales;
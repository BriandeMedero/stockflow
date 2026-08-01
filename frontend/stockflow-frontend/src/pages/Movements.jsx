import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";

function Movements() {

    const [movements, setMovements] = useState([]);
    const [products, setProducts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        product_id: "",
        type: "PURCHASE",
        quantity: ""
    });

    useEffect(() => {
        loadMovements();
        loadProducts();
    }, []);

    const loadMovements = async () => {
        const response = await api.get("/movements");
        setMovements(response.data);
    };

    const loadProducts = async () => {
        const response = await api.get("/products");
        setProducts(response.data);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            await api.post("/movements", {
                product_id: Number(form.product_id),
                type: form.type,
                quantity: Number(form.quantity)
            });

            setForm({ product_id: "", type: "PURCHASE", quantity: "" });
            setShowForm(false);
            loadMovements();
            loadProducts(); // el stock cambió

        } catch (err) {
            setError(err.response?.data?.error || "Error al registrar movimiento");
        }
    };

    return (
        <>
            <Navbar />

            <div className="container mt-5">

                <div className="d-flex justify-content-between">
                    <h1>Movimientos</h1>
                    <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                        Nuevo movimiento
                    </button>
                </div>

                {showForm && (
                    <div className="card mt-4">
                        <div className="card-body">

                            {error && <div className="alert alert-danger py-2">{error}</div>}

                            <form onSubmit={handleSubmit}>

                                <select
                                    className="form-control mb-2"
                                    name="product_id"
                                    value={form.product_id}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Seleccionar producto</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} (stock: {p.stock})
                                        </option>
                                    ))}
                                </select>

                                <select
                                    className="form-control mb-2"
                                    name="type"
                                    value={form.type}
                                    onChange={handleChange}
                                >
                                    <option value="PURCHASE">Compra (ingreso)</option>
                                    <option value="RETURN">Devolución (ingreso)</option>
                                    <option value="ADJUSTMENT">Ajuste (egreso)</option>
                                    <option value="SALE">Venta (egreso)</option>
                                </select>

                                <input
                                    className="form-control mb-3"
                                    type="number"
                                    name="quantity"
                                    placeholder="Cantidad"
                                    min="1"
                                    value={form.quantity}
                                    onChange={handleChange}
                                    required
                                />

                                <button className="btn btn-success">Registrar</button>

                            </form>

                        </div>
                    </div>
                )}

                <table className="table table-striped mt-4">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Producto</th>
                            <th>Usuario</th>
                            <th>Tipo</th>
                            <th>Cantidad</th>
                            <th>Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        {movements.map((m) => (
                            <tr key={m.id}>
                                <td>{m.id}</td>
                                <td>{m.product}</td>
                                <td>{m.user}</td>
                                <td>{m.type}</td>
                                <td>{m.quantity}</td>
                                <td>{new Date(m.created_at).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>
        </>
    );
}

export default Movements;
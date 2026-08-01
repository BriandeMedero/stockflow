import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";

function Categories() {

    const [categories, setCategories] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [name, setName] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        const response = await api.get("/categories");
        setCategories(response.data);
    };

    const resetForm = () => {
        setEditingId(null);
        setName("");
        setShowForm(false);
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            if (editingId) {
                await api.put(`/categories/${editingId}`, { name });
            } else {
                await api.post("/categories", { name });
            }

            resetForm();
            loadCategories();

        } catch (err) {
            setError(err.response?.data?.error || "Error al guardar categoría");
        }
    };

    const editCategory = (category) => {
        setEditingId(category.id);
        setName(category.name);
        setShowForm(true);
    };

    const deleteCategory = async (id) => {
        if (!confirm("¿Eliminar categoría?")) return;

        try {
            await api.delete(`/categories/${id}`);
            loadCategories();
        } catch (err) {
            alert(err.response?.data?.error || "No se pudo eliminar la categoría");
        }
    };

    return (
        <>
            <Navbar />

            <div className="container mt-5">

                <div className="d-flex justify-content-between">
                    <h1>Categorías</h1>

                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            resetForm();
                            setShowForm(true);
                        }}
                    >
                        Nueva categoría
                    </button>
                </div>

                {showForm && (
                    <div className="card mt-4">
                        <div className="card-body">

                            {error && <div className="alert alert-danger py-2">{error}</div>}

                            <form onSubmit={handleSubmit} className="d-flex gap-2">
                                <input
                                    className="form-control"
                                    placeholder="Nombre de la categoría"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                                <button className="btn btn-success">Guardar</button>
                                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                                    Cancelar
                                </button>
                            </form>

                        </div>
                    </div>
                )}

                <table className="table table-striped mt-4">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <tr key={category.id}>
                                <td>{category.id}</td>
                                <td>{category.name}</td>
                                <td>
                                    <button
                                        className="btn btn-warning btn-sm me-2"
                                        onClick={() => editCategory(category)}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => deleteCategory(category.id)}
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>
        </>
    );
}

export default Categories;
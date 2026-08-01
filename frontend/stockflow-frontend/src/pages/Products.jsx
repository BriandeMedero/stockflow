import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { isAdmin } from "../utils/auth";

function Products() {

    const admin = isAdmin();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        name: "",
        description: "",
        purchase_price: "",
        sale_price: "",
        stock: "",
        category_id: ""
    });


    useEffect(() => {

        loadProducts();
        loadCategories();

    }, []);



    const loadProducts = async () => {

        const response = await api.get("/products");

        setProducts(response.data);

    };


    const loadCategories = async () => {

        const response = await api.get("/categories");

        setCategories(response.data);

    };

    const handleChange = (e) => {

    setForm({
        ...form,
        [e.target.name]: e.target.value
    });

};


const createProduct = async (e) => {

    e.preventDefault();
    setError("");

    try {

        if (editingId) {

            await api.put(
                `/products/${editingId}`,
                form
            );

        } else {

            await api.post(
                "/products",
                form
            );

        }


        setShowForm(false);
        setEditingId(null);


        setForm({
            name: "",
            description: "",
            purchase_price: "",
            sale_price: "",
            stock: "",
            category_id: ""
        });


        loadProducts();


    } catch (error) {

        setError(error.response?.data?.error || "Error guardando producto");

    }

};



const editProduct = (product) => {

    setEditingId(product.id);

    setForm({
        name: product.name,
        description: product.description || "",
        purchase_price: product.purchase_price,
        sale_price: product.sale_price,
        stock: product.stock,
        category_id: String(product.category_id)
    });

    setShowForm(true);

};

    

    const deleteProduct = async (id) => {
        if (!confirm("¿Eliminar producto?")) return;

        try {
            await api.delete(`/products/${id}`);
            loadProducts();
        } catch (error) {
            alert(error.response?.data?.error || "No se pudo eliminar el producto");
        }
    };



    return (

        <>

            <Navbar />


            <div className="container mt-5">


                <div className="d-flex justify-content-between">

                    <h1>
                        Productos
                    </h1>


                    {admin && (

                        <button
                            className="btn btn-primary"
                            onClick={() => {

                                setEditingId(null);

                                setForm({
                                    name: "",
                                    description: "",
                                    purchase_price: "",
                                    sale_price: "",
                                    stock: "",
                                    category_id: ""
                                });

                                setShowForm(!showForm);

                            }}
                        >
                            Nuevo producto
                        </button>

                    )}

                </div>



                {showForm && (

                    <div className="card mt-4">

                        <div className="card-body">

                            {error && (
                                <div className="alert alert-danger py-2">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={createProduct}>


                                <input
                                    className="form-control mb-2"
                                    name="name"
                                    placeholder="Nombre"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                />


                                <input
                                    className="form-control mb-2"
                                    name="description"
                                    placeholder="Descripción"
                                    value={form.description}
                                    onChange={handleChange}
                                />


                                <input
                                    className="form-control mb-2"
                                    name="purchase_price"
                                    type="number"
                                    placeholder="Precio compra"
                                    value={form.purchase_price}
                                    onChange={handleChange}
                                />


                                <input
                                    className="form-control mb-2"
                                    name="sale_price"
                                    type="number"
                                    placeholder="Precio venta"
                                    value={form.sale_price}
                                    onChange={handleChange}
                                />


                                <input
                                    className="form-control mb-2"
                                    name="stock"
                                    type="number"
                                    placeholder="Stock"
                                    value={form.stock}
                                    onChange={handleChange}
                                />


                                <select
                                    className="form-control mb-3"
                                    name="category_id"
                                    value={form.category_id}
                                    onChange={handleChange}
                                >

                                    <option value="">
                                        Seleccionar categoría
                                    </option>


                                    {categories.map(category => (

                                        <option
                                            key={category.id}
                                            value={String(category.id)}
                                        >
                                            {category.name}
                                        </option>

                                    ))}

                                </select>



                                <button
                                    className="btn btn-success"
                                >
                                    Guardar
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
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Categoría</th>
                            {admin && <th>Acciones</th>}
                        </tr>

                    </thead>


                    <tbody>


                        {products.map(product => (

                            <tr key={product.id}>

                                <td>{product.id}</td>

                                <td>{product.name}</td>

                                <td>${product.sale_price}</td>

                                <td>{product.stock}</td>

                                <td>{product.category}</td>

                                {admin && (

                                    <td>

                                        <button
                                            className="btn btn-warning btn-sm me-2"
                                            onClick={() => editProduct(product)}
                                        >
                                            Editar
                                        </button>


                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => deleteProduct(product.id)}
                                        >
                                            Eliminar
                                        </button>

                                    </td>

                                )}

                            </tr>

                        ))}


                    </tbody>


                </table>


            </div>


        </>

    );

}


export default Products;
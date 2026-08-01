import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

function Register() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await api.post("/auth/register", form);

            setSuccess(true);

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (err) {
            setError(err.response?.data?.error || "Error al registrar usuario");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>

            <div className="card shadow" style={{ width: "380px" }}>

                <div className="card-body">

                    <h3 className="text-center mb-4">Crear cuenta</h3>

                    {success && (
                        <div className="alert alert-success py-2">
                            Cuenta creada. Redirigiendo al login...
                        </div>
                    )}

                    {error && (
                        <div className="alert alert-danger py-2">
                            {error}
                        </div>
                    )}

                    {!success && (
                        <form onSubmit={handleSubmit}>

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
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />

                            <input
                                className="form-control mb-3"
                                type="password"
                                name="password"
                                placeholder="Contraseña (mín. 6 caracteres)"
                                value={form.password}
                                onChange={handleChange}
                                minLength={6}
                                required
                            />

                            <button
                                className="btn btn-primary w-100 mb-3"
                                disabled={loading}
                            >
                                {loading ? "Creando cuenta..." : "Registrarme"}
                            </button>

                        </form>
                    )}

                    <p className="text-center mb-0">
                        ¿Ya tenés cuenta? <Link to="/login">Iniciar sesión</Link>
                    </p>

                </div>

            </div>

        </div>
    );
}

export default Register;
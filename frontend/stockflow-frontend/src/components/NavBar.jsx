import { Link, useNavigate } from "react-router-dom";

function Navbar() {

    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("user")
    );


    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");

    };


    return (

        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">

            <div className="container">

                <Link 
                    className="navbar-brand"
                    to="/"
                >
                    StockFlow
                </Link>


                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>


                <div
                    className="collapse navbar-collapse"
                    id="navbarNav"
                >

                    <ul className="navbar-nav me-auto">

                        <li className="nav-item">
                            <Link 
                                className="nav-link"
                                to="/"
                            >
                                Dashboard
                            </Link>
                        </li>


                        <li className="nav-item">
                            <Link
                                className="nav-link"
                                to="/products"
                            >
                                Productos
                            </Link>
                        </li>


                        <li className="nav-item">
                            <Link
                                className="nav-link"
                                to="/categories"
                            >
                                Categorías
                            </Link>
                        </li>


                        <li className="nav-item">
                            <Link
                                className="nav-link"
                                to="/sales"
                            >
                                Ventas
                            </Link>
                        </li>


                        <li className="nav-item">
                            <Link
                                className="nav-link"
                                to="/movements"
                            >
                                Movimientos
                            </Link>
                        </li>

                    </ul>


                    <span className="text-white me-3">

                        {user?.name}

                    </span>


                    <button
                        className="btn btn-outline-light"
                        onClick={logout}
                    >
                        Cerrar sesión
                    </button>


                </div>

            </div>

        </nav>

    );

}

export default Navbar;
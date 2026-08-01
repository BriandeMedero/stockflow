import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";

function Dashboard() {

    const [stats, setStats] = useState({
        totalProducts: 0,
        lowStock: 0,
        totalSales: 0,
        totalRevenue: 0
    });

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        const [productsRes, salesRes] = await Promise.all([
            api.get("/products"),
            api.get("/sales")
        ]);

        const products = productsRes.data;
        const sales = salesRes.data;

        setStats({
            totalProducts: products.length,
            lowStock: products.filter((p) => p.stock <= 5).length,
            totalSales: sales.length,
            totalRevenue: sales.reduce((sum, s) => sum + Number(s.total), 0)
        });
    };

    return (
        <>
            <Navbar />

            <div className="container mt-5">
                <h1>Dashboard StockFlow</h1>
                <p>Resumen general del sistema.</p>

                <div className="row mt-4">
                    <div className="col-md-3">
                        <div className="card shadow">
                            <div className="card-body">
                                <h5>Productos</h5>
                                <p className="fs-4">{stats.totalProducts}</p>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="card shadow border-warning">
                            <div className="card-body">
                                <h5>Stock bajo (≤5)</h5>
                                <p className="fs-4 text-warning">{stats.lowStock}</p>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="card shadow">
                            <div className="card-body">
                                <h5>Ventas totales</h5>
                                <p className="fs-4">{stats.totalSales}</p>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="card shadow border-success">
                            <div className="card-body">
                                <h5>Ingresos totales</h5>
                                <p className="fs-4 text-success">${stats.totalRevenue}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Dashboard;
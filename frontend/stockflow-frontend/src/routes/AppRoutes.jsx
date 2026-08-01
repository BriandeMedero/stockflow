import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import ProtectedRoute from "../components/ProtectedRoute";
import Products from "../pages/Products";
import Categories from "../pages/Categories";
import Sales from "../pages/Sales";
import Movements from "../pages/Movements";
import Register from "../pages/Register";

function AppRoutes() {

    return (

        <Routes>

            <Route 
                path="/login" 
                element={<Login />} 
            />

            <Route
                path="/register"
                element={<Register />}
            />

            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            <Route 
                path="/products" 
                element={
                    <ProtectedRoute>
                        <Products />
                    </ProtectedRoute>
                }
            />

            <Route 
                path="/categories" 
                element={
                    <ProtectedRoute>
                        <Categories />
                    </ProtectedRoute>
                }
            />

            <Route 
                path="/sales" 
                element={
                    <ProtectedRoute>
                        <Sales />
                    </ProtectedRoute>
                }
            />

            <Route 
                path="/movements" 
                element={
                    <ProtectedRoute>
                        <Movements />
                    </ProtectedRoute>
                }
            />

                    </Routes>

                );

            }

export default AppRoutes;
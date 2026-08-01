const express = require("express");
const cors = require("cors");

const productsRoutes = require("./routes/products");
const categoriesRoutes = require("./routes/categories");
const authRoutes = require("./routes/auth");
const movementsRoutes = require("./routes/movements");
const salesRoutes = require("./routes/sales");
const { swaggerUi, swaggerSpec } = require("./config/swagger");

const app = express();

app.use(cors());
app.use(express.json());

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

app.use("/api/products", productsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/movements", movementsRoutes);
app.use("/api/sales", salesRoutes);

module.exports = app;
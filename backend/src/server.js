require("dotenv").config();

const pool = require("./db");
const app = require("./app");

const PORT = process.env.PORT || 3000;

async function startServer() {

    try {

        await pool.query("SELECT NOW()");

        console.log("PostgreSQL conectado");

        app.listen(PORT, () => {
            console.log(`Servidor iniciado en http://localhost:${PORT}`);
        });

    } catch (error) {

        console.error("Error conectando a PostgreSQL:", error);
        process.exit(1);

    }

}

startServer();
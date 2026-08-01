const jwt = require("jsonwebtoken");


const verifyToken = (req, res, next) => {

    const authHeader = req.headers.authorization;


    if (!authHeader) {
        return res.status(401).json({
            error: "Token requerido"
        });
    }


    const parts = authHeader.split(" ");


    if (parts.length !== 2 || parts[0] !== "Bearer") {

        return res.status(401).json({
            error: "Formato de token inválido"
        });

    }


    const token = parts[1];


    if (!process.env.JWT_SECRET) {

        return res.status(500).json({
            error: "JWT_SECRET no configurado"
        });

    }


    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );


        req.user = decoded;


        next();


    } catch (error) {

        return res.status(401).json({
            error: "Token inválido"
        });

    }
};


module.exports = verifyToken;
const verifyAdmin = (req, res, next) => {

    if (!req.user) {
        return res.status(401).json({
            error: "Usuario no autenticado"
        });
    }


    if (req.user.role !== "ADMIN") {
        return res.status(403).json({
            error: "Acceso denegado. Se requieren permisos de administrador"
        });
    }


    next();
};


module.exports = verifyAdmin;
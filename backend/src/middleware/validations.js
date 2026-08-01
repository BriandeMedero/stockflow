const { body, validationResult } = require("express-validator");


const validate = (req, res, next) => {

    const errors = validationResult(req);


    if (!errors.isEmpty()) {

        return res.status(400).json({
            errors: errors.array()
        });

    }


    next();
};



const productValidation = [

    body("name")
        .notEmpty()
        .withMessage("El nombre es obligatorio")
        .isLength({ min: 3 })
        .withMessage("El nombre debe tener al menos 3 caracteres"),


    body("purchase_price")
        .isFloat({ min: 0 })
        .withMessage("El precio de compra debe ser positivo"),


    body("sale_price")
        .isFloat({ min: 0 })
        .withMessage("El precio de venta debe ser positivo"),


    body("stock")
        .isInt({ min: 0 })
        .withMessage("El stock debe ser un número entero positivo"),


    body("category_id")
        .isInt()
        .withMessage("La categoría es inválida")

];


module.exports = {
    validate,
    productValidation
};
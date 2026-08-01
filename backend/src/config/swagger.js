const swaggerJsdoc = require("swagger-jsdoc");

const swaggerUi = require("swagger-ui-express");


const options = {

    definition: {
        openapi: "3.0.0",

        info: {
            title: "StockFlow API",
            version: "1.0.0",
            description: "API de sistema de gestión de stock"
        },

components: {

    securitySchemes: {

        bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT"
        }

    },


    schemas: {

        Product: {

            type: "object",

            properties: {

                id: {
                    type: "integer",
                    example: 1
                },

                name: {
                    type: "string",
                    example: "Teclado Logitech K380"
                },

                description: {
                    type: "string",
                    example: "Teclado inalámbrico"
                },

                purchase_price: {
                    type: "number",
                    example: 20000
                },

                sale_price: {
                    type: "number",
                    example: 30000
                },

                stock: {
                    type: "integer",
                    example: 15
                },

                category: {
                    type: "string",
                    example: "Periféricos"
                }

            }

        },


        User: {

            type: "object",

            properties: {

                id: {
                    type: "integer",
                    example: 1
                },

                name: {
                    type: "string",
                    example: "Usuario Prueba"
                },

                email: {
                    type: "string",
                    example: "usuario@test.com"
                },

                role: {
                    type: "string",
                    example: "USER"
                }

            }

        },


        Movement: {

            type: "object",

            properties: {

                id: {
                    type: "integer",
                    example: 1
                },

                product: {
                    type: "string",
                    example: "Teclado Logitech K380"
                },

                user: {
                    type: "string",
                    example: "Usuario Prueba"
                },

                type: {
                    type: "string",
                    example: "SALE"
                },

                quantity: {
                    type: "integer",
                    example: 2
                }

            }

        },


        Sale: {

            type: "object",

            properties: {

                id: {
                    type: "integer",
                    example: 1
                },

                user: {
                    type: "string",
                    example: "Usuario Prueba"
                },

                total: {
                    type: "number",
                    example: 60000
                },

                created_at: {
                    type: "string",
                    example: "2026-07-27T12:00:00"
                }

            }

        }

    }
},

        servers: [
            {
                url: "http://localhost:3000/api"
            }
        ]
    },

    security: [
    {
        bearerAuth: []
    }
    ],

    apis: [
    "./src/routes/*.js"

]
};


const swaggerSpec = swaggerJsdoc(options);


module.exports = {
    swaggerUi,
    swaggerSpec
};
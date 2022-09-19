const { Router } = require("express");
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');
const genreRoute = require("./genres");
const videoRoute = require("./videogames");

const router = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);

router.use("/genres", genreRoute);
router.use("/videogames", videoRoute);

module.exports = router;

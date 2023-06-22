var express = require('express');
var router = express.Router();
const { body, validationResult } = require('express-validator');
const RolController = require('../controls/RolController');
var rolController = new RolController();
const PersonaController = require('../controls/PersonaController');
var personaController = new PersonaController();
const MarcaController = require('../controls/MarcaController');
var marcaController = new MarcaController();
const AutoController = require('../controls/AutoController');
var autoController = new AutoController();
const DetalleFacturaController = require('../controls/DetalleFacturaController');
var detalleFacturaController = new DetalleFacturaController();
const FacturaController = require('../controls/FacturaController');
var facturaController = new FacturaController();
const CuentaController = require('../controls/CuentaController');
var cuentaController = new CuentaController();
let jwt = require('jsonwebtoken');

//Middleware

var auth = function middleware(req, res, next) {
  const token = req.headers['x-api-token'];
  if (token) {
    require('dotenv').config();
    const llave = process.env.KEY;
    jwt.verify(token, llave, async (err, decoded) => {
      if (err) {
        res.status(401);
        res.json({
          msg: "TOKEN NO VALIDO",
          code: 401
        });
      } else {
        var models = require('../models');
        var cuenta = models.cuenta;
        req.decoded = decoded;
        let aux = await cuenta.findOne({ where: { external_id: req.decoded.external } })
        if (aux === null) {
          res.status(401);
          res.json({
            msg: "TOKEN NO VALIDO O EXPIRADO",
            code: 401
          });
        } else {
          next();
        }
      }
    });
  } else {
    res.status(401);
    res.json({
      msg: "NO EXISTE TOKEN",
      code: 401
    });
  }

}
/* GET users listing. */
router.get('/', function (req, res, next) {
  res.json({ "version": "1.0", "name": "auto" });
});

//CUENTA
router.post('/sesion', [
  body('usuario', 'Ingrese un usuario').trim().exists().not().isEmpty().isEmail(),
  body('clave', 'Ingrese una clave').trim().exists().not().isEmpty(),
], cuentaController.sesion);

//GET
//------Personas
router.get('/roles', rolController.listar);
router.get('/personas', auth, personaController.listar);
router.get('/personas/obtener/:external', personaController.obtener);

//------Marcas
router.get('/marcas/obtener/:external', marcaController.obtener);
router.get('/marcas/listar', auth, marcaController.listar);

//------Autos
router.get('/autos/obtener/:external', auth, autoController.obtener);
router.get('/autos/listar', auth, autoController.listar);
router.get('/autos/listar/disponibles', auth, autoController.listarAutosDisponibles);
router.get('/autos/listar/vendidos', auth, autoController.listarAutosVendidos);
//.........Cantidad
router.get('/autos/cantidadautos',auth, autoController.cantAutoVendidos);
router.get('/autos/cantidadautosdisp',auth, autoController.cantAutoDisponibles);
router.get('/marcas/cantidadmarcas',auth, marcaController.cantidadMarcas);

//------Detalle Factura
router.get('/detalle/obtener/:external', auth, detalleFacturaController.obtener);
router.get('/detalle/listar', detalleFacturaController.listar);

//------Factura
router.get('/factura/obtener/:external', facturaController.obtener);
router.get('/factura/listar', facturaController.listar);

//POST
//------Personas
router.post('/personas/guardar', [
  body('apellidos', 'Ingrese sus apellidos').trim().exists().not().isEmpty().isLength({ min: 3, max: 50 }).withMessage("Ingrese un valor mayor o igual a 3 y menor a 50"),
  body('nombres', 'Ingrese sus nombres').trim().exists().not().isEmpty().isLength({ min: 3, max: 50 }).withMessage("Ingrese un valor mayor o igual a 3 y menor a 50"),
], personaController.guardar);
router.post('/personas/modificar', personaController.modificar);

//------Marcas
router.post('/marcas/guardar', marcaController.guardar);
router.post('/marcas/modificar', marcaController.modificar);

//------Autos
router.post('/autos/guardar', [
  body('modelo', 'Ingrese un modelo').trim().exists().not().isEmpty(),
  body('color', 'Ingrese un color').trim().exists().not().isEmpty(),
  body('kilometraje', 'Ingrese un kilometraje').trim().exists().not().isEmpty(),
  body('anioFabricacion', 'Ingrese un año').trim().exists().not().isEmpty(),
  body('placa', 'Ingrese una placa').trim().exists().not().isEmpty(),
  body('precio', 'Ingrese un precio').trim().exists().not().isEmpty(),
], auth, autoController.guardar);
router.post('/autos/modificar', auth, autoController.modificar);

//------Detalle Factura
router.post('/detalle/guardar', detalleFacturaController.guardar);
router.post('/detalle/modificar', detalleFacturaController.modificar);

//------Factura
router.post('/factura/generar', facturaController.generar);
router.post('/factura/generar/calcularValores', facturaController.calcularValores);



/*router.get('/sumar/:a/:b', function (req, res, next) {
  var a = Number(req.params.a);
  var b = Number(req.params.b);
  var c = a + b;
  res.status(200);
  res.json({ "msg": "OK", "resp": c });
});

router.post('/sumar', function (req, res, next) {
  var a = Number(req.body.a);
  var b = Number(req.body.b);
  if (isNaN(a) || isNaN(b)) {
    res.status(400);
    res.json({ "msg": "FALTAN DATOS"});
  }
  var c = a + b;
  res.status(200);
  res.json({ "msg": "OK", "resp": c });

});*/

module.exports = router;

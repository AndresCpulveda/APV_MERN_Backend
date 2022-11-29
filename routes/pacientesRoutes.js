import express from 'express' //Importamos express para usar su metodo Router
import { 
  agregarPaciente,
  obtenerPacientes,
  obtenerPaciente,
  actualizarPaciente,
  eliminarPaciente 
} from '../controllers/pacientesController.js'; //Importamos todas las funciones del controlador de pacientes
import checkAuth from '../middleware/authMiddleware.js'; //Importamos la funcion que autentica el token activo del usuario

const routerPacientes = express.Router(); //Se genera un router para los pacientes


routerPacientes.route("/").post(checkAuth, agregarPaciente).get(checkAuth, obtenerPacientes) //En esta ruta se agregaran y obtendran pacientes del veterinario que este accediendo
routerPacientes.route("/:id").get(checkAuth, obtenerPaciente).put(checkAuth, actualizarPaciente).delete(checkAuth, eliminarPaciente) //En esta ruta se obtendran, actualizarán y eliminarán pacientes del veterinario que esta accediendo

export default routerPacientes //Exportamos el router que sera usado en el index de la app


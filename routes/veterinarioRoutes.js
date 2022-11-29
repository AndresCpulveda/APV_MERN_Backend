import express from "express";
import { registrar, perfil, confirmar, autenticar, olvidePassword, comprobarToken, nuevoPassword, actualizarPerfil, actualizarPassword} from "../controllers/veterinarioController.js";
import checkAuth from "../middleware/authMiddleware.js";

const routerVeterinarios = express.Router(); //Guarda en una variable el metodo de router de express que usaremos para la ruta de api/veterinarios

//Area publica
routerVeterinarios.post("/", registrar) //Ruta de la pagina inicial
routerVeterinarios.get("/confirmar/:token", confirmar) //Ruta para confirmacion de usuario via token, el token se pasa como parametro dinamicamente mediante la url
routerVeterinarios.post("/login", autenticar)//Ruta para autenticar el usuario via correo, password y confirmado
routerVeterinarios.post("/olvide-password", olvidePassword) //Ruta para enviar info necesaria para reestablecer contraseña, con esto se le enviará un token de reestablecimiento
routerVeterinarios.route("/olvide-password/:token").get(comprobarToken).post(nuevoPassword)//Ruta para pagina de reestablecimiento que comprueba token y envia nueva contraseña

//Area privada
routerVeterinarios.get("/perfil", checkAuth, perfil) //Ruta de la pagina perfil
routerVeterinarios.put("/perfil/:id", checkAuth, actualizarPerfil) //Ruta para editar el perfil
routerVeterinarios.put("/perfil/cambiar-password/:id", checkAuth, actualizarPassword) //Ruta para cambiar el password

export default routerVeterinarios;
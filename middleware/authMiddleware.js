import jwt from "jsonwebtoken"; //Importamos la dependcia de json web token para poder verificarlo
import Veterinario from "../models/veterinario.js"; //Importamos el modelo para consultar el veterinario en la DB

const checkAuth = async (req, res, next) => { //Middleware que revisa que el jwt enviado como authorization sea valido
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) { //Se valida el authorization presente en los headers y si empieza por 'Bearer'
    try {
      token = req.headers.authorization.split(' ')[1] //Se separa la segunda parte despues del espacio ' ' el metodo split separa ambas partes en un array, tomamos la segunda parte, presente en la posicion 1 del array
      const decoded =  jwt.verify(token, process.env.JWT_SECRET) //Usamos el metodo verify de jwt y le pasamos el token y nuestra secret key
      req.veterinario = await Veterinario.findById(decoded.id).select('-password -token -confirmado') //Se trae el veterinario que contenga el id decodificado del token, se omiten los valores de password, token y confirmado en el objeto traido
      return next()
    } catch (error) {
      const e = new Error("token no valido") //Se muestra un error en caso de que el token no sea valido
      return res.status(403).json({msg: e.message}) //Se retorna la respuesta del servidor, el return permite salir de la funcion y que no se ejecute el siguiente middleware y asi el servidor no envie 2 respuestas a la misma peticion   
    }
  }

  if(!token) { //Si el token no se encuentra se muestra un mensaje de error
    const error = new Error("token no valido o inexistente")
    return res.status(403).json({msg: error.message})
  }

  next(); //Se pasa al siguiente middleware en la ruta
}

export default checkAuth
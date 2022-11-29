import jwt from "jsonwebtoken" //Se importa dependencia de json web token

const generarJWT = (id) => { //Genera un jwt mediante el metodo sign() de la dependencia, recibe el objeto que se incluirá en el token, la llave secreta guardada en las variables de entorno y otro objeto con configuraciones como 'tiempo de expiracion'
  return jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn: "5d",
  });
}

export default generarJWT
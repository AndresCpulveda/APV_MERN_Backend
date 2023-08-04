import express from "express"; //Importamos la instancia de express 
import dotenv from "dotenv/config" //Importamos esta dependencia añadiendo el "/config" para poder acceder a las variables de entorno en el archivo .env
import conectarDB from "./config/db.js"; //Importamos la funcion que conecta la app con la DB
import routerVeterinario from './routes/veterinarioRoutes.js' //Importamos el router de veterinarios
import routerPacientes from './routes/pacientesRoutes.js' //Importamos el router de pacientes
import cors from "cors";

const app = express(); //En una variable llamamos el metodo de express
app.use(express.json()) //Permite decirle a express que vamos a enviar y recibir informacio de tipo json mediante el servidor
conectarDB(); //Ejecutamos la funcion para conectar la DB

const dominiosPermitidos = [process.env.FRONTEND_URL]
//Creamos una autorizacion de cors para interactuar entre en fronend desde una ip y el backend desde un ip diferente (ver vid 465)
const corsOptions = {
  origin: function (origin, callback) {
    if(dominiosPermitidos.indexOf(origin) !== -1) {
      //El origen del request esta permitido
      callback(null, true)
    }else {
      callback(new Error('No permitido por CORS'))
    }
  }
}

// app.use(cors(corsOptions))////Permite que la app use los metodos http en cors
app.use(cors())////Permite que la app use los metodos http en cors

app.use("/api/veterinarios", routerVeterinario) //Permite que la app use los metodos http en la direccion /api/veterinarios y su router esta definido como routerVeterinario
app.use("/api/pacientes", routerPacientes) //Permite que la app use los metodos http en la direccion /api/pacientes y su router esta definido como routerVeterinario

const port = process.env.PORT || 4000 //Define que el port, es el declarado como variable de entorno 'PORT' o, si no esta declarada, el port es igual a 4000

app.listen(port, () => { //Le pedimoa a express que ejecute la app en el puerto 4000
  console.log(`servidor funcionando en el puerto ${port}`);
})
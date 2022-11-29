import mongoose from "mongoose"; //Importamos dependencia mongoose para poder crear una conexion con nuestra base de datos en mongo DB
import bcrypt from 'bcrypt' //Importamos dependencia bcrypt para hashear y comprarar passwords
import generarId from "../helpers/generarId.js"; //Importamos la funcion de generar id

const veterinarioSchema = mongoose.Schema({ //Creamos el schema de lo que será nuestra tabla de datos en mongo DB, especificamos las propiedades y su tipo de dato, junto con demas especificaciones que requiramos 
  nombre: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  telefono: {
    type: String,
    default: null,
    trim: true,
  },
  web: {
    type: String,
    default: null,
  },
  token: {
    type: String,
    default: generarId(), //Generamos un token unico para la confirmación
  },
  confirmado: {
    type: Boolean,
    default: false,
  },
})

veterinarioSchema.pre('save', async function(next) { //Siempre antes de usar el metodo save se revisa si el dato de password ha sido modificado y se hashea
  if(!this.isModified('password')) {
    next()
  }
  const salt = await bcrypt.genSalt(10); //Antes de hashear una contraseña, aplicamos una salt. Un salt es una cadena aleatoria que hace que el hash sea impredecible.
  this.password = await bcrypt.hash(this.password, salt) //Se toma el password existente y se hashea usando el metodo hash() y la salt previamente generada
})

veterinarioSchema.methods.comprobarPassword = async function(passwordFormulario) { //Creamos un nuevo metodo en el schema que va a comprobar la password dada con la guardada usando el metodo compare() de bcrypt
  return await bcrypt.compare(passwordFormulario, this.password) //Retorna un boolean segun la comparacion de bcrypt
}

const Veterinario = mongoose.model('Veterinario', veterinarioSchema) //Genera el model del schema en mongoose para conectarlo con mongo DB y poder guardar y consultar datos

export default Veterinario;
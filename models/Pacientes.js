import mongoose from "mongoose" //Se importa la dependencia de mongoose para poder conectar con la DB de mongoDB

const pacienteSchema = mongoose.Schema({ //Se crea el schema de nuestra tabla con las columnas que se incluirán y las características de cada una
  nombre: {
    type: String,
    required: true,
    trim: true,  
  },
  propietario: {
    type: String,
    required: true,
    trim: true,  
  },
  email: {
    type: String,
    required: true,
    trim: true,  
  },
  fecha: {
    type: Date,
    required: true,  
    default: Date.now(), //Por defecto y para facilidad se establece como default la hora actual
  },
  sintomas: {
    type: String,
    required: true,  
  },
  veterinario: {
    type: mongoose.Schema.Types.ObjectId, //Esta propiedad tiene como tipo el id de otra propiedad presente en el modelo de Veterinario
    ref: "Veterinario", //Referencia del modelo que contiene la propiedad con el id que usaremos para esta propiedad
  }
}, {
  timestamps: true, //Esta propiedad permite que mongoose añada 2 propiedades a nuestro schema: "createdAt" y "updatedAt"
})

const Paciente = mongoose.model('Paciente', pacienteSchema) //Creamos el modelo usando el schema y el nombre que el modelo tendrá

export default Paciente
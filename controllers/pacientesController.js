import Paciente from "../models/Pacientes.js"; //Importamos el modelo de nuestra tabla de datos de pacientes, para poder consultarla y modificarla

const agregarPaciente = async (req, res) => { //Permite que un veterinario autenticado agregue un paciente
  //Requiere: JWT del veterinario mediante authorization y objeto JSON del paciente mediante body

  const paciente = new Paciente(req.body) //Guarda en una variable el objeto del paciente enviado por req.body
  try {
    paciente.veterinario = req.veterinario._id //Agrega manualmente la propiedad de veterinario al paciente (esta se obtiene de la autenticacion previa)
    const pacienteGuardado = await paciente.save() //Se guarda el paciente en la DB
    return res.json(pacienteGuardado) //Se retorna el paciente guardado
  } catch (error) {
    console.log(error);
  }
}

const obtenerPacientes = async (req, res) => { //Trae todos los pacientes asociados a un veterinario
  //Requiere: JWT del veterinario mediante authorization
  const pacientes = await Paciente.find().where('veterinario').equals(req.veterinario) //Obtiene a todos los pacientes cuyo veterinario coincida con el veterinario del req (el veterinario autenticado)
  res.json(pacientes)
}

const obtenerPaciente = async (req, res) => { //Trae un paciente especifico asociado a un veterinario
  //Requiere: JWT del veterinario mediante authorization y id del paciente mediante parametro en url

  const {id} = req.params; //Extrae la propiedad de id presente en los parametros de la url
  const paciente = await Paciente.findById(id) //Obtiene el paciente cuyo id corresponde al pasado en los parametros
  if(!paciente) { //Si no se encuentra el paciente, se devuelve un estado y mensaje de error
    return res.status(404).json({msg: "No se encontro el paciente"})
  }
  if(paciente.veterinario._id.toString() !== req.veterinario._id.toString()) { //Se valida si el id de la propiedad veterinario en el paciente, NO corresponde con el id del veterinario que esta autenticado (el id debe pasarse a string para que se pueda comparar correctamente, de lo contrario siempre retornará false)
    const error = new Error('Accion no valida') //Si no corresponde se muestra un estado y mensaje de error
    return res.status(404).json({msg: error.message})
  }
  res.json(paciente) //Si pasa las validaciones se responde con el paciente encontrado
}

const actualizarPaciente = async (req, res) => {
  //Requiere: JWT del veterinario mediante authorization, id del paciente mediante parametro url y objeto JSON del paciente mediante body

  const {id} = req.params; //Extrae la propiedad de id presente en los parametros de la url
  const paciente = await Paciente.findById(id) //Obtiene el paciente cuyo id corresponde al pasado en los parametros
  if(!paciente) { //Si no se encuentra el paciente, se devuelve un estado y mensaje de error
    return res.status(404).json({msg: "No se encontro el paciente"})
  }
  if(paciente.veterinario._id.toString() !== req.veterinario._id.toString()) { //Se valida si el id de la propiedad veterinario en el paciente, NO corresponde con el id del veterinario que esta autenticado (el id debe pasarse a string para que se pueda comparar correctamente, de lo contrario siempre retornará false)
    const error = new Error('Accion no valida') //Si no corresponde se muestra un estado y mensaje de error
    return res.status(404).json({msg: error.message})
  }
  //Actualizar paciente
  //Se actualizan todas las propiedades del objeto que son actulizable por el usuario
  //Se usa short circuit para re asignar una propiedad si esta se encuentra en el body, Ó si esta no se encuentra entonces se re asigna al mismo valor actual
  paciente.nombre = req.body.nombre || paciente.nombre;
  paciente.propietario = req.body.propietario || paciente.propietario;
  paciente.email = req.body.email || paciente.email;
  paciente.fecha = req.body.fecha || paciente.fecha;
  paciente.sintomas = req.body.sintomas || paciente.sintomas;

  try {
    const pacienteActualizado = await paciente.save() //Una vez actualizados todos los campos, se salva el objeto en la base de datos
    res.json(pacienteActualizado) //Se responde con el objeto que fue actualizado
  } catch (error) {
    console.log(error);
  }
  
}

const eliminarPaciente = async (req, res) => {
  //Requiere: JWT del veterinario mediante authorization y id del paciente mediante parametro en url

  const {id} = req.params; //Extrae la propiedad de id presente en los parametros de la url
  const paciente = await Paciente.findById(id) //Obtiene el paciente cuyo id corresponde al pasado en los parametros
  if(!paciente) { //Si no se encuentra el paciente, se devuelve un estado y mensaje de error
    return res.status(404).json({msg: "No se encontro el paciente"})
  }
  if(paciente.veterinario._id.toString() !== req.veterinario._id.toString()) { //Se valida si el id de la propiedad veterinario en el paciente, NO corresponde con el id del veterinario que esta autenticado (el id debe pasarse a string para que se pueda comparar correctamente, de lo contrario siempre retornará false)
    const error = new Error('Accion no valida') //Si no corresponde se muestra un estado y mensaje de error
    return res.status(404).json({msg: error.message})
  }

  try {
    await paciente.deleteOne() //Elimina el paciente despues de haber pasado las validaciones
    res.json({msg: "Paciente eliminado"}) //Se responde un mensaje de paciente eliminado
  } catch (error) {
    console.log(error);
  }
}

export {agregarPaciente, obtenerPacientes, obtenerPaciente, actualizarPaciente, eliminarPaciente}; //Se exportan todas las funciones de controlado que se ejecutrán en las routes
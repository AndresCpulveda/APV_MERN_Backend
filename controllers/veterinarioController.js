import Veterinario from "../models/Veterinario.js"; //Importamos el modelo de la DB de veterinarios
import generarJWT from "../helpers/generarJWT.js"; //Importamos la funcion generadora del json web token
import generarId from "../helpers/generarId.js"; //Importamos la funcion generadora del id
import emailRegistro from "../helpers/emailRegistro.js";//Importamos la funcion que envia el email para confirmar la cuenta
import emailOlvidePassword from "../helpers/emailOlvidePassword.js";//Importamos la funcion que envia el email para restablecer el password

const registrar = async (req, res) => { //Registra un nuevo veterinario y previene los duplicados
  //Requiere: objeto JSON del paciente mediante body

  const {email, nombre} = req.body;
  //Prevenir usuario duplicado
  const existeUsuario = await Veterinario.findOne({email}) //Hace una consulta a la base de datos del veterinario con el email dado
  if(existeUsuario) {//Si el usuario consultado existe entonces no se puede duplicar de nuevo 
    const error = new Error('Usuario ya registrado') //Se guarda el error como un new Error y un mensaje que se guardará como objeto
    return res.status(400).json({msg: error.message}); //Retorna un error indicado (400) y un json con el mensaje de la variable de error
  }
  try {
    //Guardar un nuevo veterinario
    const veterinario = new Veterinario(req.body) //Se crea una variable como una instancia del modelo Veterinario pasandole el objeto existente en el request body
    const veterinarioGuardado = await veterinario.save() //Se agrega la instancia a la base de datos mediante el metodo .save()

    //Enviar Correo
    emailRegistro({//Llamamos la funcion emailRegistro y le pasamos los datos como parametros en un objeto
      nombre,
      email,
      token: veterinarioGuardado.token,
    })

    res.json(veterinarioGuardado)//Al agregar con exito se muestra como respuesta json el objeto guardado
  } catch (error) {
    console.log(error);
  }

}

const perfil = (req, res) => { 
  const {veterinario} = req;
  res.json(veterinario)
}

const confirmar = async (req, res) => { //Confirma al ususario nuevo mediante token unico que se enviaría a su correo, este se obtiene de la url de la pagina
  //Requiere: Token de confirmacion mediante parametro en la url
  
  const {token} = req.params; //Se extrae la variable token de los parametros de la request en la url

  const usuarioConfirmar = await Veterinario.findOne({token}) //Se consulta el usuario en la base de datos a partir del token proporcionado

  if(!usuarioConfirmar) { //Si el usuario consultado no existe entonces el token ingresado no es valido
    const error = new Error('Enlace de confirmación no valido')
    return res.status(404).json({msg: error.message})
  }

  try { //Si el usuario consultado existe, se actualizan su información en la base de datos (borramos el token e indicamos que esa confirmado)
    usuarioConfirmar.token = null;
    usuarioConfirmar.confirmado = true;
    await usuarioConfirmar.save() //Se guarda en la base de datos el objeto modificado
    res.json({msg: 'Usuario confirmado correctamente'}) //Mensaje json de respuesta
  } catch (error) {
    console.log(error);  
  }
}

const autenticar = async (req, res) => { //Realiza la autenticación de usuario con email, si esta confirmado y la contraseña
  //Requiere: Objeto JSON de las credenciales del usuario mediante body

  const {email, password} = req.body; //Obtiene los datos de email del body del request
  //Comprobar si el usuario existe
  const usuario = await Veterinario.findOne({email}) //Consulta el usuario en la base de datos mediante el email y guarda el usuario encontrado en una variable
  if(!usuario) { //Si no se encontro usuario en la consulta se retorna un error (404) con mensaje
    const error = new Error('Usuario no existe')
    return res.status(404).json({msg: error.message})
  }
  
  //Comprobar si el usuario esta confirmado, si no esta retorna error (404) con mensaje
  if(!usuario.confirmado) {
    const error = new Error('Usuario no confirmado')
    return res.status(404).json({msg: error.message})
  }
  
  //Autenticar al usuario
  //Revisar el password
  if(await usuario.comprobarPassword(password)) {//Se comprueba la contraseña mediante funcion importada
    //Autenticar
    res.json({ //Se genera un json web token con el id del usuario autenticado y se envia como respuesta
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      token: generarJWT(usuario.id),
    }) 
  } else {
    const error = new Error('Contraseña incorrecta') //Si no autentica la contraseña se retorna respuesta de error (404) con mensaje
    return res.status(404).json({msg: error.message})
  }

}

const olvidePassword = async (req, res) => { //Recibe el email del usuario y comprueba que este exista para enviarle un enlace de reestablecimiento
  //Requiere: Objeto JSON del correo del usuario mediante body

  const {email} = req.body //Se obtiene el email de el req.body
  const confirmarUsuario = await Veterinario.findOne({email}) //Consulta el veterinario en la DB usando el email

  if(!confirmarUsuario) { //Si la consulta no retorna un veterinario se muestra un estado y mensaje de error
    const error = new Error('El usuario no existe')
    return res.status(400).json({msg: error.message})
  } 
  try {
    confirmarUsuario.token = generarId(); //Asigna un token al usuario mediante la funcion de generarId
    await confirmarUsuario.save() //Se guarda el usuario en la DB

    //Enviar email con instrucciones
    emailOlvidePassword({
      email,
      nombre: confirmarUsuario.nombre,
      token: confirmarUsuario.token,
    })

    res.json({msg: "Te hemos enviado un email con instrucciones"}) //Se responde un mensaje de confirmación
  } catch (error) {
    console.log(error);
  }
}

const comprobarToken = async (req, res) => { //Recibe un token en la url y comprueba que sea valido en la DB
  //Requiere: Token de confirmacion mediante parametro en la url

  const {token} = req.params; //Extrae el token de req.params
  const usuarioPorToken = await Veterinario.findOne({token}) //Se busca el veterinario que tenga el token ingresado
  if(!usuarioPorToken) { //Si no se encuentra el veterinario se responde un estado y mensaje de error
    const error = new Error('El enlace no existe o ha expirado')
    return res.status(404).json({msg: error.message})
  }
  res.json({msg: "token valid"}) //Si se pasan todas las validaciones se responde un mensaje
}

const nuevoPassword = async (req, res) => { //Recibe la nueva password del usuario y comprueba la validez del token 
  //Requiere: Token de confirmacion mediante parametro en la url y objeto JSON de la nueva contraseña del usuario mediante body

  const {token} = req.params; //Se extrae el token de los req.params
  const {password} = req.body;//Se extrae la contraseña del req.body
  const usuarioACambiar = await Veterinario.findOne({token}) //Se obtiene el usuario que contenga el token dado

  if(!usuarioACambiar) { //Si no se encuentra el veterinario se responde un estado y mensaje de error
    const error = new Error('El enlace no existe o ha expirado')
    return res.status(404).json({msg: error.message})
  }

  try {
    usuarioACambiar.token = null //Se le elimina el token al usuario de la DB
    usuarioACambiar.password = password; //Se asigna la propiedad de password a la nueva password que entrego el usuario
    await usuarioACambiar.save(usuarioACambiar) //Se guarda el usuario cambiado
    res.json({msg: "Contraseña cambiada con exito"}) //Se responde un mensaje de confirmacion del cambio de contraseña
  } catch (error) {
    console.log(error);
  }

}

const actualizarPerfil = async (req, res) => { //Modifica los datos del perfil del veterinario autenticado 
  const {id} = req.params; //Obtiene el id de los parametros
  const {nombre, email, web, telefono} = req.body; //Obtiene los datos del perfil del body de la peticion
  const veterinario = await Veterinario.findOne({id}) //Hace una consulta a la base de datos del veterinario con el id dado
  if(!veterinario) { //Si no se encuentra ningun veterinario con el id dado se retorna un error con un mensaje
    return res.status(404).json({msg: 'Id no corresponde a ningun usuario'})
  }
  if(veterinario.email !== email) { //Si el email dado es diferente al del veterinario encontrado mediante el id, se entiende el que usuario quiere cambiar el email de su cuenta
    const veterinarioExistente = Veterinario.findOne({email}) //Se busca si existe algun otro veterinario con el email que el usuario quiere utilizar
    if(veterinarioExistente) { //Si ya existe un veterinario con el email dado, se retorna un error con un mensaje 
      return res.status(403).json({msg: 'Correo ya está en uso'})
    }
  }

  try {
    //Si se pasa toda la validación entonces se modifica el usuario de la base de datos para guardar la version actualizada
    veterinario.nombre = nombre;
    veterinario.email = email;
    veterinario.web = web || null; //Si no hay un dato para la variable web, se guarda un null
    veterinario.telefono = telefono || null;
    await veterinario.save() //Se guarda el veterinario en la base de datos
    res.json(veterinario)//Se responde con el objeto del veterinario modificado 

  } catch (error) {
    console.log(error)
  }
}

const actualizarPassword = async (req, res) => { //Modifica el password del usuario autenticado
  const {id} = req.params //Se extrae el id del usuario desde los parametros de la peticion
  const {passwordActual, newPassword} = req.body; //Se extraen las dos contraseñas del body de la peticion

  const usuarioACambiar = await Veterinario.findOne({id}) //Se busca en la DB el usuario a cambiar mediante el id 
  if(!usuarioACambiar) { //Si no se encuentra ningun veterinario con el id dado se retorna un error con un mensaje
    return res.status(404).json({msg: 'Usuario no encontrado'})
  }
  if(await usuarioACambiar.comprobarPassword(passwordActual)) {//Se comprueba si la contraseña actual es la correcta mediante funcion importada
    try {
      usuarioACambiar.password = newPassword; //Si el password actual es correcto se cambia por el nuevo
      await usuarioACambiar.save() //Se guarda el objeto del veterinario en la DB
      res.json({msg: 'Contraseña cambiada correctamente'})//Se retorna un mensaje de respuesta
    } catch (error) {
      console.log(error);
    }
  } else {
    return res.status(400).json({msg: 'Contraseña Incorrecta'}) //Si la contraseña actual no es la correcta se retorna un mensaje de error como respuesta
  }
}

export {registrar, perfil, confirmar, autenticar, olvidePassword, comprobarToken, nuevoPassword, actualizarPerfil, actualizarPassword} //Se exportan todas las funciones de controlado que se ejecutrán en las routes
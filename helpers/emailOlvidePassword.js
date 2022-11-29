import nodemailer from 'nodemailer'
import dotenv from "dotenv/config" //Importamos esta dependencia añadiendo el "/config" para poder acceder a las variables de entorno en el archivo .env

const emailOlvidePassword = async (datos) => { //Funcion que conecta con mailtrap y envia email
  const transporter = nodemailer.createTransport({ //Creamos un transporter con le metodo createTransport para hacer la conexion e incluimos todos los datos necesarios como parametros en un objeto
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });

  const {email, nombre, token} = datos; //Extraemos las variables del objeto datos 

  //Enviar el email
  const info = await transporter.sendMail({ //Usamos el metodo del transporter sendMail incluimos todos los datos necesarios en un objeto como parametro
    from: 'APV - Administrador de Pacientes de Veterinaria',
    to: email,
    subject: 'Reestablece tu contraseña',
    text: 'Establece una nueva contraseña para tu cuenta',
    html: `<p>Hola ${nombre} parece que has olvidado tu contraseña, puedes restablecerla en el sigiente enlace: 
    <a href="${process.env.FRONTEND_URL}/olvide-password/${token} 
    ">Restablecer</a></p>
      <p>Si no olvidaste tu contraseña, puedes ignorar este mensaje</p>
    `
  })
  console.log("Mensaje enviado %s", info.messageId); //Mostramos en consola el messageId del mail enviado

}

export default emailOlvidePassword
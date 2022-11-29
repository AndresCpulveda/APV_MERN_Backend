import mongoose from "mongoose"; //Importamos la instancia de la dependencia del orm mongoose que nos permite realizar la conexion con nuestra DB en MongoDB 

const conectarDB = async () => {
  try {
    const db = await mongoose.connect(process.env.MONGO_URI, //Ponemos el url proporcionado por Mongo Db con el user y password
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );
  const url = `${db.connection.host}:${db.connection.port}` //Guardamos en una variable url los datos del host y puerto de conexion
  console.log(`MongoDB conectado en: ${url}`);
  } catch (error) {
    console.log(`error ${error.message}`);
    process.exit(1)
  }
}

export default conectarDB;
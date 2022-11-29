const generarId = () => { //Genera un string aleatorio de numeros y letras que se usará como token
  return Date.now().toString(32) + Math.random().toString(32).substring(2)
}

export default generarId
const mysql = require('mysql');

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '%ABCDabcd1',
    database : 'practicaAW'
});

connection.connect(function(err) {
    if (err) {
      console.log("Error al conectar con la base de datos");
      return;
    }
   
    console.log('Se ha conectado a la base de datos');
});


module.exports = connection;
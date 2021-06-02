const express = require('express');
const server = express();
const path = require('path');
const bcryptjs = require('bcryptjs');
const fs = require('fs');
const https = require('https');

const port = 5000;

// MIDDLEWARE 

// CONFIGURACIÓN

server.use(express.urlencoded({ extended: false }));
server.use(express.json()); // PARA QUE ENTIENDA ARCHIVOS JSON
server.use(express.static('public'));
server.set('view engine', 'ejs');
server.set('views', path.join(__dirname, 'views'));

// VARIABLES DE SESIÓN

const session = require('express-session');
server.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true,
    iniciado: false
}));

// BASE DE DATOS

const db = require('./database.js');

// RUTAS

server.get('/', function(req, res) {
    res.render('inicio.ejs', {message:""});
});

server.post('/registro', async function(req, res) {

    const user = req.body.user;
    const pass = req.body.pass;

    let passHash = await bcryptjs.hash(pass, 5);

    db.query("INSERT INTO users SET ?", {username:user, password:passHash}, function(err) {
        if(err) {
            console.log(err);
            res.render('inicio.ejs', {message:"¡Ese nombre de usuario ya está en uso!"});

        } else {
            req.session.iniciado = true;
            req.session.name = user;
            res.redirect('quiosco');
        }
    });
});

server.post('/login', async function(req, res) {

    const user = req.body.user;
    const pass = req.body.pass;

    db.query("SELECT * FROM users WHERE username=?", [user], async function(err, result) {
        if(err) {
            console.log(err);
            res.render('inicio.ejs', {message:"¡Ha ocurrido un error!"});

        } else if(result.length == 0 || !(await bcryptjs.compare(pass, result[0].password))) {
            res.render('inicio.ejs', {message:"¡Ese nombre o contraseña no coindicen"});

        } else {
            req.session.iniciado = true;
            req.session.name = result[0].username;
            res.redirect('quiosco');
        }
    });
});

server.get('/quiosco', function(req, res) {

    if(req.session.iniciado == false) {
        console.log("¡No ha iniciado sesión!");

    } else {
        res.render('quiosco.ejs', {name:req.session.name});
    }
});

server.get('/juegos', function(req, res) {
    res.send("Selecciona un juego");
});

server.get('/perfil', function(req, res) {
    res.render('perfil.ejs', {name:req.session.name});
});

server.get('/logout', function(req, res) {
    req.session.destroy(function() {
        res.redirect('/');
    });
});

/*
server.listen(port, function() {
    console.log("Servidor escuchando en el puerto: "+port);
});
*/

https.createServer({

   cert: fs.readFileSync('mi_certificado.crt'),
   key: fs.readFileSync('mi_certificado.key')

}, server).listen(port, function() {
        console.log("Servidor escuchando en el puerto: "+port);
});

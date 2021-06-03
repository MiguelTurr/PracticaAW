const express = require('express');
const server = express();
const path = require('path');
const bcryptjs = require('bcryptjs');
const fs = require('fs');
const https = require('https');
const def = require('./utils/utils.js');

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
	saveUninitialized: true
}));

// BASE DE DATOS

const db = require('./database.js');

// RUTAS

server.get('/', function(req, res) {
    res.render('quiosco.ejs', {
        name:req.session.name,
        rol: 1
    });
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
            req.session.rol = def.ROL_USER;
            res.redirect('/');
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
            req.session.rol = result[0].rol;
            res.redirect('/');
        }
    });
});

server.get('/inicio', function(req, res) {
    res.render('inicio.ejs', {message:""});
});

server.get('/juegos', function(req, res) {
    res.render('juegos.ejs', {
        name:req.session.name,
        rol: req.session.rol
    });
});

server.get('/juegos/ahorcado', function(req, res) {

    /*if(req.session.iniciado === undefined) {
        //res.redirect('/');
        res.send("Debes iniciar sesión primero");

    } else {
        res.render('ahorcado.ejs', {name:req.session.name});
    }*/
    res.render('ahorcado.ejs', {
        name:req.session.name,
        rol: req.session.rol
    });
});

server.get('/juegos/tiktaktoe', function(req, res) {

    if(req.session.iniciado === undefined) {
        res.render('error.ejs', {
            name: req.session.name,
            message: "¡Debes iniciar sesión primero!",
            rol: req.session.rol
        });

    } else {
        res.render('tiktaktoe.ejs', {
            name:req.session.name,
            rol: req.session.rol
        });
    }
});

server.get('/perfil', function(req, res) {
    if(req.session.iniciado === undefined) {

        res.render('error.ejs', {
            name: req.session.name,
            message: "¡Debes iniciar sesión primero!",
            rol: req.session.rol
        });

    } else {
        res.render('perfil.ejs', {
            name:req.session.name,
            rol: req.session.rol
        });
    }
});

server.get('/admin', function(req, res) {

    if(req.session.iniciado === undefined || req.session.rol != def.ROL_ADMIN) {

        res.render('error.ejs', {
            name: req.session.name,
            message: "¡No puedes acceder aquí!",
            rol: req.session.rol
        });

    } else {

    }
});

server.post('/addpoints', function(req, res) {

    const user = req.session.name
    const puntos = req.body.points;

    if(req.session.iniciado != undefined) {

        db.query("UPDATE users SET points=?+points WHERE username=?", [puntos, user], function(err) {
            
            if(err) {
                console.log(err);
                res.redirect('/');
    
            } else {
                res.status(200);
            }
        });
    }
});

//

server.get('/logout', function(req, res) {

    req.session.destroy(function() {
        res.redirect('/');
    });
});

https.createServer({

   cert: fs.readFileSync('mi_certificado.crt'),
   key: fs.readFileSync('mi_certificado.key')

}, server).listen(port, function() {
        console.log("Servidor escuchando en el puerto: "+port);
});

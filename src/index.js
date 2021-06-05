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
	saveUninitialized: true,
    rolling: true, // QUE EL TIEMPO DE CERRAR LA SESIÓN SE ACTUALICE CON LA ACTIVIDAD DEL USUARIO
    cookie: {
      maxAge: 30 * 60 * 1000 // CERRAR LA SESIÓN DESPUÉS DE 30 MINUTOS DE INACTIVIDAD
    }
}));

// BASE DE DATOS

const db = require('./database.js');

// RUTAS

server.get('/', function(req, res) {
    res.render('quiosco.ejs', {
        name:req.session.name,
        rol: req.session.rol
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
            req.session.puntos = result[0].points;
            req.session.userID = result[0].ID;
            res.redirect('/');
        }
    });
});

server.get('/inicio', function(req, res) {

    if(req.session.iniciado === undefined) {
        res.render('inicio.ejs', {message:""});

    } else {
        res.redirect('/');
    }
});

server.get('/juegos', function(req, res) {
    res.render('juegos.ejs', {
        name:req.session.name,
        rol: req.session.rol
    });
});

server.get('/juegos/ahorcado', function(req, res) {

    if(req.session.iniciado === undefined) {
        res.render('error.ejs', {
            name: req.session.name,
            message: "¡Debes iniciar sesión primero!",
            rol: req.session.rol
        });

    } else {
        res.render('ahorcado.ejs', {
            name:req.session.name,
            rol: req.session.rol
        });
    }
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

server.get('/tienda', function(req, res) {

    if(req.session.iniciado === undefined) {

        res.render('error.ejs', {
            name: req.session.name,
            message: "¡Debes iniciar sesión primero!",
            rol: req.session.rol
        });

    } else {
        res.render('tienda.ejs', {
            name: req.session.name,
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

        db.query("SELECT COUNT(*) AS contador FROM album WHERE userID=?", [req.session.userID],
        
        function(err, result) {
            if(err) {
                console.log(err);

                res.render('error.ejs', {
                    name: req.session.name,
                    message: "¡Ha ocurrido un error!",
                    rol: req.session.rol
                });
    
            } else {

                res.render('perfil.ejs', {
                    name:req.session.name,
                    rol: req.session.rol,
                    saldo: req.session.puntos,
                    album: result[0].contador
                });
            }
        });
    }
});

server.get('/coleccion', function(req, res) {

    if(req.session.iniciado === undefined) {

        res.render('error.ejs', {
            name: req.session.name,
            message: "¡Debes iniciar sesión primero!",
            rol: req.session.rol
        });

    } else {

        db.query("SELECT collections.collectionName,album.* FROM album INNER JOIN collections ON collections.collectionID = album.collectionID WHERE album.userID=?", [req.session.userID],
        
        function(err, result) {
            if(err) {
                console.log(err);

                res.render('error.ejs', {
                    name: req.session.name,
                    message: "¡Ha ocurrido un error!",
                    rol: req.session.rol
                });
    
            } else {

                res.render('coleccion.ejs', {
                    name: req.session.name,
                    rol: req.session.rol,
                    colecciones: result.length,
                    result: result
                });
            }
        });
    }
});

server.get('/coleccion/ver/:id', function(req, res) {

    if(req.session.iniciado === undefined) {

        res.render('error.ejs', {
            name: req.session.name,
            message: "¡Debes iniciar sesión primero!",
            rol: req.session.rol
        });

    } else if(req.session.rol != def.ROL_ADMIN) {

        res.render('error.ejs', {
            name: req.session.name,
            message: "¡No puedes acceder aquí!",
            rol: req.session.rol
        });

    } else {
        db.query("SELECT album.*,collections.collectionName,cromosTienda.cromoImagen,cromosTienda.cromoNombre FROM album INNER JOIN cromosUsuario ON cromosUsuario.collectionID=album.collectionID INNER JOIN cromosTienda ON cromosUsuario.cromoID=cromosTienda.ID INNER JOIN collections ON album.collectionID=collections.collectionID WHERE cromosUsuario.userID=? AND album.collectionID=?", [req.session.userID, req.params.id],

        function(err, result) {
            
            if(err) {
                console.log(err);

                res.render('error.ejs', {
                    name: req.session.name,
                    message: "¡Ha ocurrido un error!",
                    rol: req.session.rol
                });

            } else {

                if(result.length == 0) {

                    db.query("SELECT collections.collectionName,album.* FROM album INNER JOIN collections ON collections.collectionID = album.collectionID WHERE album.userID=? AND album.collectionID=?", [req.session.userID, req.params.id],

                    function(err, result) {
                        
                        if(err) {
                            console.log(err);

                            res.render('error.ejs', {
                                name: req.session.name,
                                message: "¡Ha ocurrido un error!",
                                rol: req.session.rol
                            });

                        } else {

                            res.render('coleccionVer', {
                                name: req.session.name,
                                rol: req.session.rol,
                                nombreColeccion: result[0].collectionName,
                                cromosComprados: result[0].cromoComprados,
                                cromosTotal: result[0].totalCromos,
                                numeroCromos: 0
                            });
                        }
                    });

                } else {

                    res.render('coleccionVer', {
                        name: req.session.name,
                        rol: req.session.rol,
                        nombreColeccion: result[0].collectionName,
                        cromosComprados: result[0].cromoComprados,
                        cromosTotal: result[0].totalCromos,
                        numeroCromos: result.length,
                        cromos: result
                    });
                }
            }
        });
    }
});

server.get('/admin', function(req, res) {

    if(req.session.iniciado === undefined) {

        res.render('error.ejs', {
            name: req.session.name,
            message: "¡Debes iniciar sesión primero!",
            rol: req.session.rol
        });

    } else if(req.session.rol != def.ROL_ADMIN) {

        res.render('error.ejs', {
            name: req.session.name,
            message: "¡No puedes acceder aquí!",
            rol: req.session.rol
        });

    } else {
        db.query("SELECT collections.*,MAX(cromosTienda.cromoCantidad) as estado FROM collections INNER JOIN cromosTienda ON collections.collectionID = cromosTienda.collectionID GROUP BY collections.collectionName ORDER BY collections.collectionID DESC",
        
        function(err, result) {
            if(err) {
                console.log(err);

                res.render('error.ejs', {
                    name: req.session.name,
                    message: "¡Ha ocurrido un error!",
                    rol: req.session.rol
                });
    
            } else {

                res.render('admin.ejs', {
                    name: req.session.name,
                    rol: req.session.rol,
                    colecciones: result.length,
                    result: result
                });
            }
        });
    }
});

server.get('/admin/coleccion', function(req, res) {

    if(req.session.iniciado === undefined) {

        res.render('error.ejs', {
            name: req.session.name,
            message: "¡Debes iniciar sesión primero!",
            rol: req.session.rol
        });

    } else if(req.session.rol != def.ROL_ADMIN) {

        res.render('error.ejs', {
            name: req.session.name,
            message: "¡No puedes acceder aquí!",
            rol: req.session.rol
        });

    } else {
        res.render('addColeccion.ejs', {
            name: req.session.name,
            rol: req.session.rol
        });
    }
});

server.get('/admin/coleccion/ver/:id', function(req, res) {

    if(req.session.iniciado === undefined) {

        res.render('error.ejs', {
            name: req.session.name,
            message: "¡Debes iniciar sesión primero!",
            rol: req.session.rol
        });

    } else if(req.session.rol != def.ROL_ADMIN) {

        res.render('error.ejs', {
            name: req.session.name,
            message: "¡No puedes acceder aquí!",
            rol: req.session.rol
        });

    } else {
        db.query("SELECT cromosTienda.*,collections.collectionName FROM cromosTienda INNER JOIN collections ON cromosTienda.collectionID = collections.collectionID WHERE cromosTienda.collectionID = ?", [req.params.id],
        
        function(err, result) {
            
            if(err || result.length == 0) {
                console.log(err);

                res.render('error.ejs', {
                    name: req.session.name,
                    message: "¡Ha ocurrido un error!",
                    rol: req.session.rol
                });

            } else {

                res.render('adminVerColeccion', {
                    name: req.session.name,
                    rol: req.session.rol,
                    nombreColeccion: result[0].collectionName,
                    idColeccion: req.params.id,
                    numeroCromos: result.length,
                    cromos: result
                });
            }
        });
    }
});

server.post('/admin/coleccion/add', function(req, res) {

    if(req.session.iniciado === undefined) {

        res.render('error.ejs', {
            name: req.session.name,
            message: "¡Debes iniciar sesión primero!",
            rol: req.session.rol
        });

    } else if(req.session.rol != def.ROL_ADMIN) {

        res.render('error.ejs', {
            name: req.session.name,
            message: "¡No puedes acceder aquí!",
            rol: req.session.rol
        });

    } else {
        db.query("INSERT INTO collections SET ?", {collectionName:req.body.coleName}, function(err, result) {

            if(err) {
                console.log(err);

                res.render('error.ejs', {
                    name: req.session.name,
                    message: "¡Ha ocurrido un error!",
                    rol: req.session.rol
                });

            } else {

                var collectionID = result.insertId;

                for(let i = 0; i < req.body.cromos.length; i++) {
                    db.query("INSERT INTO cromosTienda SET ?", {
                        collectionID:collectionID,
                        cromoNombre: req.body.cromos[i].name,
                        cromoImagen: req.body.cromos[i].imagen,
                        cromoPrecio: req.body.cromos[i].precio,
                        cromoCantidad: req.body.cromos[i].cantidad
                    });
                } 

                res.status(200);
                res.send("");
            }
        });
    }
});

server.post('/admin/cromo/add', function(req, res) {

    if(req.session.iniciado === undefined) {

        res.render('error.ejs', {
            name: req.session.name,
            message: "¡Debes iniciar sesión primero!",
            rol: req.session.rol
        });

    } else if(req.session.rol != def.ROL_ADMIN) {

        res.render('error.ejs', {
            name: req.session.name,
            message: "¡No puedes acceder aquí!",
            rol: req.session.rol
        });

    } else {

        db.query("UPDATE cromosTienda SET cromoCantidad=cromoCantidad+? WHERE cromoNombre=? AND collectionID=?",
        [req.body.cromoCantidad, req.body.cromoNombre, req.body.collectionID],
        function(err, result) {

            if(err) {
                console.log(err);
    
                res.render('error.ejs', {
                    name: req.session.name,
                    message: "¡Ha ocurrido un error!",
                    rol: req.session.rol
                });
    
            } else {
                res.status(200);
                res.send("");
            }
        });
    }
});

server.post('/addpoints', function(req, res) {

    const user = req.session.name
    const puntos = req.body.points;

    if(req.session.iniciado != undefined) {

        req.session.puntos += puntos;

        db.query("UPDATE users SET points=?+points WHERE username=?", [puntos, user], function(err) {
            
            if(err) {
                console.log(err);
                res.redirect('/');
    
            } else {
                res.status(200);
                res.send("");
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

//

https.createServer({

   cert: fs.readFileSync('mi_certificado.crt'),
   key: fs.readFileSync('mi_certificado.key')

}, server).listen(port, function() {
        console.log("Servidor escuchando en el puerto: "+port);
});

const express = require('express');
const server = express();
const path = require('path');
const bcryptjs = require('bcryptjs');
const fs = require('fs');
const https = require('https');
const def = require('./utils/utils.js');
const session = require('express-session');
const fileUpload = require('express-fileupload');

const port = 5000;

// MIDDLEWARE 

// CONFIGURACIÓN

server.use(express.urlencoded({ extended: true, limit: '50mb' }));
server.use(express.json({limit: '50mb'})); // PARA QUE ENTIENDA ARCHIVOS JSON
server.use(express.static('public'));
server.set('view engine', 'ejs');
server.set('views', path.join(__dirname, 'views'));

// VARIABLES DE SESIÓN

server.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true,
    rolling: true, // QUE EL TIEMPO DE CERRAR LA SESIÓN SE ACTUALICE CON LA ACTIVIDAD DEL USUARIO
    cookie: {
      maxAge: 30 * 60 * 1000 // CERRAR LA SESIÓN DESPUÉS DE 30 MINUTOS DE INACTIVIDAD
    }
}));
server.use(fileUpload());


// BASE DE DATOS

const db = require('./database.js');

// RUTAS

server.get('/', function(req, res) {


    db.query("SELECT * FROM cromosTienda ORDER BY ID DESC LIMIT 3",
        
    function(err, result) {
        
        if(err) {
            console.log(err);

            res.status(500);
            res.render('error.ejs', {
                name: req.session.name,
                message: "¡Ha ocurrido un error!",
                rol: req.session.rol
            });

        } else {

            res.status(200);
            res.render('quiosco.ejs', {
                name:req.session.name,
                rol: req.session.rol,
                cromosTotal: result.length,
                cromos: result
            });
        }
    });
});

server.post('/registro', async function(req, res) {

    const user = req.body.user;
    const pass = req.body.pass;
    const rol = (req.body.rol == "Usuario") ? (def.ROL_USER) : (def.ROL_ADMIN);

    let passHash = await bcryptjs.hash(pass, 5);

    db.query("INSERT INTO users SET ?", {username:user, password:passHash, rol:rol}, function(err, result) {
        if(err) {
            console.log(err);

            res.status(500);
            res.render('inicio.ejs', {message:"¡Ese nombre de usuario ya está en uso!"});

        } else {
            
            req.session.iniciado = true;
            req.session.name = user;
            req.session.rol = rol;
            req.session.puntos = 0;
            req.session.userID = result.insertId;

            res.status(200);
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

            res.status(500);
            res.render('inicio.ejs', {message:"¡Ha ocurrido un error!"});

        } else if(result.length == 0 || !(await bcryptjs.compare(pass, result[0].password))) {

            res.status(500);
            res.render('inicio.ejs', {message:"¡Ese nombre o contraseña no coindicen!"});

        } else {
            req.session.iniciado = true;
            req.session.name = result[0].username;
            req.session.rol = result[0].rol;
            req.session.puntos = result[0].points;
            req.session.userID = result[0].ID;

            res.status(200);
            res.redirect('/');
        }
    });
});

server.get('/inicio', function(req, res) {

    if(req.session.iniciado === undefined) {
        res.status(200);
        res.render('inicio.ejs', {message:""});

    } else {
        res.status(200);
        res.redirect('/');
    }
});

server.get('/juegos', function(req, res) {

    res.status(200);
    res.render('juegos.ejs', {
        name:req.session.name,
        rol: req.session.rol
    });
});

server.get('/juegos/ahorcado', function(req, res) {

    if(req.session.iniciado === undefined) {

        res.status(401);
        res.render('error.ejs', {
            name: req.session.name,
            message: "¡Debes iniciar sesión primero!",
            rol: req.session.rol
        });

    } else {

        res.status(200);
        res.render('ahorcado.ejs', {
            name:req.session.name,
            rol: req.session.rol
        });
    }
});

server.get('/juegos/tiktaktoe', function(req, res) {

    if(req.session.iniciado === undefined) {

        res.status(401);
        res.render('error.ejs', {
            name: req.session.name,
            message: "¡Debes iniciar sesión primero!",
            rol: req.session.rol
        });

    } else {

        res.status(200);
        res.render('tiktaktoe.ejs', {
            name:req.session.name,
            rol: req.session.rol
        });
    }
});

server.get('/tienda', function(req, res) {

    if(req.session.iniciado === undefined) {

        res.status(401);
        res.render('error.ejs', {
            name: req.session.name,
            message: "¡Debes iniciar sesión primero!",
            rol: req.session.rol
        });

    } else {

        db.query("SELECT * FROM collections ORDER BY collectionCreacion", function(err, result) {
            if(err) {
                console.log(err);

                res.status(500);
                res.render('error.ejs', {
                    name: req.session.name,
                    message: "¡Ha ocurrido un error!",
                    rol: req.session.rol
                });
    
            } else {

                var coleccionNueva = [];
                for(let i = 0; i < result.length; i++) {

                    let objeto = {
                        fecha: (new Date() - result[i].collectionCreacion) / 86400000
                    };
                    coleccionNueva.push(objeto);
                }

                res.status(200);
                res.render('tienda.ejs', {
                    name: req.session.name,
                    rol: req.session.rol,
                    colecciones: result,
                    fechas: coleccionNueva
                });
            }
        });
    }
});

server.get('/tienda/coleccion/:id', function(req, res) {

    if(req.session.iniciado === undefined) {

        res.status(401);
        res.render('error.ejs', {
            name: req.session.name,
            message: "¡Debes iniciar sesión primero!",
            rol: req.session.rol
        });

    } else {

        const collectionID = req.params.id;
        db.query("SELECT * FROM collections WHERE collectionID=? LIMIT 1", [collectionID],
        
        function(err, coleccion) {

            if(err) {
                console.log(err);

                res.status(500);
                res.render('error.ejs', {
                    name: req.session.name,
                    message: "¡Ha ocurrido un error!",
                    rol: req.session.rol
                });

            } else {
                db.query("SELECT * FROM cromosTienda WHERE collectionID=?", [collectionID],
        
                function(err, cromos) {
                    if(err) {
                        console.log(err);
        
                        res.status(500);
                        res.render('error.ejs', {
                            name: req.session.name,
                            message: "¡Ha ocurrido un error!",
                            rol: req.session.rol
                        });

                    } else {

                        res.status(200);
                        res.render('tiendaColeccion.ejs', {
                            name: req.session.name,
                            rol: req.session.rol,
                            saldo: req.session.puntos,
                            coleccion: coleccion,
                            cromos: cromos
                        });
                    }
                });
            }
        });
    }
});

server.get('/tienda/comprar/coleccion/:id', function(req, res) {

    if(req.session.iniciado === undefined) {

        res.status(401);
        res.render('error.ejs', {
            name: req.session.name,
            message: "¡Debes iniciar sesión primero!",
            rol: req.session.rol
        });

    } else {

        const collectionID = req.params.id;

        db.query("SELECT * FROM collections WHERE collectionID=?", [collectionID],
            
        function(err, result) {

            if(err) {
                console.log(err);

                res.status(500);
                res.render('error.ejs', {
                    name: req.session.name,
                    message: "¡Ha ocurrido un error!",
                    rol: req.session.rol
                });

            } else if(req.session.puntos < result[0].collectionCoste) {
                console.log(err);

                res.status(500);
                res.send("<span class='text-danger'>¡No tienes suficientes puntos para comprar el album!</span>");

            } else {

                db.query("INSERT INTO album SET ?",
                {
                    collectionID: collectionID,
                    userID: req.session.userID,
                    totalCromos: result[0].collectionCromos
                },

                function(err) {

                    if(err) {
                        console.log(err);

                        res.status(500);
                        res.send("<span class='text-danger'>¡Ese álbum ya está en tus colecciones!</span>");

                    } else {
                        req.session.puntos -= result[0].collectionCoste;

                        db.query("UPDATE users SET points=? WHERE ID=?", [req.session.puntos, req.session.userID]);
                        res.status(200);
                        res.send("<span class='text-success'>¡El álbum ha sido añadido a tus colecciones!</span>");
                    }
                });
            }
        });
    }
});

server.get('/tienda/comprar/cromo/:id', function(req, res) {

    if(req.session.iniciado === undefined) {

        res.status(401);
        res.render('error.ejs', {
            name: req.session.name,
            message: "¡Debes iniciar sesión primero!",
            rol: req.session.rol
        });

    } else {

        const cromoID = req.params.id;

        db.query("SELECT * FROM cromosTienda WHERE ID=?", [cromoID],
            
        function(err, result) {

            if(err) {
                console.log(err);

                res.status(500);
                res.render('error.ejs', {
                    name: req.session.name,
                    message: "¡Ha ocurrido un error!",
                    rol: req.session.rol
                });

            } else if(req.session.puntos < result[0].cromoPrecio) {
                console.log(err);

                res.status(500);
                res.send("<span class='text-danger'>¡No tienes suficientes puntos para comprar el cromo!</span>");

            } else {

                db.query("SELECT * FROM album WHERE collectionID=? AND userID=?", [result[0].collectionID, req.session.userID],
                    
                function(err, album) {

                    if(err) {
                        console.log(err);

                        res.status(500);
                        res.render('error.ejs', {
                            name: req.session.name,
                            message: "¡Ha ocurrido un error!",
                            rol: req.session.rol
                        });

                    } else if(album.length == 0) {
                        console.log(err);

                        res.status(500);
                        res.send("<span class='text-danger'>¡Debes comprar el álbum primero!</span>");
                    } else {

                        db.query("INSERT INTO cromosUsuario SET ?",
                        {
                            collectionID: result[0].collectionID,
                            userID: req.session.userID,
                            cromoID: cromoID
                        },
        
                        function(err) {
        
                            if(err) {
                                console.log(err);
        
                                res.status(500);
                                res.send("<span class='text-danger'>¡Ese cromo ya está en tu colección!</span>");
        
                            } else {
                                req.session.puntos -= result[0].cromoPrecio;
        
                                db.query("UPDATE users SET points=? WHERE ID=?", [req.session.puntos, req.session.userID]);
                                db.query("UPDATE album SET cromoComprados=cromoComprados+1 WHERE ID=?", [album[0].ID]);
                                db.query("UPDATE cromosTienda SET cromoCantidad=cromoCantidad-1 WHERE ID=?", [cromoID]);
                                             
                                res.status(200);
                                res.send("<span class='text-success'>¡El cromo ha sido añadido a tus colecciones!</span>");
                            }
                        });
                    }
                });
            }
        });
    }
});

server.get('/perfil', function(req, res) {

    if(req.session.iniciado === undefined) {

        res.status(401);
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

                res.status(500);
                res.render('error.ejs', {
                    name: req.session.name,
                    message: "¡Ha ocurrido un error!",
                    rol: req.session.rol
                });
    
            } else {

                res.status(200);
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

        res.status(401);
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

                res.status(500);
                res.render('error.ejs', {
                    name: req.session.name,
                    message: "¡Ha ocurrido un error!",
                    rol: req.session.rol
                });
    
            } else {

                res.status(200);
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

        res.status(401);
        res.render('error.ejs', {
            name: req.session.name,
            message: "¡Debes iniciar sesión primero!",
            rol: req.session.rol
        });

    } else if(req.session.rol != def.ROL_ADMIN) {

        res.status(401);
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

                res.status(500);
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

                            res.status(500);
                            res.render('error.ejs', {
                                name: req.session.name,
                                message: "¡Ha ocurrido un error!",
                                rol: req.session.rol
                            });

                        } else {

                            res.status(200);
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

                    res.status(200);
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

        res.status(401);
        res.render('error.ejs', {
            name: req.session.name,
            message: "¡Debes iniciar sesión primero!",
            rol: req.session.rol
        });

    } else if(req.session.rol != def.ROL_ADMIN) {

        res.status(401);
        res.render('error.ejs', {
            name: req.session.name,
            message: "¡No puedes acceder aquí!",
            rol: req.session.rol
        });

    } else {

        db.query("SELECT * FROM collections ORDER BY collections.collectionID DESC",
        
        function(err, result) {
            if(err) {
                console.log(err);

                res.status(500);
                res.render('error.ejs', {
                    name: req.session.name,
                    message: "¡Ha ocurrido un error!",
                    rol: req.session.rol
                });
    
            } else {

                res.status(200);
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

        res.status(401);
        res.render('error.ejs', {
            name: req.session.name,
            message: "¡Debes iniciar sesión primero!",
            rol: req.session.rol
        });

    } else if(req.session.rol != def.ROL_ADMIN) {

        res.status(401);
        res.render('error.ejs', {
            name: req.session.name,
            message: "¡No puedes acceder aquí!",
            rol: req.session.rol
        });

    } else {

        res.status(200);
        res.render('addColeccion.ejs', {
            name: req.session.name,
            rol: req.session.rol
        });
    }
});

server.get('/admin/coleccion/ver/:id', function(req, res) {

    if(req.session.iniciado === undefined) {

        res.status(401);
        res.render('error.ejs', {
            name: req.session.name,
            message: "¡Debes iniciar sesión primero!",
            rol: req.session.rol
        });

    } else if(req.session.rol != def.ROL_ADMIN) {

        res.status(401);
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

                res.status(500);
                res.render('error.ejs', {
                    name: req.session.name,
                    message: "¡Ha ocurrido un error!",
                    rol: req.session.rol
                });

            } else {

                res.status(200);
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

        res.status(401);
        res.render('error.ejs', {
            name: req.session.name,
            message: "¡Debes iniciar sesión primero!",
            rol: req.session.rol
        });

    } else if(req.session.rol != def.ROL_ADMIN) {

        res.status(401);
        res.render('error.ejs', {
            name: req.session.name,
            message: "¡No puedes acceder aquí!",
            rol: req.session.rol
        });

    } else {

        db.query("INSERT INTO collections SET ?",
        {
            collectionName: req.body.coleName,
            collectionCromos: req.body.total,
            collectionCoste: req.body.coleCoste
        },
        
        function(err, result) {

            if(err) {
                console.log(err);

                res.status(500);
                res.render('error.ejs', {
                    name: req.session.name,
                    message: "¡Ha ocurrido un error!",
                    rol: req.session.rol
                });

            } else {

                var collectionID = result.insertId;

                if(req.body.total == 1) {

                    var cromos = JSON.parse(req.body.cromos);

                    db.query("INSERT INTO cromosTienda SET ?", {
                        collectionID:collectionID,
                        cromoNombre: cromos[0].name,
                        cromoImagen: req.files.imagen.name,
                        cromoPrecio: cromos[0].precio,
                        cromoCantidad: cromos[0].cantidad
                    });

                    req.files.imagen.mv(`./public/img/${req.files.imagen.name}`);

                } else {
                    var cromos = JSON.parse(req.body.cromos);

                    for(let i = 0; i < req.body.total; i++) {
                        db.query("INSERT INTO cromosTienda SET ?", {
                            collectionID:collectionID,
                            cromoNombre: cromos[i].name,
                            cromoImagen: req.files.imagen[i].name,
                            cromoPrecio: cromos[i].precio,
                            cromoCantidad: cromos[i].cantidad
                        });
                    } 

                    for(let i = 0; i < req.body.total; i++) {
                        let file = req.files.imagen[i];
                        file.mv(`./public/img/${file.name}`);
                    }
                }

                res.status(200);
                res.send("");
            }
        });
    }
});

server.post('/admin/coleccion/estado', function(req, res) {

    if(req.session.iniciado === undefined) {

        res.status(401);
        res.render('error.ejs', {
            name: req.session.name,
            message: "¡Debes iniciar sesión primero!",
            rol: req.session.rol
        });

    } else if(req.session.rol != def.ROL_ADMIN) {

        res.status(401);
        res.render('error.ejs', {
            name: req.session.name,
            message: "¡No puedes acceder aquí!",
            rol: req.session.rol
        });

    } else {

        db.query("SELECT collectionEstado FROM collections WHERE collectionID=?", [req.body.collectionID],
        function(err, result) {

            if(err) {
                console.log(err);
    
                res.status(500);
                res.render('error.ejs', {
                    name: req.session.name,
                    message: "¡Ha ocurrido un error!",
                    rol: req.session.rol
                });
    
            } else {

                let estado = (result[0].collectionEstado == 1) ? (0) : (1);

                db.query("UPDATE collections SET collectionEstado=? WHERE collectionID=?", [estado, req.body.collectionID],
                
                function(err) {
                    if(err) {
                        console.log(err);
            
                        res.status(500);
                        res.render('error.ejs', {
                            name: req.session.name,
                            message: "¡Ha ocurrido un error!",
                            rol: req.session.rol
                        });
                    } else {

                        res.status(200);
                        res.send((estado == 1) ? ("Activa") : ("Agotada"));
                    }
                });
            }
        });
    }
});

server.post('/admin/cromo/add', function(req, res) {

    if(req.session.iniciado === undefined) {

        res.status(401);
        res.render('error.ejs', {
            name: req.session.name,
            message: "¡Debes iniciar sesión primero!",
            rol: req.session.rol
        });

    } else if(req.session.rol != def.ROL_ADMIN) {

        res.status(401);
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
    
                res.status(500);
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

                res.status(500);
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

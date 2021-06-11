CREATE DATABASE practicaAW;
USE practicaAW;

CREATE TABLE users (
    ID INT(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(80) NOT NULL,
    rol INT(11) NOT NULL default 0,
    points INT(11) NOT NULL default 0,
    registro DATETIME NOT NULL default CURRENT_TIMESTAMP
);

ALTER TABLE users MODIFY username VARCHAR(50) NOT NULL UNIQUE;

CREATE TABLE collections (
    collectionID INT(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    collectionName VARCHAR(50) NOT NULL,
    collectionCromos INT(11) NOT NULL,
    collectionCreacion DATETIME NOT NULL default CURRENT_TIMESTAMP,
    collectionEstado INT(11) NOT NULL default 1,
    collectionCoste INT(11) NOT NULL
);

ALTER TABLE collections MODIFY collectionName VARCHAR(50) NOT NULL UNIQUE;

CREATE TABLE cromosTienda (
    ID INT(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    collectionID INT(11) NOT NULL,
    cromoNombre VARCHAR(50) NOT NULL,
    cromoImagen VARCHAR(500) NOT NULL,
    cromoPrecio INT(11) NOT NULL,
    cromoCantidad INT(11) NOT NULL
);

CREATE TABLE album (
    ID INT(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    collectionID INT(11) NOT NULL,
    userID INT(11) NOT NULL,
    totalCromos INT(11) NOT NULL,
    cromoComprados INT(11) NOT NULL default 0,
    UNIQUE `userID_collectionID` (`userID`,`collectionID`)
);

CREATE TABLE cromosUsuario (
    ID INT(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    collectionID INT(11) NOT NULL,
    cromoID INT(11) NOT NULL,
    userID INT(11) NOT NULL,
    UNIQUE `userID_collectionID_cromoID` (`collectionID`,`cromoID`,`userID`)
);
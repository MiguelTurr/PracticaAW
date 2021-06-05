CREATE DATABASE practicaAW;
USE practicaAW;

CREATE TABLE users (
    ID INT(11) NOT NULL,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(80) NOT NULL,
    rol INT(11) NOT NULL default 0,
    points INT(11) NOT NULL default 0
);

ALTER TABLE users ADD PRIMARY KEY (ID);
ALTER TABLE users MODIFY username VARCHAR(50) NOT NULL UNIQUE;
ALTER TABLE users MODIFY ID INT(11) NOT NULL AUTO_INCREMENT;

CREATE TABLE collections (
    collectionID INT(11) NOT NULL,
    collectionName VARCHAR(50) NOT NULL
    /*collectionCost INT(11) NOT NULL*/
);

ALTER TABLE collections ADD PRIMARY KEY (CollectionID);
ALTER TABLE collections MODIFY collectionName VARCHAR(50) NOT NULL UNIQUE;
ALTER TABLE collections MODIFY collectionID INT(11) NOT NULL AUTO_INCREMENT;

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
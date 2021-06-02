CREATE DATABASE practicaAW;
USE practicaAW;

CREATE TABLE users (
    ID INT(11) NOT NULL,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(80) NOT NULL,
    points INT(11) NOT NULL
);

CREATE TABLE collections (
    collectionID INT(11) NOT NULL,
    albumName VARCHAR(50) NOT NULL,
);

CREATE TABLE albums (
    albumID INT(11) NOT NULL,
    name VARCHAR(50) NOT NULL,
    nCards int(15) NOT NULL,
    albumPrice INT(11) NOT NULL
);

CREATE TABLE cards (
    cardID INT(11) NOT NULL,
    cardName VARCHAR(50) NOT NULL,
    price INT(11) NOT NULL
);

ALTER TABLE users ADD PRIMARY KEY (ID);
ALTER TABLE users MODIFY username VARCHAR(50) NOT NULL UNIQUE;
ALTER TABLE users MODIFY ID INT(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE collections ADD PRIMARY KEY (CollectionID);
ALTER TABLE albums ADD PRIMARY KEY (albumID);
ALTER TABLE cards ADD PRIMARY KEY (cardID);

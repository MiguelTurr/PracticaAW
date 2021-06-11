-- MySQL dump 10.13  Distrib 8.0.25, for Linux (x86_64)
--
-- Host: localhost    Database: practicaAW
-- ------------------------------------------------------
-- Server version	8.0.25-0ubuntu0.20.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `album`
--

DROP TABLE IF EXISTS `album`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `album` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `collectionID` int NOT NULL,
  `userID` int NOT NULL,
  `totalCromos` int NOT NULL,
  `cromoComprados` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`ID`),
  UNIQUE KEY `userID_collectionID` (`userID`,`collectionID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `album`
--

LOCK TABLES `album` WRITE;
/*!40000 ALTER TABLE `album` DISABLE KEYS */;
INSERT INTO `album` VALUES (1,1,1,11,4);
/*!40000 ALTER TABLE `album` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `collections`
--

DROP TABLE IF EXISTS `collections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `collections` (
  `collectionID` int NOT NULL AUTO_INCREMENT,
  `collectionName` varchar(50) NOT NULL,
  `collectionCromos` int NOT NULL,
  `collectionCreacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `collectionEstado` int NOT NULL DEFAULT '1',
  `collectionCoste` int NOT NULL,
  PRIMARY KEY (`collectionID`),
  UNIQUE KEY `collectionName` (`collectionName`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collections`
--

LOCK TABLES `collections` WRITE;
/*!40000 ALTER TABLE `collections` DISABLE KEYS */;
INSERT INTO `collections` VALUES (1,'Pokemon',11,'2021-06-11 20:35:05',1,50),(2,'Barcelona',13,'2021-06-11 21:41:45',1,50);
/*!40000 ALTER TABLE `collections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cromosTienda`
--

DROP TABLE IF EXISTS `cromosTienda`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cromosTienda` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `collectionID` int NOT NULL,
  `cromoNombre` varchar(50) NOT NULL,
  `cromoImagen` varchar(500) NOT NULL,
  `cromoPrecio` int NOT NULL,
  `cromoCantidad` int NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cromosTienda`
--

LOCK TABLES `cromosTienda` WRITE;
/*!40000 ALTER TABLE `cromosTienda` DISABLE KEYS */;
INSERT INTO `cromosTienda` VALUES (1,1,'pikachu','pikachu.jpg',25,16),(2,1,'vulpix','vulpix.jpeg',22,14),(3,1,'tepig','tepig.jpg',22,9),(4,1,'shinx','shinx.jpg',15,20),(5,1,'pichu','pichu.jpg',12,10),(6,1,'magmar','magmar.jpg',17,15),(7,1,'ivasur','ivasur.jpg',25,11),(8,1,'dragonair','dragonair.jpeg',33,12),(9,1,'ditto','ditto.jpg',7,15),(10,1,'charmander','charmander.jpg',30,7),(11,1,'aero','aero.jpeg',50,7),(12,2,'xavi','xavi.jpg',22,15),(13,2,'trincao','trincao.jpg',22,10),(14,2,'neymar','neymar.jpg',50,7),(15,2,'messi','messi.jpg',70,6),(16,2,'mascherano','mascherano.jpg',27,20),(17,2,'iniesta','iniesta.jpg',55,12),(18,2,'griezman','griezman.jpg',43,10),(19,2,'dest','dest.jpg',12,11),(20,2,'dembele','dembele.jpg',44,12),(21,2,'dejong','dejong.jpg',33,12),(22,2,'coutinho','cotinho.jpg',32,11),(23,2,'araujo','araujo.jpg',44,7),(24,2,'alba','alba.jpeg',25,12);
/*!40000 ALTER TABLE `cromosTienda` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cromosUsuario`
--

DROP TABLE IF EXISTS `cromosUsuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cromosUsuario` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `collectionID` int NOT NULL,
  `cromoID` int NOT NULL,
  `userID` int NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `userID_collectionID_cromoID` (`collectionID`,`cromoID`,`userID`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cromosUsuario`
--

LOCK TABLES `cromosUsuario` WRITE;
/*!40000 ALTER TABLE `cromosUsuario` DISABLE KEYS */;
INSERT INTO `cromosUsuario` VALUES (1,1,1,1),(3,1,2,1),(5,1,3,1),(6,1,11,1);
/*!40000 ALTER TABLE `cromosUsuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(80) NOT NULL,
  `rol` int NOT NULL DEFAULT '0',
  `points` int NOT NULL DEFAULT '0',
  `registro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'pepe','$2a$05$Q4SSoAb/bYIa3g6YZI3GJuHQHTg0JCZ3eIFtxVIzbLB7.CN.zQYWq',1,841,'2021-06-11 20:18:35'),(2,'juan','$2a$05$RUbFaqxF/ZwtMdOS6P9ypeqg3QN61womuohOsQFOrmOyzku7tuZfi',0,0,'2021-06-11 20:20:19'),(4,'luisa','$2a$05$F7AUjbiTjTaioTQ0qbwU5eQxqh.4Ws3uNwWurxFbOXvVIWNW/5PFO',0,0,'2021-06-11 20:23:12');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-06-11 21:46:59

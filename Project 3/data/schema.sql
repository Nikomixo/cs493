CREATE TABLE `businesses` (
  `id` mediumint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `state` varchar(2) NOT NULL,
  `zip` char(5) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `category` varchar(255) NOT NULL,
  `subcategory` varchar(255) NOT NULL,
  `website` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `ownerId` mediumint NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `reviews` (
  `id` mediumint NOT NULL AUTO_INCREMENT,
  `userId` mediumint NOT NULL,
  `businessId` mediumint NOT NULL,
  `dollars` mediumint NOT NULL,
  `stars` mediumint NOT NULL,
  `review` text,
  PRIMARY KEY (`id`),
  KEY `businessid` (`businessid`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`)
);

CREATE TABLE `photos` (
  `id` mediumint NOT NULL AUTO_INCREMENT,
  `userId` mediumint NOT NULL,
  `businessId` mediumint NOT NULL,
  `caption` text,
  PRIMARY KEY (`id`),
  KEY `businessId` (`businessId`),
  CONSTRAINT `photos_ibfk_1` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`)
);

CREATE TABLE `users` (
  `id` mediumint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `admin` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
);

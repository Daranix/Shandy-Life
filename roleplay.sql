-- phpMyAdmin SQL Dump
-- version 4.4.12
-- http://www.phpmyadmin.net
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 02-09-2015 a las 18:13:43
-- Versión del servidor: 5.6.25
-- Versión de PHP: 5.6.11

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `roleplay`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cars`
--

CREATE TABLE IF NOT EXISTS `cars` (
  `carid` int(11) NOT NULL,
  `ownerid` int(11) NOT NULL,
  `modelid` text NOT NULL,
  `posx` float NOT NULL,
  `posy` float NOT NULL,
  `posz` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `groups`
--

CREATE TABLE IF NOT EXISTS `groups` (
  `id` int(11) NOT NULL,
  `name` text NOT NULL,
  `members` text NOT NULL,
  `membersrank` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL,
  `name` varchar(18) NOT NULL,
  `password` text NOT NULL,
  `money` int(11) NOT NULL DEFAULT '0',
  `adminlvl` int(11) NOT NULL DEFAULT '0',
  `faction` int(11) NOT NULL DEFAULT '0',
  `factionrank` int(11) NOT NULL DEFAULT '0',
  `licenses` text NOT NULL,
  `phone` int(11) NOT NULL DEFAULT '0',
  `groupid` int(11) NOT NULL DEFAULT '0',
  `posx` float NOT NULL,
  `posy` float NOT NULL,
  `posz` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `cars`
--
ALTER TABLE `cars`
  ADD PRIMARY KEY (`carid`);

--
-- Indices de la tabla `groups`
--
ALTER TABLE `groups`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `cars`
--
ALTER TABLE `cars`
  MODIFY `carid` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT de la tabla `groups`
--
ALTER TABLE `groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

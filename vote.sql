-- phpMyAdmin SQL Dump
-- version 5.1.2
-- https://www.phpmyadmin.net/
--
-- Хост: localhost:3306
-- Час створення: Трв 14 2026 р., 10:55
-- Версія сервера: 5.7.24
-- Версія PHP: 8.3.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База даних: `vote`
--

-- --------------------------------------------------------

--
-- Структура таблиці `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `login` varchar(30) NOT NULL,
  `password` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблиці `answers`
--

CREATE TABLE `answers` (
  `id` int(11) NOT NULL,
  `name` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп даних таблиці `answers`
--

INSERT INTO `answers` (`id`, `name`) VALUES
(1, 'ТАК'),
(2, 'ЗВІСНО'),
(3, '111'),
(4, '222'),
(5, '444'),
(6, '111'),
(7, '222'),
(8, '333'),
(9, '444'),
(10, '11'),
(11, '22'),
(12, 'тупоголові'),
(13, 'гостроголові'),
(14, 'і то іто'),
(15, 'плоскоземельні'),
(16, '111'),
(17, '222');

-- --------------------------------------------------------

--
-- Структура таблиці `answer_to_petition`
--

CREATE TABLE `answer_to_petition` (
  `id` int(11) NOT NULL,
  `petition` int(11) NOT NULL,
  `answer` int(11) NOT NULL,
  `num_of_vote` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=armscii8;

--
-- Дамп даних таблиці `answer_to_petition`
--

INSERT INTO `answer_to_petition` (`id`, `petition`, `answer`, `num_of_vote`) VALUES
(13, 5, 16, 1),
(14, 5, 17, 0);

-- --------------------------------------------------------

--
-- Структура таблиці `petition`
--

CREATE TABLE `petition` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `text` mediumtext NOT NULL,
  `status` int(11) NOT NULL,
  `author` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп даних таблиці `petition`
--

INSERT INTO `petition` (`id`, `name`, `text`, `status`, `author`) VALUES
(5, 'test', 'test', 1, 8);

-- --------------------------------------------------------

--
-- Структура таблиці `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `login` varchar(30) NOT NULL,
  `password` varchar(150) NOT NULL,
  `admin` tinyint(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп даних таблиці `user`
--

INSERT INTO `user` (`id`, `login`, `password`, `admin`) VALUES
(5, 'Alex', '$2b$10$SEEvUsSPON7JLFSEhZDgGOAAkyejIXkSQ7HCIsOADfOdmthV/knkG', 0),
(6, 'me', '$2b$10$/AoCtsGljywTNyPWGg6Xk.iDZfnaxUWCzTPtzRkQn3fCTkKtvMx/i', 0),
(7, 'sfd', '$2b$10$oeA9K6t0pQILC8/SAd1W8uiM/uMhOYsfbUDxQdLk57A4uvEQXg.ze', 0),
(8, '444', '$2b$10$iw4RksbEIjcax.Oza79Aiu5XCVggYm54xdbn.tnCzcWju5tSIIBOu', 1),
(9, '555', '$2b$10$M0.LaXeDWqDYw7NUAprFTOpBO6G2g57ZITuP3mfjulRXZTbsTOO9O', 0),
(10, '333', '$2b$10$xJhfdXpcbbL71YIx26NlG.pbaRsTmqlMgnW6f55aLyPBl8dUkqs/m', 0),
(11, '222', '$2b$10$Dx8SIIwGs/O0nEmdtulkj.cAjHsWk6Nxf24yb4dK1IIc/.dJDa/NK', 0),
(12, '111', '$2b$10$hvCdqjsO8xJwGhmMTQltKuMv8RrjUsAQjOPDxq4GQXKSW141GwgMq', 0),
(13, '666', '$2b$10$L5B7CDjxXRNMw/3MC53CQu8RSXLWIAXr1hvDno2d2RT0dGDxV3t1e', 0);

-- --------------------------------------------------------

--
-- Структура таблиці `users_to_answer`
--

CREATE TABLE `users_to_answer` (
  `id` int(11) NOT NULL,
  `user` int(11) DEFAULT NULL,
  `answer` int(11) DEFAULT NULL,
  `petition` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп даних таблиці `users_to_answer`
--

INSERT INTO `users_to_answer` (`id`, `user`, `answer`, `petition`) VALUES
(15, 8, 16, 5);

--
-- Індекси збережених таблиць
--

--
-- Індекси таблиці `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`);

--
-- Індекси таблиці `answers`
--
ALTER TABLE `answers`
  ADD PRIMARY KEY (`id`);

--
-- Індекси таблиці `answer_to_petition`
--
ALTER TABLE `answer_to_petition`
  ADD PRIMARY KEY (`id`),
  ADD KEY `petition` (`petition`),
  ADD KEY `answer` (`answer`);

--
-- Індекси таблиці `petition`
--
ALTER TABLE `petition`
  ADD PRIMARY KEY (`id`),
  ADD KEY `author` (`author`);

--
-- Індекси таблиці `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id_UNIQUE` (`id`);

--
-- Індекси таблиці `users_to_answer`
--
ALTER TABLE `users_to_answer`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user` (`user`),
  ADD KEY `users_to_answer_ibfk_3` (`petition`),
  ADD KEY `answer` (`answer`);

--
-- AUTO_INCREMENT для збережених таблиць
--

--
-- AUTO_INCREMENT для таблиці `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблиці `answers`
--
ALTER TABLE `answers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT для таблиці `answer_to_petition`
--
ALTER TABLE `answer_to_petition`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT для таблиці `petition`
--
ALTER TABLE `petition`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT для таблиці `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT для таблиці `users_to_answer`
--
ALTER TABLE `users_to_answer`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Обмеження зовнішнього ключа збережених таблиць
--

--
-- Обмеження зовнішнього ключа таблиці `answer_to_petition`
--
ALTER TABLE `answer_to_petition`
  ADD CONSTRAINT `answer_to_petition_ibfk_1` FOREIGN KEY (`petition`) REFERENCES `petition` (`id`),
  ADD CONSTRAINT `answer_to_petition_ibfk_2` FOREIGN KEY (`answer`) REFERENCES `answers` (`id`);

--
-- Обмеження зовнішнього ключа таблиці `petition`
--
ALTER TABLE `petition`
  ADD CONSTRAINT `petition_ibfk_1` FOREIGN KEY (`author`) REFERENCES `user` (`id`);

--
-- Обмеження зовнішнього ключа таблиці `users_to_answer`
--
ALTER TABLE `users_to_answer`
  ADD CONSTRAINT `users_to_answer_ibfk_1` FOREIGN KEY (`user`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `users_to_answer_ibfk_3` FOREIGN KEY (`petition`) REFERENCES `answers` (`id`),
  ADD CONSTRAINT `users_to_answer_ibfk_4` FOREIGN KEY (`answer`) REFERENCES `answers` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

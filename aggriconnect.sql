-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Mar 01, 2026 at 10:17 AM
-- Server version: 8.0.41
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `aggriconnect`
--

-- --------------------------------------------------------

--
-- Table structure for table `farmer_cropmaster`
--

CREATE TABLE `farmer_cropmaster` (
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `deleted` tinyint(1) NOT NULL,
  `crop_id` int NOT NULL,
  `crop_name` varchar(50) NOT NULL,
  `crop_variety` varchar(100) NOT NULL,
  `photo` varchar(100) DEFAULT NULL,
  `description` longtext
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Truncate table before insert `farmer_cropmaster`
--

TRUNCATE TABLE `farmer_cropmaster`;
--
-- Dumping data for table `farmer_cropmaster`
--

INSERT INTO `farmer_cropmaster` (`created_at`, `updated_at`, `deleted`, `crop_id`, `crop_name`, `crop_variety`, `photo`, `description`) VALUES
('2026-01-30 15:42:28.463115', '2026-01-30 15:43:36.207358', 0, 1, 'poteto', 'vseugeuf', 'crops/agriculture-2654157.jpg', 'vewufvewuv evfuebvuevbfyufv'),
('2026-01-30 15:42:49.911045', '2026-01-30 15:43:42.080541', 1, 2, 'rice', 'ewiubfewubfu', '', 'fewigfyewogfuygewf'),
('2026-01-30 15:44:05.429117', '2026-01-30 15:44:05.429164', 0, 3, 'rice', 'ewifbeiwgf', '', 'fwefvfytwefvyetwvcy');

-- --------------------------------------------------------

--
-- Table structure for table `farmer_farmer`
--

CREATE TABLE `farmer_farmer` (
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `deleted` tinyint(1) NOT NULL,
  `f_id` int NOT NULL,
  `user_name` varchar(150) NOT NULL,
  `password` varchar(128) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `gender` varchar(1) NOT NULL,
  `sub_district` varchar(100) NOT NULL,
  `state` varchar(50) NOT NULL,
  `address` varchar(255) NOT NULL,
  `ekyf_id` varchar(15) NOT NULL,
  `f_phone` varchar(11) NOT NULL,
  `f_photo` varchar(100) DEFAULT NULL,
  `aadhar_no` varchar(12) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Truncate table before insert `farmer_farmer`
--

TRUNCATE TABLE `farmer_farmer`;
--
-- Dumping data for table `farmer_farmer`
--

INSERT INTO `farmer_farmer` (`created_at`, `updated_at`, `deleted`, `f_id`, `user_name`, `password`, `first_name`, `last_name`, `gender`, `sub_district`, `state`, `address`, `ekyf_id`, `f_phone`, `f_photo`, `aadhar_no`) VALUES
('2026-01-24 15:53:10.246624', '2026-01-25 11:28:51.577091', 1, 1, 'farmer1', 'pbkdf2_sha256$1200000$YwgHCgwjzw7fXVFgxklrOK$gEkdJHJ6WG6ViD25ieEQYpTBfI6qDOH+wHSzUPwhgrw=', 'Pratham', 'Makwana', 'M', 'Ahmedabad', 'Gujarat', '3 , stayam flat , kankaria ,ahmedabad', '101', '06351869498', '', '847384839204'),
('2026-01-24 15:55:46.454199', '2026-01-25 11:28:43.261671', 1, 2, 'farmer20', 'pbkdf2_sha256$1200000$Emt8Jwd7n6xyIVkNPmOZFR$wSkK7LEUgB9lSOazJVnFUshrYoLl2WUNh8q5tZcP7gg=', 'Sejal', 'Makwana', 'F', 'Ahmedabad', 'Gujarat', '4 , stayam flat , kankaria ,ahmedabad', '102', '9879516121', '', '843682679365'),
('2026-01-24 16:10:05.169031', '2026-01-25 11:28:55.245165', 1, 3, 'farmer21', 'pbkdf2_sha256$1200000$6kWRz70mXBML6pAjmWlQLw$5fKtdPUszNNCdOoF4oUayP5wE3CcZY1iIw5xzOlpJc4=', 'Jayeshbhai', 'Makwana', 'M', 'Ahmedabad', 'Gujarat', '3 , stayam flat , kankaria ,ahmedabad', '103', '9867345823', '', '847592645281'),
('2026-01-24 16:28:55.977052', '2026-01-25 11:28:58.071977', 1, 4, 'farmer50', 'pbkdf2_sha256$1200000$rV3NxZ8rObP26VvIapKglP$XBHO4C/LIzm78J57SVZ3KIUvH7d4FLP9R47JozB35AA=', 'Rakesh', 'Joshi', 'M', 'Ahmedabad', 'Gujarat', 'dsknwkjvbperibvehrbvei', '104', '8567385332', '', '846285742947'),
('2026-01-24 16:29:52.399305', '2026-01-25 11:39:38.997872', 1, 5, 'farmer51', 'pbkdf2_sha256$1200000$FRkRowCPmcTUe2OU27nYu5$gSzQR/PQaf9e5XLPWUry3l2hmfgnqIywvKaqJ6fIrjM=', 'edmvniuowehvi', 'wejnvewjbv', 'F', 'Ahmedabad', 'Gujarat', '3 , stayam flat , kankaria ,ahmedabad', '105', '8475847484', '', '847593648532'),
('2026-01-24 16:31:29.276080', '2026-01-25 11:52:51.952624', 1, 6, 'wiegiweb', 'pbkdf2_sha256$1200000$0UfKowGGKteV2wZYZGiQp3$ad9cFA8ZUPw2/2kgXEV9bNsdQYuzy3/H9Kpic9JO2RE=', 'wonvijernv', 'vwjnvkev', 'M', 'Ahmedabad', 'Gujarat', '3 , stayam flat , kankaria ,ahmedabad', '106', '4003059594', '', '947385839284'),
('2026-01-24 16:32:03.712820', '2026-01-25 11:58:00.748499', 1, 7, 'wevne', 'pbkdf2_sha256$1200000$vkOPAWOIwhCl3ckSMjWjGP$B1N+SC3ojBFv4sRLxXJ36vW/PptH4YFHaGS/kGilJs4=', 'elkmewogn', 'wenmkejngre', 'F', 'Ahmedabad', 'Gujarat', '3 , stayam flat , kankaria ,ahmedabad', '107', '9473857385', '', '947375837284'),
('2026-01-24 16:32:56.258509', '2026-01-25 17:22:33.616171', 1, 8, 'farmer100', 'pbkdf2_sha256$1200000$nYuuyUVzFhqUzk9VdCesk6$pbULhvawwbygPWK5jKLhm47UkTn7m/rpJQR5VSRyDeY=', 'wekgwioeb', 'fwkjebi', 'M', 'Ahmedabad', 'Gujarat', '3 , stayam flat , kankaria ,ahmedabad', '108', '9375837483', '', '927482947934'),
('2026-01-24 16:33:47.794289', '2026-01-25 12:11:32.408292', 1, 9, 'wojeognf', 'pbkdf2_sha256$1200000$TRl67bsqd2TlGVvXvyj9K0$cy3n0ip5z2hjTZ/GWCdPvrQVUXvUgyyRraPpCIKC1lU=', 'wfjpeonf', 'fwknfoe', 'F', 'Ahmedabad', 'Gujarat', '3 , stayam flat , kankaria ,ahmedabad', '109', '83658374593', '', '956375637484'),
('2026-01-24 16:34:29.681750', '2026-01-26 04:29:13.306816', 1, 10, 'webweohbewuv', 'pbkdf2_sha256$1200000$sNtRabiIKNQx35oIBlmbrN$i7btZpoAmKfSLl2HEQ1YYNr/ScBceuydUteJ48Whj+A=', 'weibweoiy', 'efjbwif', 'F', 'Ahmedabad', 'Gujarat', '3 , stayam flat , kankaria ,ahmedabad', '110', '8367384738', '', '784385983839'),
('2026-01-24 16:43:47.078486', '2026-01-26 04:29:15.908892', 1, 11, 'farmer101', 'pbkdf2_sha256$1200000$2GUkO8F98RStU9gXeIMayn$DvPuBtP2YNI1CFTveCz281y5l4s9JLamBTr1s834UoM=', 'wvjnwev', 'vwenvniv', 'M', 'Ahmedabad', 'Gujarat', '3 , stayam flat , kankaria ,ahmedabad', '111', '9474934983', '', '948385749263'),
('2026-01-24 17:26:09.635645', '2026-01-25 13:37:19.464844', 1, 12, 'Farmer@160', 'pbkdf2_sha256$1200000$LHiIOBBM9RHb2mIESCTXqq$0K1f6lB7qiMy4sGKFJl8cFA5b1Zu59LZXewuDqzNOEk=', 'vwevfewf', 'vevew', 'F', 'Ahmedabad', 'Gujarat', '3 , stayam flat , kankaria ,ahmedabad', '115', '8963783693', '', '987635267389'),
('2026-01-25 05:38:43.259430', '2026-01-26 04:29:18.276996', 1, 13, 'Farmer200', 'pbkdf2_sha256$1200000$eo841dajKxV0KwkWJLvLx1$j/Rt42cw4mYmHuN6NQEIiw8VMSWcxpxSjAt9BPjlvOo=', 'efewf', 'vewvewv', 'M', 'Ahmedabad', 'Gujarat', '3 , stayam flat , kankaria ,ahmedabad', '200', '8493760473', '', '937254672812'),
('2026-01-25 07:01:18.258918', '2026-01-26 04:28:50.735938', 1, 14, 'farmer500', 'pbkdf2_sha256$1200000$mL6HvdOXAtgvhriLFlJ7hf$xZwxnET0h3ZFJ438uSWGBcxWICFmL+y1mRh+ggjk02A=', 'inew', 'vewvewv', 'M', 'ahmedabad', 'Gujarat', 'Gujarat University\n\nAhemdabad', '201', '8465827465', '', '948573958673'),
('2026-01-25 11:30:27.430085', '2026-01-25 13:56:14.772763', 1, 15, 'farmer223', 'pbkdf2_sha256$1200000$4dVy4sGicBixN8bhqTrqPZ$zna7gG83ZfsBgS+1ryXMSNaea6V0CwBJXLb1brUZ3cw=', 'ewijvnw', 'ewbvir', 'M', 'ahmedabad', 'Gujarat', 'Gujarat University\n\nAhemdabad', '500', '9454939584', '', '937584629475'),
('2026-01-25 13:41:26.788486', '2026-01-25 13:48:01.498684', 1, 16, 'farmer800', 'pbkdf2_sha256$1200000$y8GJBmKJKyZvy4wco6bTKE$MdiJ+h8TRHDTfXSz5Qfw91mK21SG51v8Y/BvGl20Cx4=', 'iwunv', 'wjvbe', 'M', 'Ahmedabad', 'Gujarat', 'ewipnvoi3rnvr vub4yby74bf7o54', '1000', '9482746105', 'farmer/Photo.jpg', '847395720184'),
('2026-01-25 13:58:58.466195', '2026-01-25 14:12:56.959331', 1, 69, 'iwjebver', 'pbkdf2_sha256$1200000$FXTzwwGc7RQavl5DNGAok2$Ib65PqdsOVU+LEjvFjHTtC8yWgZX/8UkmNXayk8CXlU=', 'pcewbvuoewb', 'vewuibvoe', 'M', 'Ahmedabad', 'Gujarat', 'weoginerpin', '999', '8473956382', 'farmer/Photo_RW8DLUN.jpg', '947593728494'),
('2026-01-25 14:13:51.376126', '2026-01-25 14:45:30.996946', 1, 72, 'erovnerubv', 'pbkdf2_sha256$1200000$rGSfjgLPpL9AKJqRPwa29j$emJSECdAi0SRsa6iZCNgQR6VxaexYBTuXkqBsxScTmc=', 'erre', 'rbver', 'M', 'Ahmedabad', 'Gujarat', 'ieovbeibvr', '1001', '7493847563', 'farmer/Photo_5olK184.jpg', '857493820594'),
('2026-01-25 14:46:23.278845', '2026-01-25 15:00:16.888877', 1, 73, 'farmer999', 'pbkdf2_sha256$1200000$si4xjHyg2Nh2BYf8oZzpE5$5rAU8hJdUfuSoYsGCgfwoAvQZV8+uiWjFi9tznGt4Bk=', 'iubib', 'iud', 'M', 'Ahmedabad', 'Gujarat', '', '888', '9758127405', 'farmer/Photo_o5RSyYN.jpg', '963511748376'),
('2026-01-25 15:42:28.715332', '2026-01-26 04:28:54.670035', 1, 74, 'voiebvu', 'pbkdf2_sha256$1200000$pq8g1g7tY3ESjabtDhorYQ$qGApO1QkbQe1BKZj3CgP89a7/AZFHdYhq4wGCI01ij0=', 'vijwbv', 'verv', 'M', 'Ahmedabad', 'Gujarat', 'vjipbvoer', '222', '9374928174', 'farmer/Photo_6baJ8wA.jpg', '847392928471'),
('2026-01-25 15:51:59.010583', '2026-01-26 04:28:58.203945', 1, 75, 'verbtr', 'pbkdf2_sha256$1200000$ZVr0Kdvz5CK2vgyVKoXlXP$lrkbBBwElvsnS3bAKHDeoJMG/Mlg77XsDJzOJOfWtZg=', 'ergrwtr', 'gerger', 'M', 'Ahmedabad', 'Gujarat', 'grbreovbrvrg', '333', '98673344567', 'farmer/Photo_LeP2owK.jpg', '876466649284'),
('2026-01-25 16:00:49.494043', '2026-01-26 04:29:01.418034', 1, 76, 'reoineriv', 'pbkdf2_sha256$1200000$sOWn70HEyxEZ8vIH7IyIQH$HI51WOMFwzGKl2fUOu5XvH+40yFlAsC0sKwxTievbPM=', 'ererw', 'erwergv', 'M', 'Ahmedabad', 'Gujarat', 'erbtrb', '666', '8574939201', 'farmer/Photo_yBCF0Oz.jpg', '456794038493'),
('2026-01-25 17:23:22.669913', '2026-01-26 04:29:04.650272', 1, 79, 'wegverg', 'pbkdf2_sha256$1200000$nsHK8VWndja2KjbqARSXyH$CSzPXvUwSBAUtuCpqtNtxeJMY3Z3L8MGdo+4swDVpKM=', 'wgvrg', 'rgergr', 'M', 'Ahmedabad', 'Gujarat', 'vivheribv', '299', '8695049385', 'farmer/Photo_3P2kqyu.jpg', '857694058604'),
('2026-01-25 17:29:17.601438', '2026-01-26 04:29:07.768889', 1, 80, 'wognipr', 'pbkdf2_sha256$1200000$u8t0sofL1p4JA3f5fGhlQY$GBbuhfzr+3WPt+rwvwMil5Sm7Bko7kY5PBnZddG4gGI=', 'aiupbv', 'vergi', 'M', 'Ahmedabad', 'Gujarat', 'ajobnivper', '777', '8675940597', 'farmer/Photo_BTbGfUW.jpg', '968574938694'),
('2026-01-25 18:17:46.648482', '2026-01-26 04:29:10.506930', 1, 81, 'veribver', 'pbkdf2_sha256$1200000$fknDoTw7HRZscE8InBohqq$EvDQji6+pERcG2iNePfFZKWaAeWSe2Td3YBo0wwfUKs=', 'eovnrpiv', 'v3ibr', 'M', 'Ahmedabad', 'Gujarat', 'viupwbvi3bvb4v048bv', '400', '9584738573', 'farmer/Photo_9Svd4DA.jpg', '857493850395'),
('2026-01-25 18:25:11.528893', '2026-01-25 18:38:16.388703', 1, 82, 'webowuefb', 'pbkdf2_sha256$1200000$cde3D6EfME3qzt34adkomC$J3ZaB1gY+dsKwIURfZrygFTsVC5idIMOlDHd0mVbEOQ=', 'pwuvpwe', 'voverv', 'M', 'Ahmedabad', 'Gujarat', 'vwuovregfr7r3g4', '866', '9586736421', 'farmer/Photo_bpViKt1.jpg', '958674837562'),
('2026-01-25 18:32:39.449044', '2026-01-25 18:47:22.773355', 1, 83, 'wipbefbpbf', 'pbkdf2_sha256$1200000$N7Rx29vTXp2Bi6E73HfMgj$F1UhFUVe+ZCVg7b1eN7lCEJ5LeiFXKGDk43Zzxp1BjQ=', 'ejpoihf', 'egeruff', 'M', 'Ahmedabad', 'Gujarat', 'qeiubeour', '566', '9586722375', 'farmer/Photo_sCbR9Vf.jpg', '857664839201'),
('2026-01-25 18:38:09.126050', '2026-01-25 18:47:19.956729', 1, 84, 'dvewvberib', 'pbkdf2_sha256$1200000$wdqV7Gi2kfjLciTw9Rm4M4$9/W23eCMUG3YLqAgCSd0c19AkpsvjNVqlAonOi+xhxo=', 'weberlib', 'webreir', 'M', 'Ahmedabad', 'Gujarat', 'wenvieugvrv', '485', '8574837595', 'farmer/Photo_7OyjRh6.jpg', '948305847234'),
('2026-01-25 18:47:07.688924', '2026-01-26 05:07:11.556631', 1, 85, 'sibveivr', 'pbkdf2_sha256$1200000$KllIDa39DNcLJPeF4WCkb7$XeNT8zO/7JllkglnN1t+7D4+YpQGaFldBbuVBZWxxcw=', 'wilbveirv', 'ewgiebvuyer', 'M', 'Ahmedabad', 'Gujarat', 'erijbveribvrv', '687', '9685940392', 'farmer/Photo.jpg', '968593213450'),
('2026-01-25 18:50:08.217180', '2026-01-25 18:50:47.999981', 1, 86, 'weiuberv', 'pbkdf2_sha256$1200000$RJ22OAvkbjbyEHuxLOFeAj$Xux302wXTzaj8Mi3zLMgjnHRF8Sl0nVoDy5nPHa7Jus=', 'veirbvire', 'doeribver', 'M', 'Ahmedabad', 'Gujarat', 'eirvbeirbvprv', '587', '8695048695', 'farmer/Adhar_Card.jpg', '867493869503'),
('2026-01-26 04:22:16.863582', '2026-01-29 12:54:09.985432', 1, 87, 'farmer01', 'pbkdf2_sha256$1200000$u2PuciOQG9hXE6D8tGhDXX$Xn/DPx59QYkHzXkPVfbTd33kEZWw5+roSBn46IlMh94=', 'Pratham', 'Makwana', 'M', 'Ahmedabad', 'Gujarat', 'veiobveiuvbyev', '545', '8765439804', 'farmer/Photo_O4v2Ee1.jpg', '684937503928'),
('2026-01-26 05:07:58.622012', '2026-01-26 05:39:09.629160', 1, 88, 'veveufe', 'pbkdf2_sha256$1200000$tqMSalYP4qnL6LdXPWf3fm$nLJV5thZcrhmZK6e7Xl+2ol5lp4NMiI4W8iLDHMZP+k=', 'eggvvure', 'vbelbvyure', 'M', 'Ahmedabad', 'Gujarat', 'veewgvyuv', '344', '8574839405', 'farmer/Photo_rQuACmL.jpg', '847382239405'),
('2026-01-26 05:52:29.849266', '2026-01-26 07:08:15.081297', 1, 89, 'eobvyuerb', 'pbkdf2_sha256$1200000$UYVwVy26n9AYoKBxyMpWFe$CJodMu/vCeaPFxjndIlcfd3gLsB6zG/Ut/jXxo9KpAM=', 'rebvyerbvo', 'woberr', 'M', 'Ahmedabad', 'Gujarat', 'reuhvubveviohorgvu', '133', '8759483759', 'farmer/Photo_yaBIo6F.jpg', '894839205849'),
('2026-01-26 06:04:41.746435', '2026-01-29 16:05:05.305721', 1, 90, 'vwibvuwebvu', 'pbkdf2_sha256$1200000$6kaxIMfB96tYQMU5oiVa1b$JkWjw3sV7YoWsHRVFbWNjJgKbfaoVlRx26iix5951LY=', 'reipvheirbv', 'eriperiug', 'M', 'Ahmedabad', 'Gujarat', 'gwiuhogeghrveiuvhgv', '556', '8675948392', 'farmer/Photo_DNyxJfd.jpg', '958473859606'),
('2026-01-26 06:21:35.838963', '2026-01-26 06:51:10.219061', 1, 91, 'vewouvueobvo', 'pbkdf2_sha256$1200000$vrLn4fgFdQUQ4rh6CHuifC$APAaaAE4CTJxe1THZg3y9JIe5eWeq1r2BC6HmUyy8cI=', 'erobvuerovu', 'veobvuebov', 'M', 'Ahmedabad', 'Gujarat', 'eiprieuvierbgyure', '467', '8576940395', '', '968374590603'),
('2026-01-26 06:29:19.986908', '2026-01-26 09:15:37.717037', 1, 92, 'ouvbeubvuer', 'pbkdf2_sha256$1200000$jOMXheFHcspNGbgY0vy6KU$mF7LyksvPcTXEnPJHo4TJ+sHM4mLy+bxS4/l+Ad4lu0=', 'voebveub', 'sdbeubvuer', 'M', 'Ahmedabad', 'Gujarat', 'wivberiobvoybvu', '274', '8574968573', 'farmer/Photo_vN6PQtv.jpg', '857432285948'),
('2026-01-26 09:15:30.163837', '2026-01-26 17:49:26.552764', 1, 93, 'vewuobve', 'pbkdf2_sha256$1200000$ESGVrtalOasiaiWZ2wXSrH$QPphMl93ZfrKLttdSH3y+rqf/ObKngVcDFfpPOcBARk=', 'wepvibuewiv', 'evergefv', 'M', 'Ahmedabad', 'Gujarat', 'wds[ovnepubv', '366', '9847948597', 'farmer/Photo_PEELicx.jpg', '876483793876'),
('2026-01-26 18:17:48.704570', '2026-01-29 12:54:06.990228', 1, 94, 'vwibvuerv', 'pbkdf2_sha256$1200000$62GGHlYlw2M3HOK3gus2Pp$oCTV7uLb7sveBtJfd8SIxRvE14THXP5Okz9oxvP4Ywk=', 'pwierhvierr', 'wiovbuerv', 'M', 'Ahmedabad', 'Gujarat', 'rihbo3riuf93', '243', '8574938574', '', '987564783921'),
('2026-01-29 12:53:56.245885', '2026-01-29 16:04:54.820449', 1, 95, 'farmer301', 'pbkdf2_sha256$1200000$g1T4p8gahAuoGZKEL6574L$Z/YoNluKzzFqnmVtggxwXPAFZUaey8QNQ+8zlFmS160=', 'Pratham', 'Makwana', 'M', 'Ahmedabad', 'Gujarat', '3 , satyam flat , audichyanagar D-37 nr vima yogna hospital , Kankaria , Ahmedabad-380022', '249', '06351869498', 'farmer/Photo.jpg', '857495063847'),
('2026-01-29 14:54:22.562437', '2026-01-30 12:54:03.282759', 1, 96, 'wpovneirv', 'pbkdf2_sha256$1200000$G5D6jYmDH3IPvOYiJM4i6C$1G26wzM/p/iXjYziAs1qQW/mIUjWxbIqz35egufV+B8=', 'weoegergr', 'weobeuy', 'M', 'eoberuovriue', 'eiprugbeorubvr', 'iqeobgfougfye', '434', '8574958495', '', '958473950483'),
('2026-01-29 14:59:27.056889', '2026-02-02 08:09:46.549986', 0, 97, 'owebvuyebvo', 'pbkdf2_sha256$1200000$jrP2M3TLzrjO42WyCusHGg$l2QY9WrjmyZGsaW0PwWL04XrYsEvxmVnECz2fkLu+us=', 'weiobewuf', 'ewfuogwegf', 'M', 'fewfgue', 'wefheiu', 'fiuefhi', '327', '7584948493', 'farmer/agriculture-2654157.jpg', '987564839384'),
('2026-01-29 16:19:57.398765', '2026-01-30 14:02:49.449445', 0, 98, 'farmer222', 'pbkdf2_sha256$1200000$ZhGaqOe7mTlT5QMGwCOnfe$DQnrK3rragY4lBvgjRRCBa5ta8e5tK9cUN+nJDazP8k=', 'Pratham', 'Makwana', 'M', 'wpihgeriug', 'Gujarat', '3 , satyam flat , audichyanagar D-37 nr vima yogna hospital , Kankaria , Ahmedabad-380022', '54', '8674938504', 'farmer/Photo_fxppSns.jpg', '857493857694'),
('2026-01-30 06:32:38.001389', '2026-01-30 06:32:38.001437', 0, 99, 'vewibverv', 'pbkdf2_sha256$1200000$bnONKoobiQDn3zmPnlCA7a$1RZhWBhMWO3FNeoAvFBfOR0go09zddENAZrlJ8E54nQ=', 'veipuvbiure', '3voih[r3iov', 'F', 'wecef', 'vweucygwc', 'ervervevf', '123', '8759403987', '', '875940387654'),
('2026-01-30 13:42:43.832972', '2026-01-30 13:42:43.833027', 0, 100, 'farmer373', 'pbkdf2_sha256$1200000$IASkwy9ITXvoEZRwIAS96r$YdGUWHBR0yDQlCnqB7ziaOoJINeTU5oFi2DQOZIYfdU=', 'viwpfbef', 'jfwfu', 'M', 'Ahmedabad', 'Gujarat', 'weipbfeiubfioefuf', '67', '7849380584', 'farmer/Photo_EcYeDw7.jpg', '784938746299');

-- --------------------------------------------------------

--
-- Table structure for table `farmer_listing`
--

CREATE TABLE `farmer_listing` (
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `deleted` tinyint(1) NOT NULL,
  `l_id` int NOT NULL,
  `qty_available` decimal(8,2) NOT NULL,
  `price_per_unit` decimal(12,2) NOT NULL,
  `status` varchar(1) NOT NULL,
  `stock_detail_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Truncate table before insert `farmer_listing`
--

TRUNCATE TABLE `farmer_listing`;
-- --------------------------------------------------------

--
-- Table structure for table `farmer_stockdetail`
--

CREATE TABLE `farmer_stockdetail` (
  `id` bigint NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `deleted` tinyint(1) NOT NULL,
  `harvested_date` date NOT NULL,
  `hectares` decimal(8,2) DEFAULT NULL,
  `quantity` decimal(8,2) NOT NULL,
  `unit` varchar(3) NOT NULL,
  `price_per_unit` decimal(12,2) NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `stored_location` varchar(255) DEFAULT NULL,
  `stock_id_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Truncate table before insert `farmer_stockdetail`
--

TRUNCATE TABLE `farmer_stockdetail`;
--
-- Dumping data for table `farmer_stockdetail`
--

INSERT INTO `farmer_stockdetail` (`id`, `created_at`, `updated_at`, `deleted`, `harvested_date`, `hectares`, `quantity`, `unit`, `price_per_unit`, `expiry_date`, `stored_location`, `stock_id_id`) VALUES
(1, '2026-01-30 16:46:59.601853', '2026-01-30 18:11:36.796948', 1, '2026-01-30', NULL, 20.00, 'kg', 30.00, '2026-06-25', 'Ahmedabad', 1),
(2, '2026-01-30 16:56:05.108146', '2026-01-30 16:56:05.108183', 0, '2026-01-30', 5.00, 40.00, 'TON', 40.00, '2026-06-30', 'Ahmedabad', 2),
(3, '2026-01-30 17:44:14.691671', '2026-01-30 17:44:14.691718', 0, '2026-01-30', 4.00, 3.00, 'kg', 40.00, '2026-04-16', 'Ahmedabdad', 3),
(4, '2026-01-30 17:56:27.066157', '2026-01-30 17:56:27.066207', 0, '2026-01-30', 4.00, 30.00, 'kg', 30.00, '2026-04-23', 'Ahmedabad', 4),
(5, '2026-01-31 12:08:12.381244', '2026-01-31 12:08:12.381278', 0, '2026-01-31', 3.00, 3.00, 'kg', 3.00, NULL, 'ahmedabad', 5),
(6, '2026-01-31 12:08:57.722993', '2026-01-31 12:08:57.723038', 0, '2026-01-31', 4.00, 4.00, 'TON', 40.00, NULL, 'Ahmedabad', 6),
(7, '2026-01-31 12:08:57.850170', '2026-01-31 12:08:57.850209', 0, '2026-01-31', 4.00, 4.00, 'g', 50.00, NULL, 'Ahmedabad', 7),
(8, '2026-01-31 12:30:52.438394', '2026-01-31 12:30:52.438437', 0, '2026-01-31', 2.00, 2.00, 'kg', 23.00, NULL, 'asewegerg', 8),
(9, '2026-01-31 12:30:52.440537', '2026-01-31 12:30:52.440575', 0, '2026-01-31', 4.00, 3.00, 'kg', 43.00, NULL, 'vreverver', 8),
(10, '2026-01-31 12:32:11.166009', '2026-01-31 12:32:11.166053', 0, '2026-01-31', 4.00, 4.00, 'kg', 4.00, NULL, 'seufibweu', 9),
(11, '2026-01-31 12:32:11.167927', '2026-01-31 12:32:11.167966', 0, '2026-01-31', 4.00, 4.00, 'kg', 4.00, NULL, 'fewfjbfbef', 9),
(12, '2026-01-31 12:42:17.169961', '2026-01-31 12:42:17.170007', 0, '2026-01-31', 4.00, 4.00, 'kg', 43.00, NULL, 'vevergrgr', 10),
(13, '2026-01-31 12:42:17.172433', '2026-01-31 12:42:17.172476', 0, '2026-02-01', 5.00, 5.00, 'kg', 34.00, NULL, 'ververgerg', 10),
(14, '2026-01-31 13:48:45.354220', '2026-01-31 13:48:45.354255', 0, '2026-01-31', 2.00, 2.00, 'Q', 50.00, '2026-04-30', 'Surat', 11),
(15, '2026-01-31 13:48:45.359006', '2026-01-31 13:48:45.359043', 0, '2026-01-31', 3.00, 3.00, 'g', 60.00, NULL, 'Ahmedabad', 11),
(16, '2026-01-31 14:20:16.067188', '2026-01-31 14:20:16.067219', 0, '2026-01-31', 10.00, 10.00, 'TON', 30.00, '2026-04-30', 'Ahmedabad', 12),
(17, '2026-01-31 14:20:16.068439', '2026-01-31 14:20:16.068467', 0, '2026-01-31', 20.00, 20.00, 'g', 30.00, '2026-04-30', 'Ahmedabad', 12),
(18, '2026-01-31 14:20:16.069517', '2026-01-31 14:20:16.069541', 0, '2026-01-31', 30.00, 30.00, 'kg', 30.00, '2026-05-30', 'Ahmedabad', 12);

-- --------------------------------------------------------

--
-- Table structure for table `farmer_stockmaster`
--

CREATE TABLE `farmer_stockmaster` (
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `deleted` tinyint(1) NOT NULL,
  `stock_id` int NOT NULL,
  `crop_id_id` int NOT NULL,
  `farmer_id_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Truncate table before insert `farmer_stockmaster`
--

TRUNCATE TABLE `farmer_stockmaster`;
--
-- Dumping data for table `farmer_stockmaster`
--

INSERT INTO `farmer_stockmaster` (`created_at`, `updated_at`, `deleted`, `stock_id`, `crop_id_id`, `farmer_id_id`) VALUES
('2026-01-30 16:46:59.577119', '2026-01-30 16:46:59.577179', 0, 1, 1, 98),
('2026-01-30 16:56:05.106351', '2026-01-30 16:56:05.106393', 0, 2, 3, 98),
('2026-01-30 17:44:14.688380', '2026-01-31 13:21:40.816051', 1, 3, 1, 99),
('2026-01-30 17:56:27.064281', '2026-01-30 17:56:27.064326', 0, 4, 1, 98),
('2026-01-31 12:08:12.375071', '2026-01-31 12:08:12.375122', 0, 5, 1, 98),
('2026-01-31 12:08:57.720010', '2026-01-31 12:08:57.720057', 0, 6, 1, 98),
('2026-01-31 12:08:57.848461', '2026-01-31 12:08:57.848501', 0, 7, 3, 98),
('2026-01-31 12:30:52.436333', '2026-01-31 12:31:30.545297', 0, 8, 1, 97),
('2026-01-31 12:32:11.163961', '2026-01-31 12:32:11.164028', 0, 9, 1, 97),
('2026-01-31 12:42:17.167287', '2026-01-31 12:42:17.167336', 0, 10, 1, 100),
('2026-01-31 13:48:45.351798', '2026-01-31 13:48:45.351841', 0, 11, 3, 98),
('2026-01-31 14:20:16.065817', '2026-01-31 14:20:16.065855', 0, 12, 1, 97);

-- --------------------------------------------------------

--
-- Table structure for table `wholesaler_stockdetail`
--

CREATE TABLE `wholesaler_stockdetail` (
  `id` bigint NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `deleted` tinyint(1) NOT NULL,
  `intake_date` date NOT NULL,
  `quantity` decimal(8,2) NOT NULL,
  `unit` varchar(3) NOT NULL,
  `price_per_unit` decimal(12,2) NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `warehouse_loc` varchar(255) DEFAULT NULL,
  `stock_id_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Truncate table before insert `wholesaler_stockdetail`
--

TRUNCATE TABLE `wholesaler_stockdetail`;
--
-- Dumping data for table `wholesaler_stockdetail`
--

INSERT INTO `wholesaler_stockdetail` (`id`, `created_at`, `updated_at`, `deleted`, `intake_date`, `quantity`, `unit`, `price_per_unit`, `expiry_date`, `warehouse_loc`, `stock_id_id`) VALUES
(1, '2026-02-28 10:24:38.679095', '2026-02-28 10:24:38.679136', 0, '2026-02-28', 4.00, '', 30.00, '2026-09-28', NULL, 1),
(2, '2026-02-28 10:35:02.412888', '2026-02-28 10:35:02.412926', 0, '2026-02-28', 15.00, '', 25.00, '2026-06-30', NULL, 2),
(3, '2026-02-28 11:07:21.319235', '2026-02-28 11:07:21.319273', 0, '2026-02-28', 20.00, '', 30.00, '2026-10-01', NULL, 3),
(4, '2026-03-01 04:58:13.386114', '2026-03-01 04:58:13.386155', 0, '2026-03-01', 12.00, '', 30.00, '2027-05-13', NULL, 4);

-- --------------------------------------------------------

--
-- Table structure for table `wholesaler_stockmaster`
--

CREATE TABLE `wholesaler_stockmaster` (
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `deleted` tinyint(1) NOT NULL,
  `stock_id` int NOT NULL,
  `crop_id_id` int NOT NULL,
  `w_id_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Truncate table before insert `wholesaler_stockmaster`
--

TRUNCATE TABLE `wholesaler_stockmaster`;
--
-- Dumping data for table `wholesaler_stockmaster`
--

INSERT INTO `wholesaler_stockmaster` (`created_at`, `updated_at`, `deleted`, `stock_id`, `crop_id_id`, `w_id_id`) VALUES
('2026-02-28 10:24:38.674551', '2026-02-28 11:05:17.369055', 0, 1, 1, 1),
('2026-02-28 10:35:02.411079', '2026-02-28 10:37:49.292980', 1, 2, 1, 1),
('2026-02-28 11:07:21.317153', '2026-02-28 11:07:21.317205', 0, 3, 3, 1),
('2026-03-01 04:58:13.383102', '2026-03-01 04:58:13.383153', 0, 4, 3, 5);

-- --------------------------------------------------------

--
-- Table structure for table `wholesaler_wholesaler`
--

CREATE TABLE `wholesaler_wholesaler` (
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `deleted` tinyint(1) NOT NULL,
  `w_id` int NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(128) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `gender` varchar(1) NOT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(50) NOT NULL,
  `address` varchar(255) NOT NULL,
  `gst_no` varchar(15) NOT NULL,
  `w_phone` varchar(11) NOT NULL,
  `w_photo` varchar(100) DEFAULT NULL,
  `aadhar_no` varchar(12) NOT NULL,
  `business_proof` varchar(100) NOT NULL,
  `business_name` varchar(150) NOT NULL,
  `status` varchar(1) NOT NULL,
  `pan_no` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Truncate table before insert `wholesaler_wholesaler`
--

TRUNCATE TABLE `wholesaler_wholesaler`;
--
-- Dumping data for table `wholesaler_wholesaler`
--

INSERT INTO `wholesaler_wholesaler` (`created_at`, `updated_at`, `deleted`, `w_id`, `email`, `password`, `first_name`, `last_name`, `gender`, `city`, `state`, `address`, `gst_no`, `w_phone`, `w_photo`, `aadhar_no`, `business_proof`, `business_name`, `status`, `pan_no`) VALUES
('2026-02-22 10:59:16.240715', '2026-02-22 11:02:59.783183', 0, 1, 'abc@gmail.com', 'pbkdf2_sha256$1200000$s8Kcw1m6QlKNK2UwJmYnqU$Bpixb+8xUC0POZPed9ea+jmHTjYreNOEZJVkLwtWlzE=', 'Pratham', 'Makwana', 'M', 'Ahmedabad', 'Gujarat', '3 , satyam flat , audichyanagar D-37 nr vima yogna hospital , Kankaria , Ahmedabad-380022', '53AAAAA0000W3Z4', '7849380493', 'wholesaler/Photo.jpg', '875849384738', 'wholesaler/business_proof/SEM-4.jpg', 'Pratham', 'U', 'ABCDE1234W'),
('2026-02-22 11:07:43.297204', '2026-02-28 09:41:59.151806', 1, 2, 'abcd@gmail.com', 'pbkdf2_sha256$1200000$Lt3fJi4dP0smzDiDoW9qwq$CWbXrvKBr2+XpSiLQwa9aio2OGHBhPUyCmqKxLp5DLM=', 'udit', 'chuhan', 'M', 'Ahmedabad', 'Gujarat', '3-Satyam Flat , Audichya nagar , Opp-Juni Paylot Dairy , kankaria, Ahmedabad\r\nApartment', '22AAAAA0000A1Z5', '8574938393', '', '857483930293', 'wholesaler/business_proof/SEM-2.jpg', 'UDIT', 'U', 'ABCDE1234A'),
('2026-03-01 03:50:25.269604', '2026-03-01 03:50:25.269660', 0, 5, 'abcd123@gmail.com', 'pbkdf2_sha256$1200000$ysSOexxwGYe5ufURPryHBJ$A46drRfyAEZNG7w9TlAhdJe0TbO20WBGtWmwMTUFiTk=', 'Jignal', 'Gajjar', 'M', 'Ahmedabad', 'Gujarat', '3 , satyam flat , audichyanagar D-37 nr vima yogna hospital , Kankaria , Ahmedabad-380022', '22AAAAA0000A1Z3', '9839284765', '', '876839478398', 'wholesaler/business_proof/SEM-1_PQ8oZud.jpg', 'Jignal', 'U', 'ABCDE1238R');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `farmer_cropmaster`
--
ALTER TABLE `farmer_cropmaster`
  ADD PRIMARY KEY (`crop_id`);

--
-- Indexes for table `farmer_farmer`
--
ALTER TABLE `farmer_farmer`
  ADD PRIMARY KEY (`f_id`),
  ADD UNIQUE KEY `user_name` (`user_name`),
  ADD UNIQUE KEY `ekyf_id` (`ekyf_id`),
  ADD UNIQUE KEY `aadhar_no` (`aadhar_no`);

--
-- Indexes for table `farmer_listing`
--
ALTER TABLE `farmer_listing`
  ADD PRIMARY KEY (`l_id`),
  ADD KEY `farmer_listing_stock_detail_id_633c5717_fk_farmer_stockdetail_id` (`stock_detail_id`);

--
-- Indexes for table `farmer_stockdetail`
--
ALTER TABLE `farmer_stockdetail`
  ADD PRIMARY KEY (`id`),
  ADD KEY `farmer_stockdetail_stock_id_id_98e118f7_fk_farmer_st` (`stock_id_id`);

--
-- Indexes for table `farmer_stockmaster`
--
ALTER TABLE `farmer_stockmaster`
  ADD PRIMARY KEY (`stock_id`),
  ADD KEY `farmer_stockmaster_crop_id_id_cbaad8e3_fk_farmer_cr` (`crop_id_id`),
  ADD KEY `farmer_stockmaster_farmer_id_id_28bc2766_fk_farmer_farmer_f_id` (`farmer_id_id`);

--
-- Indexes for table `wholesaler_stockdetail`
--
ALTER TABLE `wholesaler_stockdetail`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wholesaler_stockdeta_stock_id_id_e2139d9b_fk_wholesale` (`stock_id_id`);

--
-- Indexes for table `wholesaler_stockmaster`
--
ALTER TABLE `wholesaler_stockmaster`
  ADD PRIMARY KEY (`stock_id`),
  ADD KEY `wholesaler_stockmast_w_id_id_13b4b5bc_fk_wholesale` (`w_id_id`),
  ADD KEY `wholesaler_stockmast_crop_id_id_5f00a0ce_fk_farmer_cr` (`crop_id_id`);

--
-- Indexes for table `wholesaler_wholesaler`
--
ALTER TABLE `wholesaler_wholesaler`
  ADD PRIMARY KEY (`w_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `gst_no` (`gst_no`),
  ADD UNIQUE KEY `aadhar_no` (`aadhar_no`),
  ADD UNIQUE KEY `pan_no` (`pan_no`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `farmer_cropmaster`
--
ALTER TABLE `farmer_cropmaster`
  MODIFY `crop_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `farmer_farmer`
--
ALTER TABLE `farmer_farmer`
  MODIFY `f_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `farmer_listing`
--
ALTER TABLE `farmer_listing`
  MODIFY `l_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `farmer_stockdetail`
--
ALTER TABLE `farmer_stockdetail`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `farmer_stockmaster`
--
ALTER TABLE `farmer_stockmaster`
  MODIFY `stock_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `wholesaler_stockdetail`
--
ALTER TABLE `wholesaler_stockdetail`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `wholesaler_stockmaster`
--
ALTER TABLE `wholesaler_stockmaster`
  MODIFY `stock_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `wholesaler_wholesaler`
--
ALTER TABLE `wholesaler_wholesaler`
  MODIFY `w_id` int NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `farmer_listing`
--
ALTER TABLE `farmer_listing`
  ADD CONSTRAINT `farmer_listing_stock_detail_id_633c5717_fk_farmer_stockdetail_id` FOREIGN KEY (`stock_detail_id`) REFERENCES `farmer_stockdetail` (`id`);

--
-- Constraints for table `farmer_stockdetail`
--
ALTER TABLE `farmer_stockdetail`
  ADD CONSTRAINT `farmer_stockdetail_stock_id_id_98e118f7_fk_farmer_st` FOREIGN KEY (`stock_id_id`) REFERENCES `farmer_stockmaster` (`stock_id`);

--
-- Constraints for table `farmer_stockmaster`
--
ALTER TABLE `farmer_stockmaster`
  ADD CONSTRAINT `farmer_stockmaster_crop_id_id_cbaad8e3_fk_farmer_cr` FOREIGN KEY (`crop_id_id`) REFERENCES `farmer_cropmaster` (`crop_id`),
  ADD CONSTRAINT `farmer_stockmaster_farmer_id_id_28bc2766_fk_farmer_farmer_f_id` FOREIGN KEY (`farmer_id_id`) REFERENCES `farmer_farmer` (`f_id`);

--
-- Constraints for table `wholesaler_stockdetail`
--
ALTER TABLE `wholesaler_stockdetail`
  ADD CONSTRAINT `wholesaler_stockdeta_stock_id_id_e2139d9b_fk_wholesale` FOREIGN KEY (`stock_id_id`) REFERENCES `wholesaler_stockmaster` (`stock_id`);

--
-- Constraints for table `wholesaler_stockmaster`
--
ALTER TABLE `wholesaler_stockmaster`
  ADD CONSTRAINT `wholesaler_stockmast_crop_id_id_5f00a0ce_fk_farmer_cr` FOREIGN KEY (`crop_id_id`) REFERENCES `farmer_cropmaster` (`crop_id`),
  ADD CONSTRAINT `wholesaler_stockmast_w_id_id_13b4b5bc_fk_wholesale` FOREIGN KEY (`w_id_id`) REFERENCES `wholesaler_wholesaler` (`w_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

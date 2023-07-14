-- Adminer 4.8.1 PostgreSQL 13.11 dump

DROP TABLE IF EXISTS "applications";
CREATE TABLE "public"."applications" (
    "id" uuid NOT NULL,
    "userId" integer NOT NULL,
    "name" character varying(25) NOT NULL,
    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

INSERT INTO "applications" ("id", "userId", "name") VALUES
('4502a015-74fc-45b0-8417-b02542970839',	1,	'Premier test'),
('0c65110c-9062-4695-a4b7-e4bbb2e2cfa2',	1,	'Deuxieme');

DROP TABLE IF EXISTS "dashboard";
DROP SEQUENCE IF EXISTS dashboard_id_seq;
CREATE SEQUENCE dashboard_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."dashboard" (
    "id" integer DEFAULT nextval('dashboard_id_seq') NOT NULL,
    "userId" integer NOT NULL,
    "layout" text NOT NULL,
    "applicationId" uuid NOT NULL,
    CONSTRAINT "dashboard_pkey" PRIMARY KEY ("id")
) WITH (oids = false);


DROP TABLE IF EXISTS "users";
DROP SEQUENCE IF EXISTS users_id_seq;
CREATE SEQUENCE users_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."users" (
    "id" integer DEFAULT nextval('users_id_seq') NOT NULL,
    "username" character varying(25) NOT NULL,
    "password" text NOT NULL,
    "mail" character varying(25) NOT NULL,
    "isAdmin" boolean DEFAULT false NOT NULL,
    "isValidated" boolean DEFAULT false NOT NULL,
    "nom" character varying(25),
    "prenom" character varying(25),
    CONSTRAINT "mail" UNIQUE ("mail"),
    CONSTRAINT "username" UNIQUE ("username"),
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

INSERT INTO "users" ("id", "username", "password", "mail", "isAdmin", "isValidated", "nom", "prenom") VALUES
(1,	'test',	'$2a$10$MVm5cOdsJw.sRWBZGT4ruOUHV.d5C9Kr7qkf9L.Iunoaciq4bAiw.',	'e.eniona2@gmail.com',	'f',	'f',	'test',	'test');

ALTER TABLE ONLY "public"."applications" ADD CONSTRAINT "applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT NOT DEFERRABLE;

ALTER TABLE ONLY "public"."dashboard" ADD CONSTRAINT "dashboard_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES applications(id) ON UPDATE CASCADE ON DELETE RESTRICT NOT DEFERRABLE;
ALTER TABLE ONLY "public"."dashboard" ADD CONSTRAINT "dashboard_userId_fkey" FOREIGN KEY ("userId") REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT NOT DEFERRABLE;

-- 2023-05-22 16:54:09.846026+00
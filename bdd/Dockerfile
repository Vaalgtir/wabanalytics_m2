# Derived from official postgres image (our base image)
FROM postgres:13-alpine

# Add a database
ENV POSTGRES_DB webanalytics

COPY ./Db_Scripts /docker-entrypoint-initdb.d/
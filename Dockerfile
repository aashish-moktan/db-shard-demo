FROM postgres:16

# Copy init.sql into auto-run folder
COPY init.sql /docker-entrypoint-initdb.d/
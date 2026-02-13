# Choose our base image
FROM serversideup/php:8.3-fpm-apache-debian
# FROM serversideup/php:8.4-fpm-apache-debian
# FROM serversideup/php:8.5-fpm-apache-debian

# Switch to root so we can do root things
USER root

RUN curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar && \
    chmod +x wp-cli.phar && \
    mv wp-cli.phar /usr/local/bin/wp

# Install the required extensions with root permissions
RUN install-php-extensions gd exif imagick intl

# Drop back to our unprivileged user
USER www-data

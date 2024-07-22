FROM ubuntu:latest

MAINTAINER Henri Casanova <henric@hawaii.edu>

# update repositories
RUN apt update

# set timezone to Hawaii
RUN echo "Pacific/Honolulu" > /etc/timezone && export DEBIAN_FRONTEND=noninteractive && apt-get install -y tzdata

# install nginx
RUN apt -y install nginx

# install basic things
RUN apt -y install vim
RUN apt -y install wget
RUN apt -y install inetutils-ping
RUN apt -y install curl
#RUN apt -y install sudo
#RUN apt -y install adduser

# add user docker_user
#RUN useradd -ms /bin/bash docker_user
#RUN adduser docker_user sudo
#RUN echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers
#
#USER docker_user
#WORKDIR /home/docker_user

# Copy nginx custom config file
COPY ./custom-nginx.conf /etc/nginx/

# Chck its correctness (doesn't work because it checks for hosts!)
#RUN nginx -t -c /etc/nginx/custom-nginx.conf

# Start nginx 
EXPOSE 80
STOPSIGNAL SIGQUIT
#CMD ["sleep", "10000"]
CMD ["nginx", "-c", "/etc/nginx/custom-nginx.conf", "-g", "daemon off;"]




FROM ubuntu:latest

MAINTAINER Henri Casanova <henric@hawaii.edu>

# update repositories
RUN apt update

# set timezone to Hawaii
RUN echo "Pacific/Honolulu" > /etc/timezone && export DEBIAN_FRONTEND=noninteractive && apt-get install -y tzdata

# install basic things
RUN apt -y install vim
RUN apt -y install wget
#RUN apt -y install sudo
#RUN apt -y install adduser

# add user docker_user
#RUN useradd -ms /bin/bash docker_user
#RUN adduser docker_user sudo
#RUN echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers
#
#USER docker_user
#WORKDIR /home/docker_user

RUN apt -y install nodejs
RUN apt -y install npm
RUN git clone https://github.com/johnpapa/node-hello.git

WORKDIR node-hello
RUN npm install

EXPOSE 3000
STOPSIGNAL SIGQUIT
CMD ["npm", "start"]




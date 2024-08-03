  - [X] Deploy behind nginx
     - Download wih Chrome asks for "insecure?" - see https below

  - [ ] Enhance the tracked usage data

  - [ ] Make it all configurable using a .env file, so that there are no branches for different servers
    - Using: https://forums.docker.com/t/passing-command-line-arguments-in-docker-compose/137996/2
    - Problem: Some of the environment has to be passed from the server to the client, which is super annoying (likely have to use the Window clientside stuff to which the server adds the relevant env stuff)


  - [ ] Make it all be behind HTTPS
    - Problem:  remix-server.js doesn't do HTTPS


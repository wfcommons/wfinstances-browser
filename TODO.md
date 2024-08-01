  - [X] Deploy behind nginx
     Download wih Chrome asks for "insecure?" - see https below

  - [ ] Make it all configurable using a .env file, so that there is no branches for different servers
    - Using: https://forums.docker.com/t/passing-command-line-arguments-in-docker-compose/137996/2
    - Problem: Some of the environemnt has to be passed from the server to the client, which is super annoying (likely have to use the Window client'side stuff to which the server adds the relevant env stuff)

  - [ ] Create usage database on Mongo
    - [ ] Do a POC
      - [X] Do a bogus thing api route
      - [ ] Call that api route from the ui
    - [ ] Come up with a Schema
    - [ ] Implement the full functionality


  - [ ] Create tiny server that can download some usage JSON
    - Modify the app2 stuff to do this

  - [ ] HTTPS?
    - Problem:  remix-server.js doesn't do HTTPS


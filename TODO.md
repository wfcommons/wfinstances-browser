  - [X] Deploy behind nginx
     - Download wih Chrome asks for "insecure?" - see https below


  - [ ] Create usage database on Mongo
    - [ ] Do a POC
      - [X] Do a bogus thing api route
      - [X] Call that api route from the ui and make sure it updates the database
      - [ ] Create tiny server that can download some usage JSON
        - Modify the app2 stuff to do this? Or just have a route on the main app?
    - [ ] Come up with a Schema for the usage
    - [ ] Implement the full functionality




  - [ ] Make it all configurable using a .env file, so that there are no branches for different servers
    - Using: https://forums.docker.com/t/passing-command-line-arguments-in-docker-compose/137996/2
    - Problem: Some of the environment has to be passed from the server to the client, which is super annoying (likely have to use the Window clientside stuff to which the server adds the relevant env stuff)


  - [ ] Make it all be behind HTTPS
    - Problem:  remix-server.js doesn't do HTTPS


# Minutes

---
### Meeting 1

Date: Friday, 9/6

Business:
- Introduced the project
- Defined project scope 
- Discussed project objectives and real world applications

Actions:
- Fork WfInstances-browser repo
- Run the app and populate the database
- Add a ‘simulate’ button that opens a blank popup
---
### Meeting 2

Date: Tuesday, 9/17

Business:
- Discussed the tools needed to start on this project, specifically WRENCH
- Clarified the main goal of the project and its applications

Actions:
- Read WRENCH documentation
- Add tooltip to simulate button
- Add simulation description to usage popup
- Add to the docker compose.yml so that there is a running wrench-daemon process
- Implement a hello world simulation in the simulation popup
---
### Meeting 3

Date: Tuesday, 9/24

Business:
- Reviewed progress since last week's meeting
- Discussed problem areas
- Reviewed REST APIs

Actions:
- Continue working on getting the hello world simulation to run
---
### Meeting 4

Date: Tuesday, 10/1

Business:
- Reviewed progress so far, discussed issues with the current course of action
- Decided to change tactics and use the WRENCH Python API for the duration of the project instead of Javascript and the Rest API.
- Began the process of developing a system to run the simulation on the back-end
  - Edited the api Dockerfile to install WRENCH and related software
  - Edited api/src/wfinstances/router.py to run WRENCH
  - Edited simulator.js to communicate with the back-end to start the simulation

Actions:
- Create a simulation that simulates a "hello world" program using the Python API.
---

# wfinstances-browser

## About WFInstances Browser
WFInstances Browser is a stand-alone web application that allows its users to access and browse all of the available Workflow Instances within the open-source WFCommons Project.
The table was developed to reduce the labor-intensive traversal of the multiple Github Repositories that make up the WFCommons project as well as explicitly display useful information to allow users to find instances that fit their specific projects.

As such, the current implementation of the WFInstances Browser allows the user to view all of the different Workflow Instances and sort them based on the metrics of:
- Workflow ID
- Github Repository
- Number of Tasks
- Number of Files
- Total Bytes Read (MB)
- Total Bytes Written (MB)
- Total Work (min)
- Depth of Workflow
- Minimum Width
- Maximum Width

Users are able to filter and search within the above metrics to easily find and download the Workflow Instance(s) that fit their respective needs.

You are able to find out more information on the WFCommons Project [here](https://wfcommons.org).

## Installation

### Mongo Database Setup:
Setup your own MongoDB and provide the MONGO_URI in a .env file. A database named wf_instance_browser_db will be automatically generated upon launching the API.

---

### Python API Backend:
WfInstances Browser requires the usage of Python 3.11 or higher.
You can download the latest versions of python [here](https://www.python.org/downloads/).

In the api directory, run the following in a terminal to deploy the backend:
```
python main.py
```

If you would like to view the API documentation following the deployment, you can visit:
[http://localhost:8081/docs](http://localhost:8081/docs).

---

### Remix UI Frontend:
In the ui directory, initialize the application by running the following in a terminal:
```
npm install
```
Following this, you can build the application using:
```
npm run build
```
And then run the application using:
```
npm run dev
```
You are able to view and use the application at [http://localhost:8080](http://localhost:8080).

---

## Usage

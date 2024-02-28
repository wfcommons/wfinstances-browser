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

#### Mongo Database Setup:
Setup your own MongoDB and provide the MONGO_URI in a .env file. The .env file should be placed in the /api folder. For example:

`/api/.env`
```
MONGO_URI=THE_URI_TO_YOUR_MONGODB
```
 A database named wf_instance_browser_db will be automatically generated upon launching the API.

---

#### Python API Backend:
WfInstances Browser requires the usage of Python 3.11 or higher.
You can download the latest versions of Python [here](https://www.python.org/downloads/).

In the api directory, run the following in a terminal to deploy the backend:
```
python main.py
```

If you would like to view the API documentation following the deployment, you can visit:
[http://localhost:8081/docs](http://localhost:8081/docs).

---

#### Remix UI Frontend:
WfInstances Browser requires the LTS version of Node.js.
You can download the latest versions of Node.js [here](https://nodejs.org/en).

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

Here is the initial screen you should see upon starting the application:
<img width="1250" alt="LightMode" src="https://github.com/ICS496WfCommons/wfinstances-browser/assets/97561440/eec654e2-3f2e-48c4-a3e5-fba8354436e6">

There is a button on the top right of the NavBar that allows you to change the theme of the site to dark mode:
<img width="1249" alt="DarkMode" src="https://github.com/ICS496WfCommons/wfinstances-browser/assets/97561440/327d9070-1988-4d37-991c-6862495859cb">

#### Filtering Instances:
Besides searching for instances, you are able to filter Workflow instances upon many different categories.
Below is an example of sorting the "Number of Files" column between the values of 200 and 300.
<img width="1229" alt="Filters_1" src="https://github.com/ICS496WfCommons/wfinstances-browser/assets/97561440/50a21d29-3a15-4453-95c6-e91a689ad3c2">
<img width="1232" alt="Filters_2" src="https://github.com/ICS496WfCommons/wfinstances-browser/assets/97561440/ee5dc724-4f2a-48ea-914f-381488e9dc9a">
<img width="403" alt="Filters_3" src="https://github.com/ICS496WfCommons/wfinstances-browser/assets/97561440/d49d9086-123d-465a-9284-30f7a4e1c6c1">

#### Column Visibility:
Users are able to show/hide columns based on their needs:
<img width="1240" alt="Column_Visibility" src="https://github.com/ICS496WfCommons/wfinstances-browser/assets/97561440/324e6fbd-b60c-41e8-9d17-3d4082c255d7">

#### Download Workflow Instances:
Users are able to select one or more workflow instances after sorting and download them for their own personal use cases.
<img width="637" alt="Download1" src="https://github.com/ICS496WfCommons/wfinstances-browser/assets/97561440/3ef2f98d-e519-4cdf-9aa3-a97c40d2b5a0">

These are automatically compressed and the user is able to find it in their downloads folder.

<img width="329" alt="Download2" src="https://github.com/ICS496WfCommons/wfinstances-browser/assets/97561440/3e0d3a35-437e-4bbd-a074-f1dd74f8c230">

# wfinstances-browser

## About WFInstances Browser
WFInstances Browser is a stand-alone web application that allows its users to access and browse all of the available Workflow Instances within the open-source WFCommons Project.
The table was developed to reduce the labor-intensive traversal of the multiple Github Repositories that make up the WFCommons project as well as explicitly display useful information to allow users to find instances that fit their specific projects.

As such, the current implementation of the WFInstances Browser allows the user to view all of the different Workflow Instances and sort them based on the metrics of:
- Workflow ID
- Github Repository
- Number of Tasks
- Number of Files
- Total sum of file sizes (MB)
- Total Bytes Read (MB)
- Total Bytes Written (MB)
- Total Work (min)
- Depth of Workflow
- Minimum Width
- Maximum Width

Users are able to filter and search within the above metrics to easily find and download the Workflow Instance(s) that fit their respective needs.

You can find out more information on the WFCommons Project [here](https://wfcommons.org).

---

## Running WFInstance Browser

Running the browser on localhost or on a server requires [Docker](https://docker.com).

### Development deployment on localhost using http

This is done as:

```
docker-compose up
```

which will build Docker images, run containers, eventually making the browser accessible
at [http://localhost](http://localhost).

The database is empty the first time you launch the browser. To populate the database with metrics from the official WfCommons WfInstances GitHub repo, run this command in a terminal on the server:
```
curl -X PUT http://localhost:8081/metrics/private/github/wfcommons/WfInstances
```

### Production deployment on a server using https (or http if you really want to)

Modify the `.env` file at the root of the directory to customize the configuration. 
See comments in that file for more information.

---
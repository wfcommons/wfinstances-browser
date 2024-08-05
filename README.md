# The WfCommons WfInstances browser

## About 

This is a web application that allows users to browse, select, and visualize
the available [Workflow
Instances](https://github.com/wfcommons/WfInstances) provided by the
[WFCommons Project](https://wfcommons.org).

The only software requirement for running the server is [Docker](https://docker.com). 

---

## Running on localhost for development/testing

This command:

```
docker-compose up
```

will build Docker images, run containers, eventually starting a Web server on which
the browser can be accessed at [http://localhost](http://localhost).

The database is empty the first time you launch the browser. To populate the database with metrics from the official [WfCommons WfInstances GitHub repo](https://github.com/wfcommons/WfInstances), run this command in a terminal on the machine running the server:
```
curl -X PUT http://localhost:8081/metrics/private/github/wfcommons/WfInstances
```

## Running in production

Modify the `.env` file at the root of the directory to customize the configuration (including using https) desired for your server. 
See comments in that file for more information and examples.  After modifying this file, you may want to rebuild all images:

```
docker-compose build --no-cache
```

before doing:

```
docker-compose up
```

---

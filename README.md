# The WfCommons WfInstances Browser

## About 

WFInstances Browser is a web application that allows users to access and browse all of 
the available [Workflow Instances](https://github.com/wfcommons/WfInstances) within the open-source [WFCommons Project](https://wfcommons.org).

The only software requirement is [Docker](https://docker.com). 

---

## Running on localhost for development/testing

This command:

```
docker-compose up
```

will build Docker images, run containers, eventually making the browser accessible
at [http://localhost](http://localhost).

The database is empty the first time you launch the browser. To populate the database with metrics from the official WfCommons WfInstances GitHub repo, run this command in a terminal on the server:
```
curl -X PUT http://localhost:8081/metrics/private/github/wfcommons/WfInstances
```

## Running in production on a server

Modify the `.env` file at the root of the directory to customize the configuration (including using https). 
See comments in that file for more information and examples.  After modifying this file, you may want to rebuild all
images:

```
docker-compose build --no-cache
```

before doing:

```
docker-compose up
```

---

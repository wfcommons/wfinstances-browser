# The WfCommons WfInstances browser

## About 

This is a web application that allows users to browse, select, and visualize
the available [Workflow
Instances](https://github.com/wfcommons/WfInstances) provided by the
[WFCommons Project](https://wfcommons.org).

The only software requirement for running the server is [Docker](https://docker.com). 

---

## Running with Docker

Dependencies:
- [Docker](https://docs.docker.com/install/)
- [Docker Compose](https://docs.docker.com/compose/install/)

Edit/use one of the `.env-*` files to configure the deployment, and then:

```bash
$ docker-compose --env-file <.env file> build  --no-cache
$ docker-compose up [-d]
```

The above will not run any Nginx front-end. If you want to do so, you must add the `--profile "with-my-own-nginx` argument to the `docker-compose` commands above.


The database is empty the first time you launch the browser. To populate the database with metrics from the official [WfCommons WfInstances GitHub repo](https://github.com/wfcommons/WfInstances), run this command in a terminal on the machine running the server:
```
curl -X PUT http://localhost:8081/metrics/private/github/wfcommons/WfInstances
```

REST API documentation is available at: [http://localhost:8081/docs](http://localhost:8081/docs)

(The above assumes 8081 is the configured port for the backend.)


## Get in Touch

The main channel to reach the WfCommons team is via the support email:
[support@wrench-project.org](mailto:support@wrench-project.org).

**Bug Report / Feature Request:** our preferred channel to report a bug or request a feature is via
[Github Issues Track](https://github.com/wfcommons/wfinstances-browser/issues)


## Funding Support

eduWRENCH has been funded by the National Science Foundation (NSF).

[![NSF Award 2411154][nsf-2411154-badge]][nsf-2411154-link]


[nsf-2411154-link]:           https://www.nsf.gov/awardsearch/showAward?AWD_ID=2411154


---

FROM python:3.12-bookworm

COPY requirements.txt .

RUN pip install -r requirements.txt

RUN apt-get update && apt-get install -y curl

RUN apt-get install -y cron

RUN echo '#!/bin/sh\ncurl -X PUT http://localhost:8081/metrics/private/github/wfcommons/WfInstances' > /usr/local/bin/workflowInjection.sh

RUN chmod +x /usr/local/bin/workflowInjection.sh

# Copy CRON scheduling
ARG CRON_INTERVAL_IN_MINUTES

RUN echo "*/${CRON_INTERVAL_IN_MINUTES} * * * *  /usr/local/bin/workflowInjection.sh" > /etc/cron.d/run-curl-job

RUN chmod 0644 /etc/cron.d/run-curl-job

RUN crontab /etc/cron.d/run-curl-job

COPY . .

CMD cron && uvicorn src.main:app --host 0.0.0.0 --port 8081

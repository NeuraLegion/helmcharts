FROM node:16-alpine as build

SHELL ["/bin/sh", "-o", "pipefail", "-c"]

# set project name
ARG SERVICE

# set app basepath
ENV HOME /home/node

# change workgin dir
WORKDIR $HOME/app/

# copy package.json files
COPY dist/apps/${SERVICE}/ ./

# install deps in quiet mode
RUN npm i -q --production

# start new image for lower size
FROM node:16-alpine

SHELL ["/bin/sh", "-o", "pipefail", "-c"]

# set app basepath
ENV HOME /home/node

# copy production complied node app to the new image
COPY --chown=node:node --from=build $HOME/app/ $HOME/app/

# run app with low permissions level user
USER node

# change workgin dir
WORKDIR $HOME/app/

ENV NODE_ENV production
ENV HTTP_PORT 3000

ARG DIST_TAG
ENV DIST_TAG ${DIST_TAG}
ARG SHA
ENV SHA ${SHA}
ARG VERSION
ENV VERSION ${VERSION}

EXPOSE ${HTTP_PORT}

CMD ["node", "main.js"]

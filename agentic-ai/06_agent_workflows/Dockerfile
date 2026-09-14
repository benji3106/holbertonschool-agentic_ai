FROM node:22-alpine@sha256:76789712cd1ae89a1225eac9077010d68987a423588042dac30446f502f1858c

WORKDIR /app

COPY --chown=node:node package.json scheduler.js ./

USER node

CMD ["npm", "start"]
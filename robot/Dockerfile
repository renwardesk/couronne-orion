# Image officielle Playwright : Node + Chromium déjà installés (même version que package.json)
FROM mcr.microsoft.com/playwright:v1.48.2-noble
WORKDIR /app
COPY package.json robot.mjs ./
RUN npm install --omit=dev
CMD ["node", "robot.mjs"]

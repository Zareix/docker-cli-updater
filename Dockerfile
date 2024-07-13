FROM oven/bun:1.1.20-alpine

WORKDIR /app

COPY package.json bun.lockb ./

RUN bun install

COPY . .

CMD [ "bun", "run", "update", "--all" ]
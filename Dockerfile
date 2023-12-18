FROM oven/bun:alpine

WORKDIR /app

COPY package.json bun.lockb ./

RUN bun install

ENV REGCTL_BIN /app/regctl
RUN curl -L https://github.com/regclient/regclient/releases/latest/download/regctl-linux-arm64 > $REGCTL_BIN
RUN chmod 755 $REGCTL_BIN

COPY . .

CMD [ "bun", "run", "update-all" ]
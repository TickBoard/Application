FROM golang:1.23-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o /out/app

FROM alpine:3.20
WORKDIR /app
COPY --from=build /out/app /app/app
COPY .env .env
EXPOSE 8082
CMD ["/app/app"]
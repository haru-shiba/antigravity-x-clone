FROM golang:1.23-alpine AS builder

WORKDIR /app

COPY go.mod ./
COPY . .

# go.sum might not exist yet, generate it based on code
RUN go mod tidy
RUN go mod download
RUN go build -o main .

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/main .

EXPOSE 8080
CMD ["./main"]

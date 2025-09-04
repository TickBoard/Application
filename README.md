# TickBoard Application 

Small task board with React (frontend) and Gin (Go backend). The repo is streamlined around CI/CD: GitHub Actions builds Docker images for the two services and can push them to Harbor.


## Overview

- **Frontend**: React + TypeScript, Axios (`withCredentials`) to call API; built static is served by `serve` at port `3000` in the image.
- **API**: Gin on port `8082`; JWT auth (token via Authorization: Bearer or `token` cookie), CORS allows credentials, Swagger at `/swagger` (and `/api/swagger`).
- **DB**: Expects MongoDB 6 (not provisioned in this repo).


## Directory

- `frontend/`: React app and `Dockerfile`
- `gin-api/`: Go Gin API (`controllers/`, `models/`, `internal/`, `docs/`) and `Dockerfile`
- `.github/workflows/harbor-push.yml`: CI that builds (and conditionally pushes) images


## API Endpoints (primary)

- **Health**: `GET /health`, `GET /api/health`
- **Swagger**: `GET /swagger/*`, `GET /api/swagger/*`
- **Auth**: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/me`
- **Tasks**: `GET /api/tasks`, `POST /api/tasks`, `GET /api/tasks/:id`, `PATCH /api/tasks/:id`, `DELETE /api/tasks/:id`
- **Users**: `GET /api/users/:id`, `PATCH /api/users/:id`, `DELETE /api/users/:id`


## Environment

- `gin-api/.env` (loaded by `godotenv` when running the API):

```
PORT=8082
MONGO_URI=mongodb://root:pass@mongo:27017
DB_NAME=TickBoard
JWT_SECRET=supersecret_change_me
```

- `frontend/.env`:

```
REACT_APP_GIN_API_BASE=/
# For local dev without a reverse proxy (frontend dev server → API):
# REACT_APP_GIN_API_BASE=http://localhost:8082
```


## Local Development

Recommended (no Compose): run Mongo in Docker, run API and frontend locally.

1) Run MongoDB locally with Docker (exposes 27017):

```
docker run -d --name mongo \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=pass \
  mongo:6
```

2) Start API (loads `gin-api/.env`). If using the Mongo container above, set `MONGO_URI=mongodb://root:pass@localhost:27017` in `gin-api/.env`:

```
cd gin-api
go run .
```

3) Start frontend (points to the API):

```
cd frontend
REACT_APP_GIN_API_BASE=http://localhost:8082 npm start
```

Local URLs: frontend `http://localhost:3000`, API `http://localhost:8082/health`, Swagger `http://localhost:8082/swagger/index.html`.


## Docker (manual)

- Build images matching CI:

```
docker build -t local/gin-api -f gin-api/Dockerfile gin-api
docker build -t local/frontend -f frontend/Dockerfile frontend
```

- Run API image (with a Mongo container on a user network):

```
docker network create ticknet || true
docker run -d --name mongo --network ticknet \
  -e MONGO_INITDB_ROOT_USERNAME=root -e MONGO_INITDB_ROOT_PASSWORD=pass \
  mongo:6

docker run -d --name gin-api --network ticknet -p 8082:8082 \
  -e PORT=8082 \
  -e MONGO_URI=mongodb://root:pass@mongo:27017 \
  -e DB_NAME=TickBoard \
  -e JWT_SECRET=supersecret_change_me \
  local/gin-api
```

- Frontend image serves static on `:3000`. If you need it to call the API on `localhost:8082`, build the app with `REACT_APP_GIN_API_BASE=http://localhost:8082` before serving (for day-to-day dev, the `npm start` approach above is simpler).


## CI/CD (Harbor)

- Workflow: `.github/workflows/harbor-push.yml`
- Builds two images and pushes on `main` and tags `v*`; PRs/feature branches build only.
- Image names:
  - API: `${HARBOR_REGISTRY}/${HARBOR_PROJECT}/gin-api`
  - Frontend: `${HARBOR_REGISTRY}/${HARBOR_PROJECT}/frontend`
- Required repo secrets: `HARBOR_REGISTRY`, `HARBOR_PROJECT`, `HARBOR_USERNAME`, `HARBOR_PASSWORD`

Notes:
- Ensure the Harbor project exists and credentials can push.
- Adjust tag/name logic in the “Derive tags” step if needed.

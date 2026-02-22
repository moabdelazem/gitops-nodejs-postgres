# Items API

This is a small Node.js + Express API for managing items in PostgreSQL.

If you just want to run it quickly:

1. Start Postgres
2. Run migrations
3. Start the API
4. Call `/api/items`

## Quick start (local)

From the `app` folder:

```bash
npm install
npm run compose:up
npm run migrate:up
npm run dev
```

The API will be available at:

`http://localhost:6767`

To stop the local DB:

```bash
npm run compose:down
```

## Run full stack with root compose

From the project root, there is also a full `docker-compose.yml` that runs the full app

Run:

```bash
docker compose up --build
```

API URL is still:

`http://localhost:6767`

## Environment variables

Example `.env`:

```env
PORT=6767
NODE_ENV=development
DATABASE_URL=postgresql://devuser:devpass@localhost:5432/devdb
```

## API endpoints

### Health

- `GET /health/live`
- `GET /health/ready`

### Items

Base path: `/api/items`

- `GET /api/items` -> list all items
- `GET /api/items/:id` -> get one item
- `POST /api/items` -> create item
- `PATCH /api/items/:id` -> update item
- `DELETE /api/items/:id` -> delete item

## Request examples

Create item:

```bash
curl -X POST http://localhost:6767/api/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Keyboard","description":"Mechanical keyboard"}'
```

List items:

```bash
curl http://localhost:6767/api/items
```

Get item by id:

```bash
curl http://localhost:6767/api/items/1
```

Update item:

```bash
curl -X PATCH http://localhost:6767/api/items/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Keyboard v2"}'
```

Delete item:

```bash
curl -X DELETE http://localhost:6767/api/items/1
```

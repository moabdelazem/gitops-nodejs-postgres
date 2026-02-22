#!/usr/bin/env bash

set -u

BASE_URL="${BASE_URL:-http://localhost:6767}"
ITEMS_URL="$BASE_URL/api/items"

PASS_COUNT=0
FAIL_COUNT=0
LAST_BODY=""
LAST_STATUS=""

log() {
  printf '%s\n' "$*"
}

pass() {
  PASS_COUNT=$((PASS_COUNT + 1))
  log "[PASS] $1"
}

fail() {
  FAIL_COUNT=$((FAIL_COUNT + 1))
  log "[FAIL] $1"
  if [ -n "$LAST_BODY" ]; then
    log "       body: $LAST_BODY"
  fi
}

request() {
  local method="$1"
  local url="$2"
  local data="${3:-}"
  local body_file
  local code

  body_file="$(mktemp)"

  if [ -n "$data" ]; then
    code="$(curl -sS -o "$body_file" -w "%{http_code}" -X "$method" "$url" -H "Content-Type: application/json" -d "$data")"
  else
    code="$(curl -sS -o "$body_file" -w "%{http_code}" -X "$method" "$url")"
  fi

  LAST_BODY="$(cat "$body_file")"
  rm -f "$body_file"

  LAST_STATUS="$code"
}

expect_status() {
  local title="$1"
  local expected="$2"
  local method="$3"
  local url="$4"
  local data="${5:-}"

  request "$method" "$url" "$data"

  if [ "$LAST_STATUS" = "$expected" ]; then
    pass "$title (expected=$expected, actual=$LAST_STATUS)"
  else
    fail "$title (expected=$expected, actual=$LAST_STATUS)"
  fi
}

extract_id() {
  # Extracts first numeric "id" field from JSON body
  printf '%s' "$1" | sed -n 's/.*"id"[[:space:]]*:[[:space:]]*\([0-9][0-9]*\).*/\1/p' | head -n1
}

check_server() {
  local code
  request "GET" "$BASE_URL/health/live"
  if [ "$LAST_STATUS" != "200" ]; then
    log "API does not seem reachable at $BASE_URL (GET /health/live => $LAST_STATUS)."
    log "Start server first, e.g. in another terminal: npm --prefix app run dev"
    exit 1
  fi
}

main() {
  local create_code
  local created_id

  log "Testing API at: $BASE_URL"
  check_server

  expect_status "Health live" "200" "GET" "$BASE_URL/health/live"
  expect_status "List items (initial)" "200" "GET" "$ITEMS_URL"

  # Create valid item
  request "POST" "$ITEMS_URL" '{"name":"first item","description":"smoke test"}'
  create_code="$LAST_STATUS"
  if [ "$create_code" = "201" ]; then
    created_id="$(extract_id "$LAST_BODY")"
    if [ -n "$created_id" ]; then
      pass "Create item returns 201 with id=$created_id"
    else
      fail "Create item returns 201 but response id missing"
    fi
  else
    fail "Create item (expected=201, actual=$create_code)"
  fi

  # CRUD flow using created id
  if [ -n "${created_id:-}" ]; then
    expect_status "Get item by id" "200" "GET" "$ITEMS_URL/$created_id"
    expect_status "Patch item by id" "200" "PATCH" "$ITEMS_URL/$created_id" '{"name":"updated item"}'
    expect_status "Delete item by id" "204" "DELETE" "$ITEMS_URL/$created_id"
    expect_status "Get deleted item" "404" "GET" "$ITEMS_URL/$created_id"
  fi

  # Corner cases
  expect_status "Invalid id format (string)" "400" "GET" "$ITEMS_URL/not-a-number"
  expect_status "Invalid id value (0)" "400" "GET" "$ITEMS_URL/0"
  expect_status "Create with missing name" "400" "POST" "$ITEMS_URL" '{"description":"missing name"}'
  expect_status "Create with empty name" "400" "POST" "$ITEMS_URL" '{"name":"   "}'
  expect_status "Patch with empty body" "400" "PATCH" "$ITEMS_URL/1" '{}'
  expect_status "Patch non-existing item" "404" "PATCH" "$ITEMS_URL/999999" '{"name":"ghost"}'
  expect_status "Delete non-existing item" "404" "DELETE" "$ITEMS_URL/999999"

  # Boundary length checks
  expect_status "Create with too long name (>255)" "400" "POST" "$ITEMS_URL" "{\"name\":\"$(printf 'a%.0s' {1..256})\"}"
  expect_status "Create with too long description (>2000)" "400" "POST" "$ITEMS_URL" "{\"name\":\"ok\",\"description\":\"$(printf 'b%.0s' {1..2001})\"}"

  log ""
  log "Summary: PASS=$PASS_COUNT FAIL=$FAIL_COUNT"

  if [ "$FAIL_COUNT" -gt 0 ]; then
    exit 1
  fi
}

main "$@"

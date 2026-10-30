#!/usr/bin/env bash
# Smoke check for the site: every key route answers 200 and llms.txt is fully rendered.
# Usage: tools/smoke_site.sh <base-url> [--allow-missing-llms]
# Example: tools/smoke_site.sh https://nghorbani.github.io
set -u
base="${1:?usage: tools/smoke_site.sh <base-url> [--allow-missing-llms]}"
allow_missing_llms="${2:-}"
base="${base%/}"
fail=0
llms_code=""

check() {
  local path="$1" code
  code=$(curl -s --max-time 20 -o /dev/null -w '%{http_code}' "$base$path")
  if [ "$path" = "/llms.txt" ]; then llms_code="$code"; fi
  if [ "$code" = "200" ]; then
    echo "ok   $path"
  elif [ "$path" = "/llms.txt" ] && [ "$allow_missing_llms" = "--allow-missing-llms" ] && [ "$code" = "404" ]; then
    echo "skip $path ($code, allowed)"
  else
    echo "FAIL $path -> $code"
    fail=1
  fi
}

for path in / /cv/ /publications/ /news/ /blog/ /blog/2026/hsi-industry-2026-graz/ /robots.txt /llms.txt /user-agreements-skill/disclaimer/; do
  check "$path"
done

if [ "$llms_code" = "200" ]; then
  body=$(curl -s --max-time 20 "$base/llms.txt")
  if printf '%s' "$body" | grep -q -E '\{\{|\{%|<[a-zA-Z/]'; then
    echo "FAIL /llms.txt contains raw Liquid or HTML"
    fail=1
  elif ! printf '%s' "$body" | grep -q '^## News'; then
    echo "FAIL /llms.txt has no News section"
    fail=1
  else
    echo "ok   /llms.txt rendered"
  fi
fi

if [ "$fail" = 0 ]; then echo "SMOKE PASS $base"; else echo "SMOKE FAIL $base"; fi
exit "$fail"

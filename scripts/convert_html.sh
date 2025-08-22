#!/bin/bash

# Run relative to /scripts
cd "$(dirname "$0")"

for file in ../articles/*.md; do
  out="${file%.md}.html"

  # Delete file if it already exists
  [ -f "$out" ] && rm "$out"

  # Generate new html files
  pandoc --standalone --template ../articles/article_template.html "$file" -o "$out"
done

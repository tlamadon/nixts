#!/usr/bin/env bash
# Scrape all home-manager options from the official documentation

set -e

OUTPUT_FILE="src/homemanager/data/homemanager-options.json"

echo "Scraping home-manager options from official documentation..."

# Download and parse the options page
curl -sL "https://nix-community.github.io/home-manager/options.xhtml" 2>/dev/null | \
  grep -o 'id="opt-[^"]*"' | \
  sed 's/id="opt-//; s/"$//' | \
  sed 's/_name_/<name>/g' | \
  sort -u | \
  jq -R -s 'split("\n") | map(select(length > 0))' > "$OUTPUT_FILE"

OPTION_COUNT=$(jq 'length' "$OUTPUT_FILE")

echo "✓ Successfully scraped $OPTION_COUNT home-manager options!"
echo "✓ Saved to $OUTPUT_FILE"

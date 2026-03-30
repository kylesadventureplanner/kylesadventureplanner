#!/bin/bash

API_KEY="AIzaSyCwkOvyiQyJkiaCWkZUEP2PJGaWhk-HYXc"

echo "Starting Google Place ID validation..."
echo ""

while read PLACE_ID; do
  if [[ -z "$PLACE_ID" ]]; then
    continue
  fi

  echo "Checking: $PLACE_ID"

  RESPONSE=$(curl -s "https://maps.googleapis.com/maps/api/place/details/json?place_id=$PLACE_ID&key=$API_KEY")

  STATUS=$(echo "$RESPONSE" | jq -r '.status')
  NEW_ID=$(echo "$RESPONSE" | jq -r '.result.place_id // empty')

  echo "Status: $STATUS"
  if [[ "$NEW_ID" != "" ]]; then
    echo "Canonical Place ID: $NEW_ID"
  fi

  echo "-----"
done < place_ids.txt

#!/bin/bash
# Auto-save script for Master File project

echo "📦 Saving to GitHub..."
git add .
git commit -m "Auto-save: $(date '+%Y-%m-%d %H:%M:%S')"
git push origin main
echo "✅ Saved successfully!"

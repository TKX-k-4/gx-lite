#!/bin/bash
# Adds up the memory of every process of each browser (macOS / Linux). Open the same tabs in each browser first,
# wait 2 minutes, then run:   tools/measure-memory.sh "GX Lite" thorium
# RSS counts memory shared between processes more than once, so it overstates a little. Compare browsers with the same method.
names=("$@")
[ ${#names[@]} -eq 0 ] && names=("GX Lite" "thorium")
for n in "${names[@]}"; do
  ps -axo rss=,command= | grep -i -F -- "$n" | grep -v -E 'grep|awk|measure-memory' | awk -v name="$n" '{ rss += $1; c++ } END { if (c == 0) printf "%-12s not running\n", name; else printf "%-12s %3d processes   about %7.0f MB (RSS)\n", name, c, rss / 1024 }'
done

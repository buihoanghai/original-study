#!/usr/bin/env bash
set -euo pipefail

YEAR="${1:-2024}"
TARGET_COMMITS=120
TIMEZONE="+0700"
TRACK_FILE="simulation-history1.log"

git rev-parse --is-inside-work-tree >/dev/null

declare -A days_by_week
weeks=()

# Gom các ngày Thứ 2–Thứ 6 của tháng 4–5 theo tuần ISO.
for month in 10 11 12; do
  last_day=$(date -d "$YEAR-$month-01 +1 month -1 day" +%d)

  for day in $(seq -w 1 "$last_day"); do
    date_value="$YEAR-$month-$day"
    weekday=$(date -d "$date_value" +%u)

    if (( weekday <= 5 )); then
      week_key=$(date -d "$date_value" +%G-W%V)

      if [[ -z "${days_by_week[$week_key]+x}" ]]; then
        weeks+=("$week_key")
        days_by_week["$week_key"]=""
      fi

      days_by_week["$week_key"]+="$date_value "
    fi
  done
done

# Tạo lịch: mỗi tuần bỏ ngẫu nhiên 1 hoặc 2 ngày.
# Lặp lại nếu số ngày còn lại không đủ để chứa 90 commit (tối đa 3/ngày).
while true; do
  active_days=()

  for week_key in "${weeks[@]}"; do
    read -r -a week_days <<< "${days_by_week[$week_key]}"
    day_count="${#week_days[@]}"

    skip_count=$(( 1 + RANDOM % 2 ))
    (( skip_count > day_count - 1 )) && skip_count=$(( day_count - 1 ))

    declare -A skip_indexes=()

    while (( ${#skip_indexes[@]} < skip_count )); do
      skip_indexes[$(( RANDOM % day_count ))]=1
    done

    for index in "${!week_days[@]}"; do
      if [[ -z "${skip_indexes[$index]+x}" ]]; then
        active_days+=("${week_days[$index]}")
      fi
    done

    unset skip_indexes
  done

  # 1–3 commit/ngày: cần ít nhất ceil(90 / 3) = 30 ngày.
  if (( ${#active_days[@]} * 3 >= TARGET_COMMITS )); then
    break
  fi
done

declare -A commits_per_day

# Mỗi ngày có ít nhất 1 commit.
for date_value in "${active_days[@]}"; do
  commits_per_day["$date_value"]=1
done

remaining=$(( TARGET_COMMITS - ${#active_days[@]} ))

# Phân bổ ngẫu nhiên commit thứ 2 hoặc 3 cho đến đủ 90.
while (( remaining > 0 )); do
  index=$(( RANDOM % ${#active_days[@]} ))
  date_value="${active_days[$index]}"

  if (( commits_per_day["$date_value"] < 3 )); then
    commits_per_day["$date_value"]=$(( commits_per_day["$date_value"] + 1 ))
    remaining=$(( remaining - 1 ))
  fi
done

commit_number=0

for date_value in "${active_days[@]}"; do
  count="${commits_per_day[$date_value]}"

  for _ in $(seq 1 "$count"); do
    hour=$(printf '%02d' $(( 9 + RANDOM % 10 )))
    minute=$(printf '%02d' $(( RANDOM % 60 )))
    second=$(printf '%02d' $(( RANDOM % 60 )))
    timestamp="${date_value}T${hour}:${minute}:${second}${TIMEZONE}"

    commit_number=$(( commit_number + 1 ))

    printf '%s | simulated commit %03d\n' \
      "$timestamp" "$commit_number" >> "$TRACK_FILE"

    git add -f "$TRACK_FILE"

    GIT_AUTHOR_DATE="$timestamp" \
    GIT_COMMITTER_DATE="$timestamp" \
    git commit --no-verify --date="$timestamp" \
      -m "chore(demo): simulated progress #$commit_number" \
      --quiet
  done
done

echo "Đã tạo $TARGET_COMMITS commits trong 04–05/$YEAR."
echo "Đã bỏ ngẫu nhiên 1–2 ngày làm việc mỗi tuần."
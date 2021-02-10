# scorebox-cross-country
Timing and broadcast overlay system for cross country events.

## Objects

### Runner Object
A runner object represents all the data ScoreBox has for an individual runner.
```json
{
    "runner_index": int,
    "jersey": int,
    "team": string,
    "start": UNIX Timestamp (milliseconds),
    "mile_one": UNIX Timestamp (milliseconds),
    "mile_two": UNIX Timestamp (milliseconds),
    "finish": UNIX Timestamp (milliseconds),
}
```
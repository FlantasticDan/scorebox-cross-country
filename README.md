# scorebox-cross-country
Timing and broadcast overlay system for cross country events.

## Objects

### Runner Object
A runner object represents all the data ScoreBox has for an individual runner.
```json
{
    "runner_index": int,
    "jersey": int,
    "name": string,
    "team": string,
    "heat": int,
    "start": UNIX Timestamp (milliseconds),
    "splits": [UNIX Timestamp (milliseconds)],
    "finish": UNIX Timestamp (milliseconds),
}
```

## Building
Stupidly useful pyinstaller spec mod:
```
datas=[('templates', 'templates'), ('static', 'static')],
hiddenimports=[
    'engineio.async_drivers.eventlet',
    'eventlet.hubs.epolls',
    'eventlet.hubs.kqueue',
    'eventlet.hubs.selects',
    'dns.dnssec',
    'dns.e164',
    'dns.hash',
    'dns.namedict',
    'dns.tsigkeyring',
    'dns.update',
    'dns.version',
    'dns.zone'
    ],
```

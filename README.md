1. Go [here](https://developers.google.com/calendar/quickstart/nodejs) and press `Enable the Google Calendar API` or create an application through `https://console.developers.google.com`.
1. Save `credentials.json` at `.conf`
1. Run `$ ./run events [calendar-id]`, for example `$ ./run events your.name@gmail.com`

The first time you run this you'll need to get an access token:

```
Authorize this app by visiting this url:

 https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcalendar.readonly&response_type=code&client_id=815400332127-ia0u6ji2ccm6psiouega9t5boj1l937t.apps.googleusercontent.com&redirect_uri=urn%3Aietf%3Awg%3Aoauth%3A2.0%3Aoob


Enter the code from that page here:

```

You only have to do this once, from then on it uses a token stored at `.conf/token.json`.

You can safely ignore the `This app isn't verified` error.

# Usage

## Force build

```
BUILD=1 ./run
```

## List the next 10 events in calendar

```
./run events gggabcdef@group.calendar.google.com
```

## List Events for the next n days

```
./run events gggabcdef@group.calendar.google.com -d 21
```
# lightkeeper

Averages multiple successive Lighthouse tests to arrive at a more accurate PageSpeed score.

![](https://p-9WF55W9.t1.n0.cdn.getcloudapp.com/items/JrugjBNG/Screen%20Recording%202020-09-25%20at%2003.45.03%20PM.gif?v=3a92e061a0b189833f415cfa7b3ad8be)

## Usage

```
$ npm install --global @bkwld/lightkeeper
$ lightkeeper https://yourdomain.com
```

The results will be something like this:

```
Mobile Results
┌─────┬───────┬───────┬───────┬───────┬───────┬───────┬───────┐
│     │ Score │ FCP   │ SI    │ LCP   │ TTI   │ TBT   │ CLS   │
├─────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┤
│ #1  │ 57    │ 3.8s  │ 5s    │ 6.2s  │ 5.6s  │ 328ms │ 0     │
├─────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┤
│ #2  │ 66    │ 2.5s  │ 3.5s  │ 5.5s  │ 5.2s  │ 406ms │ 0.005 │
├─────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┤
│ #3  │ 70    │ 2.5s  │ 3.5s  │ 5.4s  │ 5s    │ 307ms │ 0     │
├─────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┤
│ AVG │ 64.3  │ 2.9s  │ 4s    │ 5.7s  │ 5.3s  │ 347ms │ 0.002 │
├─────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┤
│ SD  │ 5.4   │ 646ms │ 719ms │ 354ms │ 263ms │ 42ms  │ 0.002 │
└─────┴───────┴───────┴───────┴───────┴───────┴───────┴───────┘
```

The summary rows (which can be exclusive returned with the `-s` option) contain the following rows:

- `AVG` - The [statistical mean](https://en.wikipedia.org/wiki/Mean)
- `SD` - The [standard deviation](https://en.wikipedia.org/wiki/Standard_deviation)

#### Options

From `lightkeeper --help`:

```
ARGUMENTS

  <url>                   The URL to test

OPTIONS

  -b, --block <urls>    Comma seperated URLs to block, wildcards allowed
  -d, --desktop         Test only desktop
  -m, --mobile          Test only mobile
  -s, --summary         Only show summary rows
  -t, --times <count>   The number of tests to run
                        default: 10
```

For example:

- `lightkeeper https://www.bukwild.com` - Runs 10 desktop and 10 mobile tests
- `lightkeeper https://www.bukwild.com -m -t=30 -b=googletagmanager` - Runs 30 mobile tests while blocking Google Tag Manager
- `lightkeeper https://www.bukwild.com -ms -t=100 && say "All done"` - Runs 100 mobile tests and only show the summary at the end.  And says "All done" aloud on a Mac.

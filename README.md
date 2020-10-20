# lightkeeper

Averages multiple successive Lighthouse tests to arrive at a more accurate PageSpeed score.

![](https://p-9WF55W9.t1.n0.cdn.getcloudapp.com/items/JrugjBNG/Screen%20Recording%202020-09-25%20at%2003.45.03%20PM.gif?v=3a92e061a0b189833f415cfa7b3ad8be)

## Usage

```
$ npm install --global @bkwld/lightkeeper
$ lightkeeper https://yourdomain.com
```

#### Options

From `lightkeeper --help`:

```
ARGUMENTS

  <url>                   The URL to test

OPTIONS

  -d, --desktop           Test only desktop
  -m, --mobile            Test only mobile
  -t, --times <count>     The number of tests to run
                          default: 10
```

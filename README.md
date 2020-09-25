# lightkeeper

Averages multiple successive Lighthouse tests to arrive at a more accurate PageSpeed score.

![](https://p-9WF55W9.t1.n0.cdn.getcloudapp.com/items/6quPOpE9/Screen%20Recording%202020-09-25%20at%2003.14.39%20PM.gif?v=a5db4c59bd31d5a8aeaedeea818d8aaf)

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

    -b, --both              Test desktop and mobile
    -d, --desktop           Test desktop rather than mobile
    -t, --times <count>     The number of tests to run
                            default: 10
```

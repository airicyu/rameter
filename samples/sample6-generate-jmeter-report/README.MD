# Sample 2: Global Context

We support transforming the output result to jmeter CSV output format.

A good usage of this is to leverage jmeter to generate pretty static HTML report.

Read more: [Jmeter Generating Report Dashboard](https://jmeter.apache.org/usermanual/generating-dashboard.html)

-------

## Start Dummy Server

Before you start, run the dummy server to mock some HTTP endpoints
```
cd samples/dummyServer
npm start
```

## Install Sample

install command
```
cd samples/sample6-generate-jmeter-report
npm i
```

## Run Sample

```
cd samples/sample6-generate-jmeter-report
npm start
```

------

## Sample code: 
```javascript
const rameter = new Rameter();

......

/**
 * Trigger the load test
 */
await rameter.runUntilFinished(......)

/**
 * shutdown
 */
await rameter.down();

/**
 * Write Jmeter format CSV output
 * 
 * Read Rameter output file "./result.csv", and write jmeter format output "./result_jmeter.csv"
 */
await rameter.transformJmeterOut("./result.csv", "./result_jmeter.csv");

```
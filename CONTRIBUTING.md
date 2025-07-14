# Contributing

## Guidelines

- Unfortunately much of this repository (particularly the chart and calculation code) was generated with an LLM, so please do not expect the best code quality! Improvements are greatly appreciated.
- Your contributions are bound by the Unlicense! Do not submit any code that you do not own.

## Developing

Install dependencies:
```
pnpm install
```

Adding JSON files locally:
```
pnpm wrangler r2 object put solarmon-test/monitor/UNIX_TIMESTAMP.json --file ~/Documents/UNIX_TIMESTAMP.json --local
```
(omit the --local flag to add files to your R2 bucket.)

Using a remote R2 bucket during development:
```
pnpm dev --remote
```

[![Code Checks](https:/marketplace/web-client/actions/workflows/checks.yaml/badge.svg)](https:/marketplace/web-client/actions?workflow=checks.yaml)
[![Dev Deploy](https:/marketplace/web-client/actions/workflows/deploy-dev.yaml/badge.svg)](https:/marketplace/web-client/actions?workflow=deploy-dev.yaml)
[![Demo Deploy](https:/marketplace/web-client/actions/workflows/deploy-demo.yaml/badge.svg)](https:/marketplace/web-client/actions?workflow=deploy-demo.yaml)

# Marketplace/web-client

Web client for Inclusio Marketplace

### Development

Clone repository:

    git clone git@git.inclusioproject.com:marketplace/web-client.git

Login to NPM server:

    npm adduser --registry https://npm.inclusioproject.com/

Set NPM to always authenticate:

    npm config set always-auth true

Install depenedencies:

	npm install

Build:

	npm run dev

Ensure commits lint without any issue via `npm run lint`.

Commits to the `dev` branch will auto-deploy to https://market.inclusio.dev


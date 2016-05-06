#!/usr/bin/env node

var Updater = require("../lib/updater").default;

var githubToken = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
if (!githubToken) {
  console.error("Error: No github token is set");
  process.exit(1);
}

(new Updater({ githubToken: githubToken }))
.execute()
.catch(err => {
  console.error("Error: Failed to update", err);
  process.exit(1);
});

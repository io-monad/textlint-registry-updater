export default {
  githubToken: null,
  githubRepo: "io-monad/textlint-registry",
  issueLabel: "updater",
  issueTitle: "Update schema for <%= name %>",
  issueBody: `Update schema for [<%= name %>](https://www.npmjs.com/package/<%= name %>).

<% if (oldVersion) { %>
:up: [<%= name %>](https://www.npmjs.com/package/<%= name %>) v<%= oldVersion %> => v<%= newVersion %>
<% } else { %>
:new: [<%= name %>](https://www.npmjs.com/package/<%= name %>) v<%= newVersion %>
<% } %>

----
:information_source: This issue is opened by [textlint-registry-updater](https://github.com/io-monad/textlint-registry-updater).
`,
  schemaListURL: "https://raw.githubusercontent.com/io-monad/textlint-registry/master/schemas-list.json",
  ruleSearchURL: "http://npmsearch.com/query?q=name:textlint%20AND%20name:rule&fields=name,version&size=300",
  ignoreList: [
    "textlint-rule-helper",
    "spellcheck-tech-word-textlint-rule",
    "textlint-rule-spellcheck-growthbeat-word",
    "textlint-filter-rule-comments"
  ]
};

import _ from "lodash";
import axios from "axios";
import semver from "semver";
import defaultOptions from "./default-options";
import UpdateIssue from "./update-issue";

export default class Updater {
  constructor(options) {
    options = _.defaults(options, defaultOptions);
    this.updateIssue = new UpdateIssue(options);
    this.schemaListURL = options.schemaListURL;
    this.ruleSearchURL = options.ruleSearchURL;
    this.ignoreList = new Set(options.ignoreList || []);
  }

  execute() {
    return Promise.all([
      this.getSchemaList(),
      this.getNewVersions(),
    ])
    .then(([schemaList, newVersions]) => this.findUpdates(schemaList, newVersions))
    .then((updates) => {
      this.showUpdates(updates);
      return this.createIssues(updates);
    });
  }

  getSchemaList() {
    return axios.get(this.schemaListURL).then(res => res.data);
  }

  getNewVersions() {
    return axios.get(this.ruleSearchURL).then(res =>
      _.transform(res.data.results, (acc, result) => {
        acc[result.name[0]] = result.version[0];
      }, {})
    );
  }

  findUpdates(schemaList, newVersions) {
    return _.flatMap(newVersions, (newVersion, name) => {
      // Skip ignored
      if (this.ignoreList.has(name)) return [];

      if (schemaList[name]) {
        // Updated if minor version is changed
        const oldVersion = schemaList[name].version;
        const stay = semver.satisfies(newVersion, `~${oldVersion}`);
        return stay ? [] : [{ name, newVersion, oldVersion }]
      } else {
        // New rule
        return [{ name, newVersion, oldVersion: null }];
      }
    });
  }

  showUpdates(updates) {
    if (updates.length === 0) {
      console.info("No updates found");
    } else {
      console.info(`Found ${updates.length} updates`);
      updates.forEach(({ name, newVersion, oldVersion }) => {
        console.info(`  * ${name}: ${oldVersion || "(none)"} => ${newVersion}`);
      });
    }
  }

  createIssues(updates) {
    if (updates.length === 0) return Promise.resolve();

    console.info(`Creating ${updates.length} issues`);
    return new Promise((resolve, reject) => {
      const queue = _.clone(updates);
      const next = () => {
        const update = queue.shift();
        if (update) {
          console.info(`Creating a issue for ${update.name}`);
          this.updateIssue.createOrUpdate(update)
          .then(issue => {
            console.info(`  Success => ${issue.url}`);
            setImmediate(next);
          })
          .catch(reject);
        } else {
          resolve();
        }
      };
      next();
    });
  }
}

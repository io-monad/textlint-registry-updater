import _ from "lodash";
import octonode from "octonode";

function promisify(fn) {
  return new Promise((resolve, reject) => {
    fn((err, result) => err ? reject(err) : resolve(result));
  });
}

export default class UpdateIssue {
  constructor({ githubRepo, githubToken, issueLabel, issueTitle, issueBody }) {
    this.githubRepo = githubRepo;
    this.client = octonode.client(githubToken);
    this.repo = this.client.repo(this.githubRepo);
    this.issueLabel = issueLabel;
    this.issueTitleTemplate = _.template(issueTitle);
    this.issueBodyTemplate = _.template(issueBody);
  }

  createOrUpdate(update) {
    return this.findExistIssue(update).then(issue => {
      if (issue) {
        return this.update(issue, update);
      } else {
        return this.create(update);
      }
    });
  }

  create(update) {
    return promisify(cb => {
      this.repo.issue({
        title: this.issueTitleTemplate(update),
        body: this.issueBodyTemplate(update),
        labels: [this.issueLabel],
      }, cb);
    });
  }

  update(issue, update) {
    const title = this.issueTitleTemplate(update);
    const body = this.issueBodyTemplate(update);
    if (title === issue.title && body === issue.body) {
      return Promise.resolve(issue);
    }

    return promisify(cb => {
      this.client.issue(this.githubRepo, issue.id).update({ title, body }, cb);
    });
  }

  findExistIssue(update) {
    const title = this.issueTitleTemplate(update);
    return this.getIssues().then(issues => _.find(issues, ["title", title]));
  }

  getIssues() {
    if (!this.issuesPromise) {
      this.issuesPromise = promisify(cb => {
        this.repo.issues({ labels: this.issueLabel }, cb);
      });
    }
    return this.issuesPromise;
  }
}

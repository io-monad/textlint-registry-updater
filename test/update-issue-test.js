import assert from "power-assert";
import sinon from "sinon";
import UpdateIssue from "../src/update-issue";

describe("UpdateIssue", () => {
  let updateIssue;
  let repoIssuesStub;
  let createIssueStub;
  let issueClientStub;
  let updateIssueStub;
  beforeEach(() => {
    updateIssue = new UpdateIssue({
      githubRepo: "io-monad/test",
      githubToken: "123abc",
      issueLabel: "testing",
      issueTitle: "Test issue title for <%= name %>",
      issueBody: "Test issue body for <%= name %> <%= oldVersion || '(none)' %> to <%= newVersion %>",
    });

    repoIssuesStub = sinon.stub(updateIssue.repo, "issues");
    createIssueStub = sinon.stub(updateIssue.repo, "issue");
    issueClientStub = sinon.stub(updateIssue.client, "issue")
      .withArgs("io-monad/test", 123).returns({
        update: updateIssueStub = sinon.stub(),
      });
  });

  describe("#createOrUpdate", () => {
    context("with no existing issue", () => {
      const createdIssue = { id: 1, url: "http://example.com/issue" };
      beforeEach(() => {
        repoIssuesStub.yields(null, []);
        createIssueStub.yields(null, createdIssue);
      });

      it("creates a new issue", () => {
        return updateIssue.createOrUpdate(
          { name: "test-rule", oldVersion: "1.0.0", newVersion: "1.1.0" }
        ).then(resolved => {
          assert(resolved === createdIssue);
          assert(createIssueStub.calledOnce === true);
          assert.deepEqual(createIssueStub.args[0][0], {
            title: "Test issue title for test-rule",
            body: "Test issue body for test-rule 1.0.0 to 1.1.0",
            labels: ["testing"],
          });
        });
      });
    });

    context("with existing issue", () => {
      const updatedIssue = { id: 1, url: "http://example.com/issue" };
      beforeEach(() => {
        repoIssuesStub.yields(null, [{
          id: 123,
          title: "Test issue title for test-rule",
        }]);
        updateIssueStub.yields(null, updatedIssue);
      });

      it("updates the issue", () => {
        return updateIssue.createOrUpdate(
          { name: "test-rule", oldVersion: "1.0.0", newVersion: "1.2.0" }
        ).then(resolved => {
          assert(resolved === updatedIssue);
          assert(updateIssueStub.calledOnce === true);
          assert.deepEqual(updateIssueStub.args[0][0], {
            title: "Test issue title for test-rule",
            body: "Test issue body for test-rule 1.0.0 to 1.2.0",
          });
        });
      });
    });
  });
});

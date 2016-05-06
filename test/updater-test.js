import assert from "power-assert";
import sinon from "sinon";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import Updater from "../src/updater";

describe("Updater", () => {
  let mock;
  before(() => {
    mock = new MockAdapter(axios);
    mock.onGet("http://example.com/schema-list.json").reply(200, {
      "textlint-rule-patch": { version: "1.0.0" },
      "textlint-rule-minor": { version: "2.0.0" },
      "textlint-rule-major": { version: "3.0.0" },
    });
    mock.onGet("http://example.com/search.json").reply(200, {
      results: [
        { name: ["textlint-rule-patch"], version: ["1.0.1"] },
        { name: ["textlint-rule-minor"], version: ["2.1.0"] },
        { name: ["textlint-rule-major"], version: ["4.0.0"] },
        { name: ["textlint-rule-new"], version: ["1.0.0"] },
        { name: ["textlint-rule-ignore"], version: ["1.0.0"] },
      ]
    });
  });

  let updater;
  let issueStub;
  beforeEach(() => {
    updater = new Updater({
      schemaListURL: "http://example.com/schema-list.json",
      ruleSearchURL: "http://example.com/search.json",
      ignoreList: ["textlint-rule-ignore"],
    });

    issueStub = sinon.stub(updater.updateIssue, "createOrUpdate")
      .returns(Promise.resolve({ url: "http://example.com/issue" }));
  });

  describe("#execute", () => {
    it("creates issues for new versions without patch", () => {
      const infoStub = sinon.stub(console, "info");
      return updater.execute().then(() => {
        infoStub.restore();
        assert(issueStub.callCount === 3);
        assert.deepEqual(issueStub.args[0][0], {
          name: "textlint-rule-minor",
          oldVersion: "2.0.0",
          newVersion: "2.1.0",
        });
        assert.deepEqual(issueStub.args[1][0], {
          name: "textlint-rule-major",
          oldVersion: "3.0.0",
          newVersion: "4.0.0",
        });
        assert.deepEqual(issueStub.args[2][0], {
          name: "textlint-rule-new",
          oldVersion: null,
          newVersion: "1.0.0",
        });
      });
    });
  });
});

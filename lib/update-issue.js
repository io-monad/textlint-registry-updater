"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _octonode = require("octonode");

var _octonode2 = _interopRequireDefault(_octonode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function promisify(fn) {
  return new _promise2.default(function (resolve, reject) {
    fn(function (err, result) {
      return err ? reject(err) : resolve(result);
    });
  });
}

var UpdateIssue = function () {
  function UpdateIssue(_ref) {
    var githubRepo = _ref.githubRepo;
    var githubToken = _ref.githubToken;
    var issueLabel = _ref.issueLabel;
    var issueTitle = _ref.issueTitle;
    var issueBody = _ref.issueBody;
    (0, _classCallCheck3.default)(this, UpdateIssue);

    this.githubRepo = githubRepo;
    this.client = _octonode2.default.client(githubToken);
    this.repo = this.client.repo(this.githubRepo);
    this.issueLabel = issueLabel;
    this.issueTitleTemplate = _lodash2.default.template(issueTitle);
    this.issueBodyTemplate = _lodash2.default.template(issueBody);
  }

  (0, _createClass3.default)(UpdateIssue, [{
    key: "createOrUpdate",
    value: function createOrUpdate(update) {
      var _this = this;

      return this.findExistIssue(update).then(function (issue) {
        if (issue) {
          return _this.update(issue, update);
        } else {
          return _this.create(update);
        }
      });
    }
  }, {
    key: "create",
    value: function create(update) {
      var _this2 = this;

      return promisify(function (cb) {
        _this2.repo.issue({
          title: _this2.issueTitleTemplate(update),
          body: _this2.issueBodyTemplate(update),
          labels: [_this2.issueLabel]
        }, cb);
      });
    }
  }, {
    key: "update",
    value: function update(issue, _update) {
      var _this3 = this;

      var title = this.issueTitleTemplate(_update);
      var body = this.issueBodyTemplate(_update);
      if (title === issue.title && body === issue.body) {
        return _promise2.default.resolve(issue);
      }

      return promisify(function (cb) {
        _this3.client.issue(_this3.githubRepo, issue.id).update({ title: title, body: body }, cb);
      });
    }
  }, {
    key: "findExistIssue",
    value: function findExistIssue(update) {
      var title = this.issueTitleTemplate(update);
      return this.getIssues().then(function (issues) {
        return _lodash2.default.find(issues, ["title", title]);
      });
    }
  }, {
    key: "getIssues",
    value: function getIssues() {
      var _this4 = this;

      if (!this.issuesPromise) {
        this.issuesPromise = promisify(function (cb) {
          _this4.repo.issues({
            labels: _this4.issueLabel,
            state: "open"
          }, cb);
        });
      }
      return this.issuesPromise;
    }
  }]);
  return UpdateIssue;
}();

exports.default = UpdateIssue;
//# sourceMappingURL=update-issue.js.map
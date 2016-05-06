"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _setImmediate2 = require("babel-runtime/core-js/set-immediate");

var _setImmediate3 = _interopRequireDefault(_setImmediate2);

var _slicedToArray2 = require("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _set = require("babel-runtime/core-js/set");

var _set2 = _interopRequireDefault(_set);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _axios = require("axios");

var _axios2 = _interopRequireDefault(_axios);

var _semver = require("semver");

var _semver2 = _interopRequireDefault(_semver);

var _defaultOptions = require("./default-options");

var _defaultOptions2 = _interopRequireDefault(_defaultOptions);

var _updateIssue = require("./update-issue");

var _updateIssue2 = _interopRequireDefault(_updateIssue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Updater = function () {
  function Updater(options) {
    (0, _classCallCheck3.default)(this, Updater);

    options = _lodash2.default.defaults(options, _defaultOptions2.default);
    this.updateIssue = new _updateIssue2.default(options);
    this.schemaListURL = options.schemaListURL;
    this.ruleSearchURL = options.ruleSearchURL;
    this.ignoreList = new _set2.default(options.ignoreList || []);
  }

  (0, _createClass3.default)(Updater, [{
    key: "execute",
    value: function execute() {
      var _this = this;

      return _promise2.default.all([this.getSchemaList(), this.getNewVersions()]).then(function (_ref) {
        var _ref2 = (0, _slicedToArray3.default)(_ref, 2);

        var schemaList = _ref2[0];
        var newVersions = _ref2[1];
        return _this.findUpdates(schemaList, newVersions);
      }).then(function (updates) {
        _this.showUpdates(updates);
        return _this.createIssues(updates);
      });
    }
  }, {
    key: "getSchemaList",
    value: function getSchemaList() {
      return _axios2.default.get(this.schemaListURL).then(function (res) {
        return res.data;
      });
    }
  }, {
    key: "getNewVersions",
    value: function getNewVersions() {
      return _axios2.default.get(this.ruleSearchURL).then(function (res) {
        return _lodash2.default.transform(res.data.results, function (acc, result) {
          acc[result.name[0]] = result.version[0];
        }, {});
      });
    }
  }, {
    key: "findUpdates",
    value: function findUpdates(schemaList, newVersions) {
      var _this2 = this;

      return _lodash2.default.flatMap(newVersions, function (newVersion, name) {
        // Skip ignored
        if (_this2.ignoreList.has(name)) return [];

        if (schemaList[name]) {
          // Updated if minor version is changed
          var oldVersion = schemaList[name].version;
          var stay = _semver2.default.satisfies(newVersion, "~" + oldVersion);
          return stay ? [] : [{ name: name, newVersion: newVersion, oldVersion: oldVersion }];
        } else {
          // New rule
          return [{ name: name, newVersion: newVersion, oldVersion: null }];
        }
      });
    }
  }, {
    key: "showUpdates",
    value: function showUpdates(updates) {
      if (updates.length === 0) {
        console.info("No updates found");
      } else {
        console.info("Found " + updates.length + " updates");
        updates.forEach(function (_ref3) {
          var name = _ref3.name;
          var newVersion = _ref3.newVersion;
          var oldVersion = _ref3.oldVersion;

          console.info("  * " + name + ": " + (oldVersion || "(none)") + " => " + newVersion);
        });
      }
    }
  }, {
    key: "createIssues",
    value: function createIssues(updates) {
      var _this3 = this;

      if (updates.length === 0) return _promise2.default.resolve();

      console.info("Creating " + updates.length + " issues");
      return new _promise2.default(function (resolve, reject) {
        var queue = _lodash2.default.clone(updates);
        var next = function next() {
          var update = queue.shift();
          if (update) {
            console.info("Creating a issue for " + update.name);
            _this3.updateIssue.createOrUpdate(update).then(function (issue) {
              console.info("  Success => " + issue.url);
              (0, _setImmediate3.default)(next);
            }).catch(reject);
          } else {
            resolve();
          }
        };
        next();
      });
    }
  }]);
  return Updater;
}();

exports.default = Updater;
//# sourceMappingURL=updater.js.map
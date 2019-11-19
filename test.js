const plugin = require("./index.js");
const sinon = require("sinon");
const { factory, runTasks } = require("release-it/test/util");
const proxyquire = require("proxyquire");
const fs = require("fs");

const namespace = "conventional-changelog";
const preset = "angular";
const infile = "CHANGES.md";

const conventionalRecommendedBump = sinon.stub().callsFake((options, cb) => {
  if (options.preset === "angular") return cb(null, { releaseType: "minor" });
  cb(new Error("Something went wrong"));
});

const conventionalChangelog = sinon.stub().callsFake(options => {
  const s = new stream.Readable();
  s._read = () => {};
  process.nextTick(() => {
    s.emit("data", "The changelog");
    if (options.releaseCount < 0)
      s.emit("error", new Error("Something went wrong"));
    s.emit("end");
  });
  return s;
});

const Plugin = proxyquire(".", {
  "conventional-recommended-bump": conventionalRecommendedBump,
  "conventional-changelog": conventionalChangelog
});

describe("changelog pulgin", () => {
  it("should replace compare tag ", async () => {
    const options = { [namespace]: { preset, infile } };
    const plugin = factory(Plugin, { namespace, options });
    fs.writeFileSync(infile, "");

    plugin.getChangelog = jest
      .fn()
      .mockReturnValue(
        Promise.resolve(
          "# [0.10.0](https://devops.xxx.com/bitbucket/projects/OFM-NEXT/repos/xx/compare/0.0.5...0.10.0) (2019-11-19)"
        )
      );

    await runTasks(plugin);
    const changelog = fs.readFileSync(infile);
    expect(changelog.toString().trim()).toBe(
      "# [0.10.0](https://devops.xxx.com/bitbucket/projects/OFM-NEXT/repos/xx/compare/commits?targetBranch=refs%2Ftags%2F0.0.5&sourceBranch=refs%2Ftags%2F0.10.0) (2019-11-19)"
    );
    fs.unlinkSync(infile);
  });
});

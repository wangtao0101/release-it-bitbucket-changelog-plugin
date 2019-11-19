const Plugin = require('@release-it/conventional-changelog');

const compareRegexp = /\((https:\/\/.*?)\/compare\/(.*?)[.]{3}(.*?)\)/g;

class MyPlugin extends Plugin {
  async beforeRelease() {
    const { infile } = this.options;
    const { isDryRun } = this.global;
    const changelog = await this.getChangelog();

    compareRegexp.lastIndex = 0;
    const compareResult = compareRegexp.exec(changelog);

    let newChangeLog = '';

    if (compareResult != null) {
      newChangeLog = changelog.replace(
        compareRegexp,
        // eslint-disable-next-line
        `(${compareResult[1]}/compare/commits?targetBranch=refs%2Ftags%2F${compareResult[2]}&sourceBranch=refs%2Ftags%2F${compareResult[3]})`,
      );
    } else {
      newChangeLog = changelog;
    }

    this.debug({ changelog: newChangeLog });
    this.config.setContext({ changelog: newChangeLog });

    this.log.exec(`Writing changelog to ${infile}`, isDryRun);

    if (infile && !isDryRun) {
      await this.writeChangelog();
    }
  }
}

module.exports = MyPlugin;

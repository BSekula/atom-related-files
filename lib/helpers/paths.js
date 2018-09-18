'use babel';

const path = require('path');
const fs = require('fs');

export const parsePath = (pathToCrawl, cb) => {
  fs.readdir(pathToCrawl, (err, data) => {
    if (err) throw err;

    const resolvedPath = data.map(dir => new Promise((res, rej) => {
      const pathToCheck = path.join(pathToCrawl, dir);

      fs.lstat(pathToCheck, (error, stats) => {
        if (error) rej(error);

        res({
          name: dir,
          path: pathToCheck,
          isFile: stats.isFile(),
          isDirectory: stats.isDirectory(),
        });
      });
    }));

    Promise.all(resolvedPath).then((parseResult) => {
      cb(parseResult);

      const directories = parseResult.filter(dir => dir.isDirectory);
      directories.forEach((directory) => {
        this.parsePath(directory.path, cb);
      });
    });
  });
};

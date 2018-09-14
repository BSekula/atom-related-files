'use babel';

const path = require('path');
const fs = require('fs');

// const testPath = path.join(__dirname, 'testFolder');

export const parsePath = (pathToCrawl, cb) => {
  fs.readdir(pathToCrawl, (err, data) => {
    if (err) throw err;

    const resolvedPath = data.map((dir) => {
      return new Promise((res, rej) => {
        const pathToCheck = path.join(pathToCrawl, dir);

        fs.lstat(pathToCheck, (err, stats) => {
          if (err) rej(err);

          res({
            name: dir,
            path: pathToCheck,
            isFile: stats.isFile(),
            isDirectory: stats.isDirectory()
          });
        });
      });
    });

    Promise.all(resolvedPath).then((data) => {
      cb(data);

      const directories = data.filter(dir => dir.isDirectory);
      directories.forEach(directory => {
        parsePath(directory.path, cb);
      });
    })
  });
}

// module.exports = parsePath;
// parsePath(testPath, (data) => {
//   const files = data.filter(dir => dir.isFile);
//   files.forEach(file => console.log(file.name));
// });

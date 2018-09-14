'use babel';

export const getSearchedFile = () => {
  const absolutePath = atom.workspace.getActivePaneItem().buffer.file.path;

  const templateRegex = new RegExp('templates/components.*.hbs$');
  if (templateRegex.test(absolutePath)) {
    return 'isTemplate';
  }


  // if (this.getFileExtension(absolutePath) !== 'hbs') {
  //   atom.notifications.addWarning('Not .hbs file!!');
  //   return;
  // }
  //
  // const templateLastIndex = absolutePath.lastIndexOf('templates');
  //
  // // 21 - templates + / + components + /
  // // -4 - remove .hbs
  // const path = absolutePath.substring(templateLastIndex + 21, absolutePath.length - 4);
  // const regex = new RegExp('\{\{.*' + path, 'gm');
  // return regex;
  return absolutePath;
};

//
// export const = getFileExtension = (path) => {
//   const pathChunks = path.split('.');
//   return pathChunks[pathChunks.length - 1];
// },

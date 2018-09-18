'use babel';

const fs = require('fs');
const path = require('path');

import {
  OPTIONAL_SCHEMA,
  CONFIG_SCHEMA,
  REGEX_SCHEMA
} from './settings';

export const parseConfig = (configs) => {
  if (!configs) {
    atom.notifications.addWarning('Parse config failed, pleae check your config file');
    return false;
  }

  const parsedConfig = configs.map((configSet, index) => {
    Object.keys(configSet).forEach((key) => {
      const config = configSet[key];

      // Set labels for every config entry
      if (!config.label) {
        config.label = key;
      }

      // Change key for unique so we can merge these objects later
      configSet[`${key}_${index}`] = configSet[key];
      delete configSet[key];
    });

    return configSet;
  });

  // Merge all configs into one object
  const mergedConfig = parsedConfig.reduce((acumulatedConfig, nextConfig) =>
    ({ ...acumulatedConfig, ...nextConfig }), {});

  const mainKeys = Object.keys(mergedConfig);
  const mainKeyslength = mainKeys.length;

  let isSchemaOk = true;

  for (let j = 0; j < mainKeyslength; j++) {
    const testObject = mergedConfig[mainKeys[j]];
    const propertyKeys = Object.keys(testObject);
    const propertyLength = propertyKeys.length;

    for (let i = 0; i < propertyLength; i++) {
      CONFIG_SCHEMA.forEach((key) => { // eslint-disable-line no-loop-func
        if (!testObject[key]) {
          isSchemaOk = false;
          atom.notifications.addWarning(
            `Wrong config field for: ${mainKeys[j]} -> ${propertyKeys[i]} -> ${key}`,
          );
        } else {
          const schouldChangeToRegex = REGEX_SCHEMA.indexOf(key);
          if (schouldChangeToRegex >= 0) {
            testObject[key] = new RegExp(testObject[key]);
          }
        }
      });
    }
  }

  return isSchemaOk ? mergedConfig : null;
};

export const getConfigFile = async (rootDirectory, userConfig) => {
  const configReq = userConfig.pathToRegexs.map((pathToConfig) => {
    const filePath = path.resolve(rootDirectory, pathToConfig);

    return new Promise((res, rej) => {
      fs.readFile(filePath, 'utf8', (err, configData) => {
        if (err) {
          rej(err);
        } else {
          try {
            const parsedData = JSON.parse(configData);
            res(parsedData);
          } catch (error) {
            rej(error);
          }
        }
      });
    });
  });

  const configs = await Promise.all(configReq);

  return configs;
};

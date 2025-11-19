import fs from 'node:fs';
import { argv, env } from 'node:process';
import minimist from 'minimist';
import dotenv from 'dotenv';

dotenv.config({ path: ['.env.local', '.env'], override: true });

const processArg = minimist(argv.slice(2));

const isProd = env.NODE_ENV === 'production';
const isDev = !isProd;

const packageData = JSON.parse(fs.readFileSync('./package.json'));


const appData = {
  APP_IS_DEV: isDev,
  APP_IS_PROD: isProd,
  APP_MODE: isProd ? 'prod' : 'dev',

  APP_NAME: packageData.name,
  APP_NAME_FORMATTED: 'vALTe',
  APP_VERSION: packageData.version,

  APP_DESCRIPTION: packageData.description,
};

const envData = {};
Object.keys(env).forEach((key) => {
  if (key.startsWith('APP_')) {
    envData[key] = env[key];
  }
});

const replaceData = {
  ...Object.fromEntries(Object.entries(appData).map(([k, v]) => [k, JSON.stringify(v)])),
  ...Object.fromEntries(Object.entries(envData).map(([k, v]) => [k, JSON.stringify(v)])),
};

export {
  processArg,
  isDev,
  isProd,
  packageData,
  appData,
  envData,
  replaceData,
};
#!/usr/bin/env node
const { execSync } = require('child_process');
const { readFileSync } = require('fs');
const path = require('path');

function parseTag(tag) {
  // Accept tags like `v1.2.3`, `v1.2.3-beta.1`, `react-v1.2.3`, `react-v1.2.3-beta.1`
  const m = tag.match(/^(?:(?<component>[A-Za-z0-9_.-]+)-)?v(?<version>\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?)$/);
  if (!m) return null;
  return { component: m.groups.component || null, version: m.groups.version };
}

function verifyTagMatchesPackage(tag, pkgVersion, expectedComponent = 'react') {
  const parsed = parseTag(tag);
  if (!parsed) {
    throw new Error(`tag '${tag}' is not a valid release tag (expected 'vMAJOR.MINOR.PATCH' optionally prefixed by component-)`);
  }
  if (parsed.component && parsed.component !== expectedComponent) {
    throw new Error(`tag '${tag}' targets component '${parsed.component}', not '${expectedComponent}'`);
  }
  if (parsed.version !== pkgVersion) {
    throw new Error(`tag '${tag}' version '${parsed.version}' does not match package version '${pkgVersion}'`);
  }
  return parsed.version;
}

if (require.main === module) {
  const argv = process.argv.slice(2);
  const component = argv[0] || 'react';
  const pkgPath = argv[1] || path.resolve(__dirname, '..', component, 'package.json');

  let tag = process.env.GITHUB_REF_NAME || process.env.GITHUB_REF || '';
  if (!tag) {
    try {
      tag = execSync('git describe --tags --exact-match', { encoding: 'utf8' }).trim();
    } catch (err) {
      // git command failed, leave tag empty and error below
      tag = '';
    }
  }

  if (!tag) {
    console.error('cannot determine release tag: set GITHUB_REF_NAME or run from a tagged commit');
    process.exit(1);
  }

  let pkg;
  try {
    pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  } catch (err) {
    console.error(`cannot read package.json at ${pkgPath}: ${err.message}`);
    process.exit(1);
  }

  try {
    verifyTagMatchesPackage(tag, pkg.version, component);
    console.log(`tag '${tag}' matches ${component} version ${pkg.version}`);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

module.exports = { parseTag, verifyTagMatchesPackage };

/// <reference types="node" />
/// <reference types="jest" />
/* eslint-disable @typescript-eslint/no-var-requires */
const { verifyTagMatchesPackage, parseTag } = require('../../scripts/check-package-tag.js');

describe('check-package-tag', () => {
  test('valid stable tag passes', () => {
    expect(() => verifyTagMatchesPackage('v1.0.0', '1.0.0', 'react')).not.toThrow();
  });

  test('valid prerelease tag preserves suffix and passes', () => {
    const tag = 'v1.2.3-beta.1';
    expect(parseTag(tag).version).toBe('1.2.3-beta.1');
    expect(() => verifyTagMatchesPackage(tag, '1.2.3-beta.1', 'react')).not.toThrow();
  });

  test('wrong component in tag fails', () => {
    expect(() => verifyTagMatchesPackage('sdk-v1.0.0', '1.0.0', 'react')).toThrow(
      /targets component 'sdk', not 'react'/,
    );
  });

  test('mismatched version fails', () => {
    expect(() => verifyTagMatchesPackage('v1.0.1', '1.0.0', 'react')).toThrow(/does not match package version/);
  });
});

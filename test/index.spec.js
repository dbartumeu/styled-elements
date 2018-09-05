/* global describe, it, before */

import chai from 'chai';

import StyledElements from '../dist/styled-elements';

chai.expect();
const expect = chai.expect;
let lib;

describe('Given an instance of StyledElements library', () => {
  before(() => {
    lib = new StyledElements();
    lib.init();
  });
  describe('Load configuration: get config()', () => {
    it('should return the config object', () => {
      expect(lib.config).to.be.an('object');
    });
  });
  describe('Initialize the plugin', () => {
    it('should be initialized', () => {
      expect(lib.initialized).to.be.equal(true);
    });
  });
});

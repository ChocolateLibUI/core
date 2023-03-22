/// <reference types="cypress" />
import { State } from "@chocolatelib/state";
import { Base, BaseEvents, defineElement, ConnectEventVal, AccessTypes } from "../../src";

describe('Base', function () {
  beforeEach(function () {
    cy.visit('http://localhost:999')
  })
  it('Instantiating undefined class', function () {

  });
});
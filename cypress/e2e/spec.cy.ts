/// <reference types="cypress" />
import { Base, BaseEvents, defineElement } from "../../src";

describe('Base', function () {
  it('Instantiating undefined class', function () {
    expect(function () {
      class TestClass extends Base { };
      let inst = new TestClass();
    }).to.throw("Illegal constructor");
  });
  it('Defining class without changing name', function () {
    expect(() => {
      class TestClass extends Base { }
      defineElement(TestClass);
    }).to.throw("Element uses same name as ancestor, abstract classes should return '@abstract@'");
  });
  it('Defining class with invalid name', function () {
    expect(() => {
      class TestClass extends Base {
        static elementName(): string {
          return 'testClass'
        }
      }
      defineElement(TestClass);
    }).to.throw('Custom element names must not contain uppercase ASCII characters.');
  });

  describe('After Defining', function () {
    interface TestEvents extends BaseEvents {
      test: number
    }
    class TestClass extends Base<TestEvents> {
      static elementName(): string {
        return 'testclass'
      }
      testClassMethod(param: number) {
        return 'string' + String(param);
      }
    }
    defineElement(TestClass);
    it('Instantiation', function () {
      let inst = new TestClass();
    });
    it('Extended events', function () {
      let inst = new TestClass();
      inst.events.on('test', () => { });
    });
    it('Calling Method', function () {
      let inst = new TestClass();
      expect(inst.testClassMethod(1)).to.equal('string1');
    });
  });
});

describe('Yo', function () {

});
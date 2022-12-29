/// <reference types="cypress" />
import { Base, BaseEvents, defineElement, ConnectEventVal } from "../../src";

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
    }).to.throw('Custom element names must not contain uppercase ASCII characters. chocolatelibui-core-testClass');
  });
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


describe('Connecting disconnecting and adopting', function () {
  class TestClass extends Base {
    static elementName(): string { return 'testclass2' }
  };
  defineElement(TestClass);
  it('Connecting element', function () {
    let inst = new TestClass();
    return new Promise<void>((a) => {
      inst.events.on('connect', (e) => {
        if (e.data === ConnectEventVal.Connect) {
          expect(e.type).equal('connect');
          expect(e.target).equal(inst);
          a()
        }
      })
      document.body.appendChild(inst);
    })
  });
  it('Disconnecting element', function () {
    let inst = new TestClass();
    return new Promise<void>((a) => {
      inst.events.on('connect', (e) => {
        if (e.data === ConnectEventVal.Disconnect) {
          expect(e.type).equal('connect');
          a()
        }
      })
      document.body.appendChild(inst);
      document.body.removeChild(inst);
    })
  });
  it('Connecting element', function () {
    let inst = new TestClass();
    return new Promise<void>((a) => {
      inst.events.on('connect', (e) => {
        if (e.data === ConnectEventVal.Connect) {
          a()
        }
      })
      document.body.appendChild(inst);
    })
  });
});

describe('Value', function () {
  class TestClass extends Base {
    static elementName(): string { return 'testclass3' }
  };
  defineElement(TestClass);
  it('Instantiating undefined class', function () {
    let inst = new TestClass();

  });
});
/// <reference types="cypress" />
import { State } from "@chocolatelib/state";
import { Base, BaseEvents, defineElement, ConnectEventVal, AccessTypes } from "../../src";

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

describe('State', function () {
  class TestClass extends Base {
    static elementName(): string { return 'testclass3' }
  };
  defineElement(TestClass);
  it('Attaching State then appending element', function (done) {
    let inst = new TestClass();
    let state = new State(1);
    inst.attachState(state, (val) => {
      expect(val).equal(2);
      done(undefined);
    });
    expect(state.inUse()).equal(false);
    document.body.appendChild(inst);
    expect(state.inUse()).equal(true);
    state.set(2);
  });
  it('Attaching State then appending element, then removing element', function () {
    let inst = new TestClass();
    let state = new State(1);
    inst.attachState(state, () => { });
    expect(state.inUse()).equal(false);
    document.body.appendChild(inst);
    expect(state.inUse()).equal(true);
    document.body.removeChild(inst);
    expect(state.inUse()).equal(false);
  });
  it('Attaching State then appending element, then dettaching State', function () {
    let inst = new TestClass();
    let state = new State(1);
    let func = inst.attachState(state, () => { });
    expect(state.inUse()).equal(false);
    document.body.appendChild(inst);
    expect(state.inUse()).equal(true);
    inst.dettachState(func);
    expect(state.inUse()).equal(false);
    document.body.removeChild(inst);
    expect(state.inUse()).equal(false);
  });
});
describe('Access', function () {
  class TestClass extends Base {
    static elementName(): string { return 'testclass4' }
  };
  defineElement(TestClass);
  it('Set Access', function () {
    let inst = new TestClass();
    document.body.appendChild(inst);
    expect(inst.inert).equal(false);
    inst.access = AccessTypes.read
    expect(inst.inert).equal(true);
  });
});
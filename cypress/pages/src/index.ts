import { State } from "@chocolatelib/state";
import { Base, BaseObserver, defineElement } from "../../../src";

let observer = new BaseObserver({})

class TestClass extends Base {
    static elementName(): string { return 'testclass2' }
}
defineElement(TestClass);

let test = new TestClass();
test.innerHTML = 'Test1';
document.body.appendChild(test)

let state = new State('');

test.attachState(state, (val) => {
    test.innerHTML = val;
})

state.set('YOYO')
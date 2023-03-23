import { State } from "@chocolatelib/state";
import { Base, BaseObserver, defineElement } from "../../../src";

let observer = new BaseObserver({})

class TestClass extends Base {
    static elementName(): string { return 'testclass2' }
    constructor(a: boolean, b: boolean) {
        super()
    }
}
defineElement(TestClass);

let test = new TestClass(true, false);
test.innerHTML = 'Test1';
document.body.appendChild(test)

let state = new State('');

test.attachState(state, (val) => {
    test.innerHTML = val;
})

state.set('YOYO')

document.addEventListener('message', (e) => {
    state.set(String(e.bubbles));
});
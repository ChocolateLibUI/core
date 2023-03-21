import { createState } from "@chocolatelib/state";
import { Base, ConnectEventVal, defineElement, BaseObserver, AccessTypes } from "../src";

class TestClass extends Base {
    number: number = 0;
    connects: number = 0;
    disconnects: number = 0;
    visible: number = 0;
    invisible: number = 0;
    constructor(num: string) {
        super();
        this.style.height = '2rem';
        this.events.on('connect', (data) => {
            switch (data.data) {
                case ConnectEventVal.Connect:
                    this.connects++;
                    console.log('con1');
                    break;
                case ConnectEventVal.Disconnect:
                    this.disconnects++;
                    console.log('con2');
                    break;
            }
            this.render();
        })
        this.events.on('visible', (data) => {
            if (data.data) {
                this.visible++;
                console.log('vis1');
            } else {
                this.invisible++;
                console.log('vis2');
            }
            this.render();
        })
    }
    static elementName(): string {
        return 'testclass'
    }

    options(options: {}): this {
        return this;
    }

    render() {
        this.innerHTML = `Test Element ${this.number} Connects:${this.connects} Disconnects${this.disconnects} Visible:${this.visible} Invisible${this.invisible}`;
        this.style.backgroundColor = `rgb(${Number(!this.isVisible) * 255},${Number(this.isVisible) * 255},0)`
    }
}
defineElement(TestClass);


class TestClass2 extends Base {
    constructor() {
        super();
    }
    static elementName(): string { return 'testclass2' }
}
defineElement(TestClass2);

let inst = new TestClass2();
document.body.appendChild(inst);

let state2 = createState('Testing Attention Please');

inst.attachStateToProp('innerHTML', state2)

setTimeout(() => {
    state2.set('Testing something else')
}, 2000);

let connectTest = document.body.appendChild(document.createElement('div'));
let connectTestTitle = connectTest.appendChild(document.createElement('div'));
connectTestTitle.innerHTML = 'Test Connecting'
let connectTestButton = connectTest.appendChild(document.createElement('button'));
connectTestButton.innerHTML = 'Toggle Connect'
connectTestButton.onclick = () => {
    if (connectTestContainer.children.length === 0) {
        connectTestChildren.forEach(element => {
            connectTestContainer.appendChild(element);
        });
    } else {
        connectTestContainer.replaceChildren();
    }
}
let connectTestContainer = connectTest.appendChild(document.createElement('div'));
connectTestContainer.style.display = 'flex';
connectTestContainer.style.flexDirection = 'column';

let connectTestChildren: TestClass[] = [];
for (let i = 0; i <= 19; i++) {
    let inst = new TestClass(String(i));
    connectTestContainer.appendChild(inst);
    connectTestChildren[i] = inst;
}

let state = createState(AccessTypes.write)

connectTestChildren[0].attachStateToProp('access', state)

let observerTest = document.body.appendChild(document.createElement('div'));
let observerTestTitle = observerTest.appendChild(document.createElement('div'));
observerTestTitle.innerHTML = 'Test Observer'
let observerTestButtonObs = observerTest.appendChild(document.createElement('button'));
observerTestButtonObs.innerHTML = 'Toggle Observer'
let toggle = true;
observerTestButtonObs.onclick = () => {
    observerTestChildren.forEach(element => {
        element.attachToObserver((toggle ? undefined : observer));
    });
    toggle = !toggle;
}
let observerTestButtonConn = observerTest.appendChild(document.createElement('button'));
observerTestButtonConn.innerHTML = 'Toggle Connect'
observerTestButtonConn.onclick = () => {
    if (observerTestContainer.children.length === 0) {
        observerTestChildren.forEach(element => {
            observerTestContainer.appendChild(element);
        });
    } else {
        observerTestContainer.replaceChildren();
    }
}
let observerTestContainer = observerTest.appendChild(document.createElement('div'));
observerTestContainer.style.display = 'flex';
observerTestContainer.style.flexDirection = 'column';
let observer = new BaseObserver({ threshold: 0.9 });
let observerTestChildren: TestClass[] = [];
for (let i = 0; i <= 99; i++) {
    let inst = new TestClass(String(i));
    inst.attachToObserver(observer);
    observerTestContainer.appendChild(inst);
    observerTestChildren[i] = inst;
}
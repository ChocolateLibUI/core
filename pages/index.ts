import { Base, ConnectEventVal, defineElement, BaseObserver } from "../src";

class TestClass extends Base {
    connects: number = 0;
    disconnects: number = 0;
    constructor(num?: string) {
        super();
        this.style.height = '2rem';
        this.events.on('connect', (data) => {
            switch (data.data) {
                case ConnectEventVal.Connect:
                    this.connects++;
                    this.style.backgroundColor = 'green';
                    console.log('test1');

                    break;
                case ConnectEventVal.Disconnect:
                    this.disconnects++;
                    this.style.backgroundColor = 'red';
                    console.log('test2');
                    break;
            }
            this.innerHTML = `Test Element ${num} Connects:${this.connects} Disconnects${this.disconnects}`;
        })
    }
    static elementName(): string {
        return 'testclass'
    }

    options(options: number): this {
        return this;
    }
}
defineElement(TestClass);

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
let observer = new BaseObserver({ threshold: 1 });
let observerTestChildren: TestClass[] = [];
for (let i = 0; i <= 99; i++) {
    let inst = new TestClass(String(i));
    inst.attachToObserver(observer);
    observerTestContainer.appendChild(inst);
    observerTestChildren[i] = inst;
}
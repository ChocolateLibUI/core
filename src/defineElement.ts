import { Base, BaseEvents } from "./base";
import { validateElementName } from "./validateElementName";

//Defines elements inheriting from the base
export let defineElement = <T extends BaseEvents>(element: typeof Base<T>) => {
    let namespace = element.elementNameSpace();
    let check = element.elementName;
    let defineName = '';
    let runner = element;
    // @ts-expect-error
    while (runner !== HTMLElement) {
        if (namespace !== runner.elementNameSpace()) {
            break;
        }
        let name = runner.elementName();
        runner = Object.getPrototypeOf(runner);
        if (check === runner.elementName) {
            throw new Error('Element uses same name as ancestor, abstract classes should return \'@abstract@\'');
        }
        if (!name.length) {
            throw new Error('Element doesn\'t define element name');
        }
        if (name !== '@abstract@') {
            defineName = '-' + name + defineName;
        }
    }
    try {
        // @ts-expect-error
        customElements.define(namespace + defineName, element);
    } catch (e) {
        throw (validateElementName(namespace + defineName));
    }
}
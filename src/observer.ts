import { Base } from "./base";

export class BaseObserver extends IntersectionObserver {
    constructor(options: IntersectionObserverInit) {
        super((e) => {
            for (let i = 0; i < e.length; i++) {
                //@ts-expect-error
                (<Base>e[i].target)._setVisible(e[i].isIntersecting);
            }
        }, options);
    }
}
import { Base, ConnectEventVal } from "./base";

export class BaseObserver extends IntersectionObserver {
    constructor(options: IntersectionObserverInit) {
        super((e) => {
            for (let i = 0; i < e.length; i++) {
                if (e[i].isIntersecting) {
                    if (!(<Base>e[i].target).isVisible) {
                        (<Base>e[i].target).events.emit('connect', ConnectEventVal.Connect);
                        // @ts-expect-error
                        (<Base>e[i].target).isVisible = true;
                    }
                } else if ((<Base>e[i].target).isVisible) {
                    (<Base>e[i].target).events.emit('connect', ConnectEventVal.Disconnect);
                    // @ts-expect-error
                    (<Base>e[i].target).isVisible = false;
                }
            }
        }, options);
    }
}
import "./base.scss"
import { EListener, EventHandler } from "@chocolatelib/events";
import { BaseObserver } from "./observer";
import { Listener, Value } from "@chocolatelib/value";
import { Access, AccessTypes } from "./access";

/**Event types for base*/
export const enum ConnectEventVal {
    /**When element is connected from document*/
    Connect = 0,
    /**When element is disconnected from document*/
    Disconnect = 1,
    /**When element is adopted by another document*/
    Adopted = 2,
}

/**Events for Base element */
export interface BaseEvents {
    connect: ConnectEventVal,
}

/**Base options for base class */
export interface BaseOptions {
    /**Access for element, default is write access */
    access?: Access | AccessTypes
}

/**Shared class for elements to extend
 * All none abstract elements must use the defineElement function to declare itself
 * 
 * All none abstracts classes must override the static method elementName to return the name of the element
 * Abstract classes should return @abstract@
 * 
 * If another library defines an abstract base class, it is recommended to change the static elementNameSpace method to the name of the library
 * example for this library '@chocolatelibui/core' becomes 'chocolatelibui-core'
 * static elementNameSpace() { return 'chocolatelibui-core' }
 * This resets the nametree to the library name and prevents too long element names
 * 
 * Elements have an access propery, which builds on the html inert property
 * Access has the following three states
 * write = normal interaction and look
 * read = inert attribute is added making the element uninteractable, and add opacity 0.5 to make the element look inaccessible
 * none = adds display:none to element to make it */
export abstract class Base<MoreEvents extends BaseEvents = BaseEvents> extends HTMLElement {
    private $connectedObserver?: BaseObserver;
    /**Works when element is connected to observer, otherwise it is an alias for isConnected*/
    readonly isVisible: boolean = false;
    /**Events for element*/
    readonly events: EventHandler<MoreEvents, Base<MoreEvents>> = new EventHandler<MoreEvents, Base<MoreEvents>>;
    /**Returns the name used to define the element */
    static elementName() { return '@abstract@'; }
    /**Returns the namespace override for the element*/
    static elementNameSpace() { return 'chocolatelibui-core'; }
    /**List of attached Values */
    private $values: Value<any>[] | undefined
    /**List of functions for attached values */
    private $valueFuncs: ((value: any) => void)[] | undefined
    /**Function for connecting values */
    private $valueConnector: EListener<"connect", Base<MoreEvents>, MoreEvents["connect"]> | undefined
    /**Access of element*/
    protected $access: AccessTypes = AccessTypes.write
    /**Access listener*/
    private $accessListener: Listener<AccessTypes> | undefined

    //@ts-expect-error
    constructor(...any: any[]) {
        super()
        this.events.target = this;
    }

    /**Runs when element is attached to document*/
    connectedCallback() {
        if (this.$connectedObserver) {
            this.$connectedObserver.observe(this);
        } else {
            this.events.emit('connect', ConnectEventVal.Connect);
            // @ts-expect-error
            this.isVisible = true;
        }
    }

    /**Runs when element is dettached from document*/
    disconnectedCallback() {
        if (this.$connectedObserver) {
            this.$connectedObserver.unobserve(this);
            if (this.isVisible) {
                this.events.emit('connect', ConnectEventVal.Disconnect);
                // @ts-expect-error
                this.isVisible = false;
            }
        } else {
            this.events.emit('connect', ConnectEventVal.Disconnect);
            // @ts-expect-error
            this.isVisible = false;
        }
    }

    /**Runs when element is attached to different document*/
    adoptedCallback() {
        this.events.emit('connect', ConnectEventVal.Adopted);
    }

    /**Sets options for the element*/
    options(options: BaseOptions): this {
        this.access = options.access;
        return this
    }

    /**This changes the web component to only call its connect functions when an observer observs it*/
    attachToObserver(observer?: BaseObserver) {
        if (observer) {
            this.$connectedObserver = observer;
            if (this.isConnected) {
                observer.observe(this);
            }
        } else if (this.$connectedObserver) {
            if (this.isConnected) {
                this.$connectedObserver.unobserve(this);
            }
            if (!this.isVisible) {
                this.events.emit('connect', ConnectEventVal.Connect);
                // @ts-expect-error
                this.isVisible = true;
            }
            delete this.$connectedObserver;
        }
    }

    /**Attaches a Value to the element, which will automatically have the function connected with the element
     * a function cannot be attached with multiple values, if done it will throw
     * a Value can be attached with multiple different functions */
    attachValue<T>(value: Value<T>, func: (value: T) => void) {
        if (this.$valueFuncs) {
            if (this.$valueFuncs.includes(func)) {
                throw 'Function is already attached to this element';
            }
        } else {
            this.$values = [];
            this.$valueFuncs = [];
        }
        if (this.$valueConnector) {
            if (this.isVisible) {
                value.addListener(func);
            }
        } else {
            this.$valueConnector = this.events.on('connect', (e) => {
                switch (e.data) {
                    case ConnectEventVal.Connect:
                        for (let i = 0; i < this.$values!.length; i++) {
                            this.$values![i].addListener(this.$valueFuncs![i], true);
                        }
                        break;
                    case ConnectEventVal.Disconnect:
                        for (let i = 0; i < this.$values!.length; i++) {
                            this.$values![i].removeListener(this.$valueFuncs![i]);
                        }
                        break;
                    case ConnectEventVal.Adopted:
                        for (let i = 0; i < this.$values!.length; i++) {
                            this.$values![i].removeListener(this.$valueFuncs![i]);
                            this.$values![i].addListener(this.$valueFuncs![i], true);
                        }
                }
            })
        }
        this.$valueFuncs.push(func);
        this.$values!.push(value);
        return func;
    }
    /**Dettaches the function from the element */
    dettachValue(func: (value: any) => void) {
        if (this.$valueFuncs) {
            let index = this.$valueFuncs.indexOf(func);
            if (index > -1) {
                if (this.isVisible) {
                    this.$values![index].removeListener(func);
                }
                this.$values!.splice(index, 1);
                this.$valueFuncs.splice(index, 1);
                if (this.$valueFuncs.length === 0) {
                    this.events.off('connect', this.$valueConnector!);
                }
            }
        }
    }

    /**Returns the current access of the element */
    get access() {
        return this.$access
    }
    /**Sets the access of the element, passing undefined is the same as passing write access*/
    set access(access: Access | AccessTypes | undefined) {
        if (this.$accessListener) {
            this.dettachValue(this.$accessListener);
            delete this.$accessListener;
        }
        if (typeof access === 'object' && access instanceof Access) {
            this.$accessListener = this.attachValue(access, (acc) => {
                this.$accessChange(<AccessTypes>acc);
                this.$access = <AccessTypes>acc;
            });
        } else if (access) {
            this.$accessChange(access);
            this.$access = access;
        } else {
            this.$accessChange(AccessTypes.write);
            this.$access = AccessTypes.write;
        }
    }
    /**Access change function */
    protected $accessChange(access: AccessTypes) {
        switch (access) {
            case AccessTypes.write:
                this.inert = false;
                break;
            case AccessTypes.read:
                this.inert = true;
                break;
            case AccessTypes.none:
                this.setAttribute('inert', 'none');
                break;
        }
    }
}
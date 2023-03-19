import "./base.scss"
import { createEventHandler, EventConsumer, EventProducer } from "@chocolatelib/events";
import { BaseObserver } from "./observer";
import { StateRead, StateSubscriber } from "@chocolatelib/state";
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
    visible: Boolean,
}

/**Base options for base class */
export interface BaseOptions {
    /**Access for element, default is write access */
    access?: AccessTypes
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
    /**Returns the name used to define the element */
    static elementName() { return '@abstract@'; }
    /**Returns the namespace override for the element*/
    static elementNameSpace() { return 'chocolatelibui-core'; }
    /**Events for element*/
    protected _events: EventProducer<MoreEvents, Base<MoreEvents>>
    /**Events for element*/
    readonly events: EventConsumer<MoreEvents, Base<MoreEvents>>

    private _connectStates: StateRead<any>[] | undefined;
    private _connectSubscribers: StateSubscriber<any>[] | undefined;

    /**Works when element is connected to observer, otherwise it is an alias for isConnected*/
    readonly isVisible: boolean = false;
    private _observer: BaseObserver | undefined;
    private _visibleStates: StateRead<any>[] | undefined;
    private _visibleSubscribers: StateSubscriber<any>[] | undefined;

    private _access: AccessTypes | undefined;

    constructor(...any: any[]) {
        super()
        let events = createEventHandler<MoreEvents, Base<MoreEvents>>(this)
        this._events = events.producer;
        this.events = events.consumer;
    }

    /**Runs when element is attached to document*/
    connectedCallback() {
        this._events.emit('connect', ConnectEventVal.Connect);
        if (this._connectStates && this._connectSubscribers)
            for (let i = 0; i < this._connectStates.length; i++)
                this._connectStates[i].subscribe(this._connectSubscribers[i], true);
        if (this._observer) {
            this._observer.observe(this);
        } else {
            this._setVisible(true);
        }
    }

    /**Runs when element is dettached from document*/
    disconnectedCallback() {
        this._events.emit('connect', ConnectEventVal.Disconnect);
        if (this._connectStates && this._connectSubscribers)
            for (let i = 0; i < this._connectStates.length; i++)
                this._connectStates[i].unsubscribe(this._connectSubscribers[i]);
        if (this._observer) {
            this._observer.unobserve(this);
            this._setVisible(false);
        }
    }

    /**Runs when element is attached to different document*/
    adoptedCallback() {
        this._events.emit('connect', ConnectEventVal.Adopted);
    }

    private _setVisible(is: boolean) {
        if (this.isVisible !== is) {
            //@ts-expect-error
            this.isVisible = is;
            this._events.emit('visible', is);
            if (is) {
                if (this._visibleStates && this._visibleSubscribers)
                    for (let i = 0; i < this._visibleStates.length; i++)
                        this._visibleStates[i].subscribe(this._visibleSubscribers[i], true);
            } else {
                if (this._visibleStates && this._visibleSubscribers)
                    for (let i = 0; i < this._visibleStates.length; i++)
                        this._visibleStates[i].unsubscribe(this._visibleSubscribers[i]);
            }
        }
    }

    /**Sets options for the element*/
    options(options: BaseOptions): this {
        this.access = options.access;
        return this
    }

    /**This changes the web component to only call its connect functions when an observer observs it*/
    attachToObserver(observer?: BaseObserver) {
        if (observer) {
            if (this.isConnected) {
                if (this._observer)
                    this._observer.unobserve(this);
                observer.observe(this);
            }
            this._observer = observer;
        } else if (this._observer) {
            if (this.isConnected)
                this._observer.unobserve(this);
            if (!this.isVisible)
                this._setVisible(true);
            this._observer = undefined;
        }
    }

    /**Attaches a Value to the element, which will automatically have the function connected with the element
     * a function cannot be attached with multiple values, if done it will throw
     * a Value can be attached with multiple different functions */
    attachState<T>(state: StateRead<T>, func: StateSubscriber<T>, visible?: boolean) {
        if (visible) {
            if (!this._visibleStates) {
                this._visibleStates = [];
                this._visibleSubscribers = [];
            }
            if (this.isVisible) {
                state.subscribe(func, true);
            }
            return func;
        }
        if (!this._connectStates) {
            this._connectStates = [];
            this._connectSubscribers = [];
        }
        if (this.isConnected) {
            state.subscribe(func, true);
        }
        return func;
    }

    /**Attaches a Value to the element, which will automatically have the function connected with the element
     * a function cannot be attached with multiple values, if done it will throw
     * a Value can be attached with multiple different functions */
    attachStateToProp<T extends keyof this>(prop: T, state: StateRead<typeof this[T]>, visible?: boolean) {

    }

    /**Dettaches the function from the element */
    dettachState(func: StateSubscriber<any>, visible?: boolean) {
        if (visible) {
            if (this._visibleSubscribers) {
                let index = this._visibleSubscribers.indexOf(func);
                if (index === -1) {
                    console.warn('Function not registered with element', func, this);
                } else {
                    if (this.isVisible)
                        this._visibleStates![index].unsubscribe(func);
                    this._visibleStates!.splice(index, 1);
                    this._visibleSubscribers.splice(index, 1);
                }
            }
            return;
        }
        if (this._connectSubscribers) {
            let index = this._connectSubscribers.indexOf(func);
            if (index === -1) {
                console.warn('Function not registered with element', func, this);
            } else {
                if (this.isVisible)
                    this._connectStates![index].unsubscribe(func);
                this._connectStates!.splice(index, 1);
                this._connectSubscribers.splice(index, 1);
            }
        }
    }

    /**Sets the access of the element, passing undefined is the same as passing write access*/
    set access(access: AccessTypes | undefined) {
        this._access = access;
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
    /**Returns the current access of the element */
    get access() {
        return this._access ?? AccessTypes.write;
    }
}

import { EventHandler } from "@chocolatelib/events";
import { BaseObserver } from "./observer";
import { name } from "../package.json"

/**Event types for base*/
export enum ConnectEventVal {
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

/**Shared class for elements to extend
 * All none abstract elements must use the defineElement function to declare itself
 * 
 * All none abstracts classes must override the static method elementName to return the name of the element
 * Abstract classes should return @abstract@
 * 
 * If another library defines an abstract base class, it is recommended to change the static elementNameSpace method to
 * import { name } from "../package.json"
 * static elementNameSpace() { return name.replace('@', '').replace('/', '-') }
 * This resets the nametree to the library name and prevents too long element names*/
export abstract class Base<MoreEvents extends BaseEvents = BaseEvents> extends HTMLElement {
    private $connectedObserver?: BaseObserver;
    /**Works when element is connected to observer, otherwise it is an alias for isConnected*/
    readonly isVisible: boolean = false;
    /**Events for element*/
    readonly events: EventHandler<MoreEvents> = new EventHandler<MoreEvents>;
    /**Returns the name used to define the element */
    static elementName() { return '@abstract@' }
    /**Returns the namespace override for the element*/
    static elementNameSpace() { return name.replace('@', '').replace('/', '-') }

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
    // @ts-expect-error
    options(options: any): this { return this }

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
}
import { EnumList, ValueLimitedString } from "@chocolatelib/value";

/**Enum of possible access types for base element*/
export const enum AccessTypes {
    write = 'w',
    read = 'r',
    none = 'n',
}

/**List for access type*/
const accessTypes: EnumList = {
    [AccessTypes.write]: { name: 'Write', description: 'Write access to element' },
    [AccessTypes.read]: { name: 'Read', description: 'Read access to element' },
    [AccessTypes.none]: { name: 'None', description: 'No access to element' },
}

/**Class used to keep track of access for base elements*/
export class Access extends ValueLimitedString {
    constructor(init: AccessTypes) {
        super(init, accessTypes)
    }
}
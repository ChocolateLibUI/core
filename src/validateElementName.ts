const reservedNames = new Set([
    'annotation-xml',
    'color-profile',
    'font-face',
    'font-face-src',
    'font-face-uri',
    'font-face-format',
    'font-face-name',
    'missing-glyph'
]);

var regex = /^[a-z](?:[\.0-9_a-z\xB7\xC0-\xD6\xD8-\xF6\xF8-\u037D\u037F-\u1FFF\u200C\u200D\u203F\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])*-(?:[\x2D\.0-9_a-z\xB7\xC0-\xD6\xD8-\xF6\xF8-\u037D\u037F-\u1FFF\u200C\u200D\u203F\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])*$/;

export let validateElementName = (name: string) => {
    if (!name) {
        return 'Missing element name.';
    }

    if (/[A-Z]/.test(name)) {
        return 'Custom element names must not contain uppercase ASCII characters.';
    }

    if (!name.includes('-')) {
        return 'Custom element names must contain a hyphen. Example: unicorn-cake';
    }

    if (/^\d/i.test(name)) {
        return 'Custom element names must not start with a digit.';
    }

    if (/^-/i.test(name)) {
        return 'Custom element names must not start with a hyphen.';
    }

    // https://html.spec.whatwg.org/multipage/scripting.html#prod-potentialcustomelementname
    if (!regex.test(name)) {
        return 'Invalid element name.';
    }

    if (reservedNames.has(name)) {
        return 'The supplied element name is reserved and can\'t be used.\nSee: https://html.spec.whatwg.org/multipage/scripting.html#valid-custom-element-name';
    }

    return 'Unknown fault'
}
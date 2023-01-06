

function censor(censor) {
    var i = 0;

    return function (key, value) {
        if (i !== 0 && typeof (censor) === 'object' && typeof (value) == 'object' && censor == value)
            return '[Circular]';

        if (i >= 29) // seems to be a harded maximum of 30 serialized objects?
            return '[Unknown]';

        ++i; // so we know we aren't using the original object anymore

        return value;
    }
}

const CreateRingBuffer = function (length) {

    var pointer = 0, buffer = [];

    return {
        buffer,
        get: function (key) { return this.buffer[key]; },
        push: function (...items) {
            buffer[pointer] = items.map(item => JSON.stringify(item, censor(item))).join(" ");
            pointer = (length + pointer + 1) % length;
        }
    };
};

module.exports = {
    CreateRingBuffer
}

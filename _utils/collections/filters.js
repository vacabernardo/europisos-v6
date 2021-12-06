const {findByInputPath} = require('./memo');
const compareItemByFilter = require('./compare');

module.exports = {
    getDefaultSKU: function(fieldValue) {
        if (!Array.isArray(fieldValue)) {
            return null;
        }
        return fieldValue.find(i => i.default === true) || fieldValue[0];
    },
    resolveMultiReferences: function (fieldValue) {
        if (!Array.isArray(fieldValue)) {
            return [];
        }
        return fieldValue.map(inputPath => {
            try {
                return findByInputPath(inputPath);
            } catch (e) {
                console.warn(`Invalid Reference: ${inputPath}`)
                return null;
            }
        }).filter(e => !!e)
    },
    resolveReference: function (inputPath) {
        if (!inputPath) {
            return {};
        }
        try {
            return findByInputPath(inputPath);
        } catch (e) {
            console.warn(`Invalid Reference: ${inputPath}`)
            return {};
        }
    }, filter: function (array, fields, filterFor, inputPath) {
        if (!Array.isArray(array)) {
            return []
        }
        filterFor = filterFor || "ALL";
        inputPath = inputPath.replace('./', '');
        const currentItem = array.find( i => i.inputPath && i.inputPath == "./" + inputPath)
        
        if (fields.includes('DYN_CONTEXT_FIELD') && !fields.includes(";")) {
            fields+="; "
        }

        const filters = fields.replace(/DYN_CONTEXT_FIELD:(.*?);/gm, function(value, match) {
            if (currentItem && currentItem.data && currentItem.data[match]) {
                return currentItem.data[match] + ";"
            }
            return value;
        }).replace(/DYN_CONTEXT/gm, inputPath).split("; ").map(f => f.split(",")).filter( el => el.length === 3);

        if (filterFor === "ALL") {
            return array.filter((item) => filters.every((filter) => compareItemByFilter(item,filter)))
        } else {
            return array.filter((item) => filters.some((filter) => compareItemByFilter(item,filter)))
        }
    }
}
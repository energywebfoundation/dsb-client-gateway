const Ajv = require("ajv")
const ajv = new Ajv({ allErrors: true })
import { SchemaNotValidException } from '../../../message/exceptions/schema-not-valid.exception';

export function IsSchemaValid(schema, json) {

    console.log('schema', schema)
    console.log('json', json)

    const validate = ajv.compile(JSON.parse(JSON.stringify(schema)))
    const valid = validate(JSON.stringify(json))
    if (valid) { return true }
    else {
        throw new SchemaNotValidException(JSON.stringify(ajv.errorsText(validate.errors)))
    }
}



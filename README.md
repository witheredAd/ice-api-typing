# ice-api-typing

A library that provides a way to schema APIs in ts-based front-end projects, with full type support, including:

 - run-time result type check
 - static request type check
 - url pattern auto-complete

```
NOTE: This library is still in early access stage and no warranty is guaranteed. 
```

---

## Quick Start

This library takes the most advantage of TypeScript's type system. It enables you to write API schemas totally in TypeScript. Start to define an API like:

```ts
// @/protocols/Apis.ts
import {defineNamedApi} from "ice-api-typing";

export const doApi =
    defineNamedApi("greet", {
        type: 'GET',
        request: {
            name: String
        },
        result: {
            code: Number,
            greet: String
        }
    }).caller("http://url-to-your-backend/")
```

The method `caller` returns an arrow function to call to defined apis. To use it, type:

```ts
import {doApi} from "@/protocols/Apis"

doApi("greet/", {
    name: "David"
}).then((res) => {
    res.data
})
```

You will get auto complete when typing the url, and ts will check your param type. No need to type `GET`/`POST` explicitly, because it will be decided by your schema automatically.

## Run-Time Type Check

The `caller` does run-time type check on received data, according to the `result` field defined in the schema. Currently, it will just print the mismatches it finds to the console. For example, if we receive such data for 'greet/':

```json
{
  "code": "success",
  "Greet": "Hello, David" 
}
```

It will print:

```
(x) [api-typing] Property 'code' is given string, but defined number (checking interface 'greet/')
(!) [api-typing] Property 'Greet' given is not defined (checking interface 'greet/')
```

Currently, properties cannot be set as `required`. All properties defined in `result` is optional, while those defined in `request` is required.


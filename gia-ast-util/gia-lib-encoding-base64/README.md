# GIA Tools for Encoding/Decoding base64

## Install

```sh
npm i gia-tools-encoding-base64 --save
```

## Usage

```js
var giaenc = require("gia-tools-encoding-base64");

var myencodedString = giaenc.encode_fileToBase64String(myfile);
var encodedObjectProp = giaenc.encode_fileToBase64JSONStringify(myfile,"myjsonprop"); 
var decodedData = giaenc.decode_base64_to_string(base64String,myoutputfile);
```

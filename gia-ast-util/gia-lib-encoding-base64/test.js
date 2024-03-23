
//var giaenc = require("gia-tools-encoding-base64");

const fs = require('fs');
var giaenc = require("./index.js");

var jsonFile = "test-response.json";
var sampleFile = "sample.jpg";

giaenc.enc64ToJSONPropToFile(sampleFile,"tests/out-targetRequestFile.json");
var base64str = giaenc.encFileToBase64String(sampleFile);
var ojsonProp = giaenc.encFileToJSONStringifyBase64Prop(sampleFile,"myprop");
//console.log(ojsonProp);
giaenc.dec64_ObjPropToFile(ojsonProp,"tests/out-dec64_ObjPropToFile.jpg","myprop");

giaenc.dec64_StringToFile(base64str,"tests/out-dec64_to_file.jpg");



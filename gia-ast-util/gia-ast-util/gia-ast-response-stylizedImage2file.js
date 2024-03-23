#!/bin/env node
'use strict';
// node v8.11.3
const Buffer = require('safer-buffer').Buffer;
const path = require('path');
const fs = require('fs');


var args = process.argv.slice(2);

var appHead = `-------------------------------------
Base64 JSON response prop decoder to File
by Guillaume D-Isabelle, 2021
--------------------------------------`;
if (args[0] == "--help" || args[0] == "-h" || args[0] == "-help" || args[0] == "--h" || !args[0])
    console.log(`${appHead}
  -------------HELP----------------------
  Convert the spec response with propValue/base64 to a file

Synopsis:  
  gia-ast-response-propValue2file <JSONFile> <IMAGE> [propName] [--verbose|--quiet]

  propName in JSONFile (default: stylizedImage)

usage : 

gia-ast-response-propValue2file myresponse.json myresult.jpg 
gia-ast-response-propValue2file myresponse.json myresult.jpg propValue
gia-ast-response-propValue2file myresponse.json myresult.jpg stylizedImage
gia-ast-response-propValue2file myresponse.json myresult.jpg myJsonProp --quiet
gia-ast-response-propValue2file myresponse.json myresult.jpg myJsonProp --verbose

------------------------------
`);

else // Lets do the work
  {

  var jsonFile = args[0];
  var target = args[1];
  var jsonData;
  var propValue;

  //Verbose and Quiet
  var v = 0;
  try {
    if (args[2] && args[2] == "--verbose")v = 1;
    if (args[3] && args[3] == "--verbose")v = 1;    
  } catch (error) { }

var q = false;
try {
  if (args[2] && args[2] == "--quiet")q = true;
  if (args[3] && args[3] == "--quiet")q = true;
  } catch (error) {}  

  if (v > 0) console.log(appHead);
  
  //Enable spec propName in JSONFile
var propName = "stylizedImage";
try {
  if (args[2] && (args[2] != "--quiet" && args[2] != "--verbose"))propName= args[2];
  
  } catch (error) {}  
   if (v > 0)console.log("looking for prop:"+ propName + " in file");

  fs.readFile(jsonFile, 'utf8', function (err, data) {
    if (err) throw err;
    // console.log(data);
    
    jsonData = JSON.parse(data);
    if (jsonData[propName]) {

      propValue= jsonData[propName] ;

      if (args[2] == "--html" || args[2] == "-html") console.log(
        `<img src="${propValue}">`);

        

        decode_base64_to_file(propValue, target);

      // fs.writeFileSync(target, buff);

      //if (args[2] == "--verbose" || args[2] == "-verbose" || args[3] == "--verbose" || args[3] == "-verbose")
      
      if (!q)console.log("should have written:" + target);
    }
    else {
      //@STCSTatus The response is probably bad
      console.log(`BAD RESPONSE - Object non existent (jsonData.${propName})`);
      process.exit(1);
    }

  });

}





/**
 * @param  {string} filename
 */
function encode_base64(filename) {
  fs.readFile(filename, function (error, data) {
    if (error) {
      throw error;
    } else {
      let buf = Buffer.from(data);
      let base64 = buf.toString('base64');
      // console.log('Base64 ' + filename + ': ' + base64);
      return base64;
    }
  });
}

/**
 * @param  {string} base64str
 * @param  {string} filename
 */
function decode_base64_to_file(base64str, filename) {
  
  fs.writeFileSync(filename, 
    decode_base64_to_string(base64str)
    );

}

/**
 * @param  {string} base64str
 */
function decode_base64_to_string(base64str) {
  
  if (base64str.indexOf("png;base64") > -1)
    base64str = base64str
      .replace(/^data:image\/png;base64,/, "");

  if (base64str.indexOf("jpeg;base64") > -1) {
    base64str = base64str
      .replace(/^data:image\/jpeg;base64,/, "");
  }

  return Buffer.from(base64str, 'base64');
}

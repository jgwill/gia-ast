#!/bin/env node
'use strict';
//@STCGoal Cat the contentImage object in a shell


// node v8.11.3

const fs = require('fs');



var args = process.argv.slice(2);

if (args[0] == "--help" || args[0] == "-h" || args[0] == "-help" || args[0] == "--h" || !args[0])
  console.log(`
  -------------------------------------
  Shell Cat JSON value ContentImage
  by Guillaume D-Isabelle, 2021
  --------------------------------------
  -------------HELP----------------------
  Cat the top level contentImage content as base64 or encapsulate with --html into an HTML tag

usage : 

gia-ast-cat-contentImage myrequestfile.json --html >> myHTMLresult.html

gia-ast-cat-contentImage myrequestfile.json  > myimgasText.txt

`);

else // Lets do the work
{
  var jsonFile = args[0];

  var jsonData;
  var contentImage;

  //encode_base64('ddr.jpg');

  fs.readFile(jsonFile, 'utf8', function (err, data) {
    if (err) throw err;
    // console.log(data);
    jsonData = JSON.parse(data);

    if (jsonData.contentImage) {
      var tmp = jsonData.contentImage;


      contentImage = tmp;

      if (tmp.indexOf("jpeg;base64") == -1)
        contentImage = "data:image/jpeg;base64," + contentImage;

      //@a Output as HTML or just as base64
      if (args[1] == "--html" || args[2] == "-html") console.log(`<img src="${contentImage}">`);
      else console.log(contentImage);


    }
    else {
      //@STCSTatus The response is probably bad
      console.log("BAD RESPONSE - Object non existent (jsonData.stylizedImage)");

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
function decode_base64(base64str, filename) {
  let buf = Buffer.from(base64str, 'base64');

  fs.writeFileSync(filename, buf);

}


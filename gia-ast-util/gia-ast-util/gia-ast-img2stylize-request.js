#!/bin/env node
'use strict';


//@STCGoal an input file is transformed into a base64 request for stylization


// node v8.11.3




const Buffer = require('safer-buffer').Buffer;
const path = require('path');
const fs = require('fs');


var args = process.argv.slice(2);

var appHead = `-------------------------------------
ContentImage request Preper
by Guillaume D-Isabelle, 2021
--------------------------------------`;

if (args[0] == "--help" || args[0] == "-h" || args[0] == "-help" || args[0] == "--h" || !args[0])
    console.log(`${appHead}
  -------------HELP----------------------
  Prep a Request file for AST by creating a target JSON request file with a base64 image tag contentImage.

Synopsis:  
    gia-ast-img2stylize-request <IMAGE> <OutJSON> [--verbose|--quiet]
     
usage : 

gia-ast-img2stylize-request mycontent.jpg myrequest.json

------------------------------
`);

else // Lets do the work
{
    var imgFile = args[0];
    var target = args[1];

    //Verbose and Quiet
    var v = 0;
    if (args[2] && args[2] == "--verbose") v = 1;
    var q = false;
    if (args[2] && args[2] == "--quiet") q = true;

    if (v > 0) console.log(appHead);


    var propName = "contentImage";
    try {
        if (args[2] && (args[2] != "--quiet" && args[2] != "--verbose")) propName = args[2];

    } catch (error) { }
    if (v > 0) console.log("the file will have a prop :" + propName + " with the encoded data");



    if (v > 0) console.log("Reading using v3: " + imgFile);

    //encode_base64_v2(imgFile, target);
    try {
        encode_base64_v3_to_JSONRequestFile(imgFile, target, propName);
        if (!q) console.log(target + " created");
    } catch (error) {
        console.log("something went wrong: ");
        console.log(error);
    }


}

/**
 * Encode an image file into base64 JSON request file 
 * @param  {string} filename
 * @param  {string} targetJsonFile
 */
function encode_base64_v3_to_JSONRequestFile(filename, targetJsonFile, propName = "contentImage") {
    var base64Raw = fs.readFileSync(filename, 'base64');

    var base64 = base64Raw;
    var ext = path.extname(filename).replace(".", "");
    if (ext == "jpg" || ext == "JPG" || ext == "JPEG") ext = "jpeg";
    if (ext == "pneg" || ext == "PNG" || ext == "Png") ext = "png";


    if (base64Raw.indexOf("data:") == -1) //fixing the string
        base64 = `data:image/${ext};base64,`
            + base64Raw;

    //console.log(base64);
    var jsonRequest = new Object();
    jsonRequest[propName] = base64;
    var jsonData = JSON.stringify(jsonRequest);

    fs.writeFileSync(targetJsonFile, jsonData);
    //console.log("Should have saved :" + targetJsonFile);

}
/**
 * @param  {string} filename
 * @param  {string} targetJsonFile
 */
function encode_base64_v2(filename, targetJsonFile) {
    fs.readFile(filename, function (error, data) {
        if (error) {
            throw error;
        } else {
            let buf = Buffer.from(data);
            let base64 = buf.toString('base64');

            var jsonRequest = new Object();
            jsonRequest.stylizedImage = base64;
            var jsonData = JSON.stringify(jsonRequest);

            // console.log('Base64 ' + filename + ': ' + base64);
            fs.writeFileSync(targetJsonFile, jsonData);
            console.log("Should have saved :" + targetJsonFile);

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

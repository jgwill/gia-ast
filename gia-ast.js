#!/usr/bin/env node
'use strict';


const giaenc = require("gia-lib-encoding-base64");


//console.log("gia-ast.js - 240329");

const http = require('http');
const https = require('https');

const axios = require('axios').default;
var path = require('path');

const Buffer = require('safer-buffer').Buffer;
const fs = require('fs');
const tempfile = require('tempfile');
const sharp = require('sharp');


var args = process.argv.slice(2);


//----for later

// const yargs = require('yargs');
// var ver = yargs.version();

// var appStartMessage = 
// `Multi platform Contact Sheet maker
// By Guillaume Descoteaux-Isabelle, 2020-2021
// version ${ver}
// ----------------------------------------`;
// //const { argv } = require('process');
// //const { hideBin } = require('yargs/helpers')
// const argv = yargs(process.argv)

// .scriptName("gis-csm")
// .usage(appStartMessage)
//     // .command('serve [port]', 'start the server', (yargs) => {
//     //   yargs
//     //     .positional('f', {
//     //       describe: 'port to bind on',
//     //       type:'string',
//     //       default: 5000
//     //     })
//     // }, (argv) => {
//     //   if (argv.verbose) console.info(`start server on :${argv.port}`)
//     //   //serve(argv.port)
//     //   console.log("test");
//     //   console.info(`start server on :${argv.port}`)
//     // })
//     .option('file', {
//       alias: 'f',
//       type: 'string',
//       description: 'Specify the file out'
//     })
//     .option('directory', {
//       alias: 'd',
//       type: 'boolean',
//       default:false,
//       description: 'Name the output using current Basedirname'
//     }).usage(`gis-csm -d --label  # Assuming this file in directory: vm_s01-v01_768x___285k.jpg
//     # will extract 285 and add that instead of filename`)
//     .option('verbose', {
//       alias: 'v',
//       default:false,
//       type: 'boolean',
//       description: 'Run with verbose logging'
//     })
//     .option('label', {
//       alias: 'l',
//       type: 'boolean',
//       default:false,
//       description: 'Label using last digit in filename (used for parsing inference result that contain checkpoint number)'
//     })
//   .argv;


//-----------

var config = null;

const envListHelp = `
vi ~/.bash_env or vi .env
#export asthostname="orko.guillaumeisabelle.com"
asthostname=localhost
export astoutsuffix="__stylized__"
#export astportbase=90 #DEPRECATED, use full port ex.  9001,7860
# Using two digits will use the portbase anyway
export astcallprotocol="http"
export astcallmethod="stylize"
`;
const default_dot_env = `

# AST 

asthostname=localhost
astoutsuffix=__sty__
astcallprotocol=http
astcallmethod=/stylize
astmetaportnum=8999
astusemetasvr=true
astdebug=false
astsavemeta=true
astcleanname=true
astappendmodelid=false
echocmd=false
devmode=false
astmetaoutputdir=.astmeta
res1=1500

`;

//if no .env, create one using default_dot_env
try {
  if (!fs.existsSync('.env')) {
    fs.writeFileSync('.env', default_dot_env);
    console.log(".env file created with default values");
  }
}
catch (error) {
  console.log("Error creating .env file");
}

try {

  var tst = require('dotenv').config()
  if (tst.parsed) {
    config = new Object()
    var { asthostname, astoutsuffix, astportbase, astcallprotocol, astcallmethod, astmetaurl, astdebug, astsavemeta } = tst.parsed;

    config.hostname = asthostname; config.outsuffix = astoutsuffix; config.portbase = astportbase; config.callmethod = astcallmethod; config.callprotocol = astcallprotocol; config.metaurl = astmetaurl; config.debug = astdebug; config.savemeta = astsavemeta;
    config.src = ".env";

    //Taking Env var if commented or absent from .env
    if (!astoutsuffix) config.outsuffix = process.env.astoutsuffix;
  }


} catch (error) { }
try {
  //@a Init if we did not had a .env
  if (config == null) {
    config = require('./config');

    config.src = "config";
  }


} catch (error) {




  // console.error("config.js NOT FOUND.  ");
  //console.log("Read from ENV VAR");
  try {
    config = new Object();
    var envErr = 0;

    //----grab-the-env

    if (process.env.asthostname)
      config.hostname = process.env.asthostname;
    else envErr++;
    if (process.env.astoutsuffix)
      config.outsuffix = process.env.astoutsuffix;
    else envErr++;
    if (process.env.astportbase)
      config.portbase = process.env.astportbase;
    else envErr++;
    if (process.env.astcallprotocol)
      config.callprotocol = process.env.astcallprotocol;
    else envErr++;
    if (process.env.astcallmethod)
      config.callmethod = process.env.astcallmethod;
    else envErr++;
    config.src = "var";
    if (envErr > 0) {
      console.log("Env require setup");
      console.log(envListHelp);
    }

    //----grab-the-env

  } catch (error) {
    console.error("Require config.js or env var to be set");
    console.log(envListHelp);
    process.exit(1);

  }
}

//AST_STYLIZE_PORT
if (args[0] == "--help" || args[0] == "-h" || args[0] == "-help" || args[0] == "--h" || ((!args[0] && !process.env.AST_STYLIZE_FILENAME) || 
  (!args[1] && !process.env.AST_STYLIZE_PORT ))) {
  console.log(`
-------------------------------------
AST Web API Stylizer CLI Wrapper
by Guillaume D-Isabelle, 2024
Version 1.0.x
--------------------------------------
-------------HELP----------------------
Stylize an image using the Web API.

Synopsis:  
gia-ast <IMAGE-FILENAME> <ModelID> [x1] [abc] 
 
abc: 0-99



usage : 
gia-ast mycontent.jpg 9101
gia-ast mycontent.jpg 9001
gia-ast mycontent.jpg 7861 4000 25    (s1)


export AST_STYLIZE_PORT=9860
export AST_STYLIZE_RES=1500
export AST_STYLIZE_ABC=34
gia-ast mycontent.jpg
export AST_STYLIZE_FILENAME=image.png
gia-ast

# Open the image with feh
FEH=1 gia-ast mycontent.jpg 9101

see also:
gia-ast-server --help
gia-ast-meta --help

------------------------------
  `);
  if (!args[0] || !args[1]) console.log("MISSING ARGUMENTS");
}
else // Lets do the work
{

  var stylizedImage;
  var imgFile = args[0]|| process.env.AST_STYLIZE_FILENAME;
  var x1  = 0;
  var c1 = 0;
  var autosuffix = false;
  var ext = path.extname(imgFile);
  var imgFileBasename = path.basename(imgFile);
  var imgFileNameOnly = imgFileBasename.replace(ext, "");


  var resizeSwitch = false;
  var targetResolutionX = 768; //DEPRECATING
  // if (args[2]) {
  //   resizeSwitch = true;
  //   targetResolutionX = Number(args[2]);
  // }
  
  if (args[2]) { x1 = Number(args[2]); } else x1 = 0
  if (args[3]) { c1 = Number(args[3]); } else c1 = 0

  //exit with message if c1 is larger than 99
  if (c1 > 99) {
    console.log("c1 value is too high. 0-99 only");
    process.exit(1);
  }
  //if (args[4]) { c1 = Number(args[4]); } else c1 = 0

  if (x1 == 0 && (process.env.AST_STYLIZE_RES1 || process.env.AST_STYLIZE_RES) ) x1= process.env.AST_STYLIZE_RES1 || process.env.AST_STYLIZE_RES;

  

  if (c1 == 0 && process.env.AST_STYLIZE_ABC  ) c1= process.env.AST_STYLIZE_ABC;
  

  



  var autosuffixSuffix = "__";//DEPRECATED
  if (args[5] && args[4] && args[3] && (args[5] == "-a" || args[4] == "-a"|| args[3] == "-a")) { autosuffix = true; } else autosuffix = false;
   if (args[6]) { autosuffixSuffix = args[6] ; } //DEPRECATED


  //ModelID is related to a port will use
  


  //ModelID is related to a port will use
  var modelid,portnum = 0;
  if (args[1]) {
    modelid = args[1];
  }
  else {
    //read AST_STYLIZE_PORT
    if (process.env.AST_STYLIZE_PORT) 
      modelid = process.env.AST_STYLIZE_PORT;
  }

  if (modelid.length > 2)
    portnum = modelid; //Enable full use of the Port on another range than the port base
  else if (modelid.length == 2) portnum = config.portbase + modelid;




  var targetOutput = imgFileNameOnly + config.outsuffix + modelid + ext;

  if (autosuffix) //@STCIssue DEPRECATED
  {  
    var x1str = x1 != 0 ? x1+"x":"";
    
    
    
    if (c1 != 0)
    {
      x1str = x1str + c1;
    }
    
    targetOutput = imgFileNameOnly + "__" +x1str   + autosuffixSuffix  + modelid + ext;
  }


  //console.log(" TargetOutput: " + targetOutput);
  
  
  

  const callurl = config.callprotocol + "://" + config.hostname + ":" + portnum + "/" + config.callmethod.replace("/", "");



  //console.log(" : " + imgFile + " at port :" + portnum) +" with targetoutput:"+ targetOutput;

  /*
  //Use later to resized the image if switch used
  sharp('input.jpg')
    .rotate()
    .resize(200)
    .jpeg({ mozjpeg: true })
    .toBuffer()
    .then( data => { ... })
    .catch( err => { ... });
    */
  //  doWeResize(imgFile, config, portnum, callurl, targetOutput, resizeSwitch, targetResolutionX);
  doTheWork(imgFile, config, portnum, callurl, targetOutput, x1, c1, autosuffix);


}

/**
 * 
 * DEPRECATED 
 * @param {*} imgFile 
 * @param {*} config 
 * @param {*} portnum 
 * @param {*} callurl 
 * @param {*} targetOutput 
 * @param {*} resizeSwitch 
 * @param {*} targetResolutionX 
 */
function doWeResize(imgFile, config, portnum, callurl, targetOutput, resizeSwitch = false, targetResolutionX = 512) {

  if (resizeSwitch) {
    var tfile = tempfile('.jpg');
    //console.log("Tempfile:" + tfile);

    sharp(imgFile)
      .resize(targetResolutionX)
      .toFile(tfile, (err, info) => {
        if (err) console.error(err);
        //console.log(info);
        console.log("A resized contentImage should be available at that path :\n    feh " + tfile
          + "  \n     with resolution : " + targetResolutionX);
        // process.exit(1); 
        doTheWork(tfile, config, portnum, callurl, targetOutput,x1,c1);
      });
  } else  //no resize command
  {
    console.log("Normal mode");
    doTheWork(imgFile, config, portnum, callurl, targetOutput, x1,c1);
  }


}


function doTheWork(cFile, config, portnum, callurl, targetOutput, x1 = 0, c1 = 0, autosuffix = false,use_meta_filename_v2=true,suffix="none") {
  try {


    var data = giaenc.
      encFileToJSONStringifyBase64PropWithAbc(cFile, "contentImage", x1, c1, suffix);
    // if (x1 != -1) data.x1= x1;
    
    // if (x3 != -1) data.x3= x3;

    //console.log(data);
    //var unparsedData = JSON.parse(data);

    //---------------------

    const options = {
      hostname: config.hostname,
      port: portnum,
      path: config.callmethod,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      },
      responseType: 'json',
      httpsAgent: new https.Agent({ rejectUnauthorized: false })

    };

    //console.log("Calling : " + config.hostname + ":" + portnum);

    axios.post(callurl, data, options)
      .then(function (response) {
        // var d = JSON.parse(response);
        var { data } = response;
        var { stylizedImage } = data;


        //---import
        // decode_base64_to_file(stylizedImage, targetOutput);
        if (config.debug == "true") 
          fs.writeFileSync("__stylizedImage.json", JSON.stringify(data));

        //if use_meta_name, use the meta name included in the data response 
        if (use_meta_filename_v2  && data["filename"] != null)
          targetOutput = data["filename"];

        giaenc.dec64_StringToFile(stylizedImage, targetOutput);

        if (config.savemeta == "true") {
          data.stylizedImage = null;
          fs.writeFileSync(targetOutput + ".json", JSON.stringify(data));
        }

        const feh_cmd = "A stylizedImage should be available at that path :\n    feh " + targetOutput;
        //if env FEH=1, run feh
        if (process.env.FEH == 1) {
          const { exec } = require('child_process');
          exec("feh " + targetOutput, (error, stdout, stderr) => {
            if (error) {
              console.error(`exec error: ${error}`);
              return;
            }
            
          });
        }
        else    console.log(feh_cmd);


        //console.log(stylizedImage);
      })
      .catch(function (err) {
        console.log("There was error");
        console.log(err.message);
        console.log("---------arrrr 2");
        console.log(err);
      });


    //-----------------------


  } catch (error) {
    console.log("something went wrong: ");
    console.log(error);
    console.log(error.message);
    console.log("---------arrrr 1");
  }
}

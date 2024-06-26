#!/usr/bin/env node
'use strict';



const giaenc = require("gia-lib-encoding-base64");

var defaultMetaTarget = ".";

//dihostname
const http = require('http');
const https = require('https');

const axios = require('axios').default;
var path = require('path');

const Buffer = require('safer-buffer').Buffer;
const fs = require('fs');
const tempfile = require('tempfile');
const sharp = require('sharp');


var args = process.argv.slice(2);


if (args[0] == "--help" || args[0] == "-h" || args[0] == "-help" || args[0] == "--h" || ((!args[0] && !process.env.AST_STYLIZE_FILENAME) || 
  (!args[1] && !process.env.AST_STYLIZE_PORT ))) {
  console.log(`
-------------------------------------
AST Web API Stylizer CLI Wrapper - (with Meta server)
by Guillaume D-Isabelle, 2024
Version 1.0.x
--------------------------------------
-------------HELP----------------------
Stylize an image using the Web API.

Synopsis:  
gia-ast-meta <IMAGE-FILENAME> <ModelID> [x1] [x2] [x3] -a
 
-a  Auto suffix using x1,x2,x3...

usage : 
gia-ast-meta mycontent.jpg 9091
gia-ast-meta mycontent.jpg 9001
gia-ast-meta mycontent.jpg 9112 1280 2048 -1 -a

------------------------------

#-----.env EXAMPLE
#asthostname=osiris.astia.xyz
asthostname=localhost
#asthostname=172.20.241.76
astoutsuffix=__sty__
astportbase=90
astcallprotocol=http
astcallmethod=/stylize
astmetaportnum=8999
astusemetasvr=true
astdebug=false
astsavemeta=true
astcleanname=true
#astsavemeta=false
astappendmodelid=false
dihostname=localhost
echocmd=false
devmode=true
astmetaoutputdir=.astmeta
src=config.js
res1=333


---- Run Meta server
docker run -d --restart unless-stopped --name ast_meta_server -p 8999:8080 -v /a/src/rwml__adaptive_style_transfer:/work -v $HOME/.gia/ast/www/meta:/wwwmeta docker.io/guillaumeai/server:http-server http-server -p 8080 /wwwmeta
## Works with : github.com:GuillaumeAI/rwml__adaptive_style_transfer.git


  `);
  if (!args[0] || !args[1]) console.log("MISSING ARGUMENTS");

  process.exit(1);

}





//-----------

var config = null;

const envListHelp = `
vi ~/.env
#export asthostname="orko.guillaumeisabelle.com"
asthostname=localhost
export astoutsuffix="__stylized__"
export astportbase=90
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

icdirbase=/a/albums/creations
webdir=/kwww/html/astia/albums
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
  //console.log("Do we have a dot env ??");
  var tst = require('dotenv').config()
  if (tst.parsed) {
    //console.log("We do :)");
    config = new Object()
    var { asthostname, astoutsuffix, astportbase, astcallprotocol, astcallmethod, astdebug, astsavemeta, astusemetasvr, astmetaportnum, astappendmodelid, astmetaoutputdir, astcleanname } = tst.parsed;
    if (!astmetaoutputdir) astmetaoutputdir = defaultMetaTarget;

    config.hostname = asthostname;
    config.astmetaoutputdir = astmetaoutputdir; config.outsuffix = astoutsuffix; config.portbase = astportbase; config.callmethod = astcallmethod; config.callprotocol = astcallprotocol;
    config.debug = astdebug == "true"; config.savemeta = astsavemeta == "true";
    config.astcleanname = astcleanname == "true";
    config.usemetasvr = astusemetasvr == "true"; config.metaportnum = astmetaportnum;
    config.appendmodelid = astappendmodelid == "true";
    config.src = ".env";

    //Taking Env var if commented or absent from .env
    if (!astoutsuffix) config.outsuffix = process.env.astoutsuffix;
  }


} catch (error) {
  console.log("An error with .env");
  console.log("Hum, it might not be good, make sure you have one : cp env_sample .env ; vi .env");
  console.log(error);
  console.log("----------------------------------------");
  console.log("---WSL User --> Might be the Fuckin Windows 10 Issue, Just Start another shell or reboot :(");
  console.log("----------------------------------------");

}

//console.log(config);
//process.exit(1);


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


// Lets do the work


var stylizedImage;
var imgFile = args[0];
var x1, x2 = 0;
var c1 = 0;
var xname = "";
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
if (args[3]) { x2 = Number(args[3]); } else x2 = 0
if (args[4]) { c1 = Number(args[4]); } else c1 = 0

if (x2 < 99 && x2 > -99 && c1 == 0) c1 = x2;

var autosuffixSuffix = "__";//DEPRECATED
if (args[5] && args[4] && args[3] && (args[5] == "-a" || args[4] == "-a" || args[3] == "-a")) { autosuffix = true; } else autosuffix = false;
if (args[6]) { autosuffixSuffix = args[6]; } //DEPRECATED



//ModelID is related to a port will use
var modelid,portnum = 0;
if (args[1]) {
  modelid = args[1];
}
else {
  //read AST_MODEL_PORT
  if (process.env.AST_MODEL_PORT) 
    modelid = process.env.AST_MODEL_PORT;
}

if (modelid.length > 2)
  portnum = modelid; //Enable full use of the Port on another range than the port base
else if (modelid.length == 2) portnum = config.portbase + modelid;



var targetOutput = imgFileNameOnly + config.outsuffix + modelid + ext;

if (autosuffix) {
  var x1str = x1 != -1 ? x1 + "x" : "";
  var x2str = x2 != -1 ? x2 + "x" : "";


  xname = x1str + x2str;
  targetOutput = imgFileNameOnly + "__" + xname + autosuffixSuffix + modelid + ext;
}
//@STCGoal Stuff we do not really want be removed from filename
if (config.astcleanname) { //astcleanname

  targetOutput = make_astcleanname(targetOutput);
}






const callurl = `${config.callprotocol}://${config.hostname}:${portnum}/${config.callmethod.replace("/", "")}`;
const callurlmeta = `${config.callprotocol}://${config.hostname}:${config.metaportnum}/${portnum}.json`;




console.log("Processing: " + imgFile + " at port :" + portnum);

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
//  doWeResize(imgFile, config, portnum, callurl, callurlmeta,targetOutput, resizeSwitch, targetResolutionX);
doTheWork(imgFile, config, portnum, callurl, callurlmeta, targetOutput, x1, x2, x3, autosuffix);




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
function doWeResize(imgFile, config, portnum, callurl, callurlmeta, targetOutput, resizeSwitch = false, targetResolutionX = 512) {

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
        doTheWork(tfile, config, portnum, callurl, targetOutput);
      });
  } else  //no resize command
  {
    console.log("Normal mode");
    doTheWork(imgFile, config, portnum, callurl, callurlmeta, targetOutput, x1, x2, x3);
  }


}


function make_astcleanname(_targetOutput) {

  var r = _targetOutput
    .replace("model_gia-ds-", "")
    .replace("_ast_", "")
    .replace("gia-ds-", "")
    .replace("model_gia-", "")
    .replace("model_", "")
    .replace("-1-1-", "_")
    .replace("-1-", "_")
    .replace("-1", "_")
    .replace("-x_", "_")
    .replace("___", "__")
    .replace("-864x_new", "")
    .replace("-864x_", "");
  // console.log("Cleaning the name: " + _targetOutput);
  return r;
}

var metaretry = 3;

function doTheWork(cFile, config, portnum, callurl, callurlmeta, targetOutput, x1 = 0, x2 = 0, c1 = 0, use_meta_filename_v2 = true, autosuffix = false, suffix = "") {
  try {

    var data;
    try {
      data = giaenc.
        encFileToJSONStringifyBase64PropWithX2Abc(cFile, "contentImage", x1, x2, c1, suffix);

    } catch (error) {
      process.exit(1);
    }
    // if (x1 != -1) data.x1= x1;
    // if (x2 != -1) data.x2= x2;
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

    const optionsMeta = {
      hostname: config.hostname,
      port: 8999,
      path: portnum + ".json",
      method: 'GET',
      responseType: 'json',
      httpsAgent: new https.Agent({ rejectUnauthorized: false })

    };
    console.log("Calling : " + callurl);

    axios.post(callurl, data, options)
      .then(function (response) {
        // var d = JSON.parse(response);
        var { data } = response;
        var { stylizedImage } = data;


        //---import
        // decode_base64_to_file(stylizedImage, targetOutput);
        if (config.debug) fs.writeFileSync("__stylizedImage.json", JSON.stringify(data));

        if (!config.usemetasvr || (use_meta_filename_v2 && data["filename"] != null)) {
          if (use_meta_filename_v2 && data["filename"] != null)
            targetOutput = data["filename"];
          saveStylizedResult(stylizedImage, data, targetOutput, config);
        }
        else {
          //@a CHG the output using a Call to meta server
          if (config.debug) console.log("Calling Meta: " + callurlmeta);

          axios.get(callurlmeta, optionsMeta)
            .then(function (metaResp) {
              var metadata = metaResp.data;
              //console.log(metadata);
              var { checkpointno, svrtype, PASS1IMAGESIZE, PASS2IMAGESIZE, PASS3IMAGESIZE, modelname, fname, containername, containertag, mtype } = metaResp.data;
              var xtraModelID = config.appendmodelid ? "__" + modelid : "";

              var mtag = `${fname}__${xname}__${svrtype}__${checkpointno}k`;

              targetOutput = (imgFileNameOnly
                + "__"
                + modelid
                + "__"
                + mtag
                + xtraModelID
                + ext)
                .replace("_-", "_")
                .replace("___", "__")
                ;


              //@STCGoal Stuff we do not really want be removed from filename
              if (config.astcleanname) {

                targetOutput = make_astcleanname(targetOutput);
              }
              // console.log(targetOutput);

              // targetOutput = imgFileNameOnly + "__" + mtag + autosuffixSuffix + modelid + ext;
              //process.exit(1);
              saveStylizedResult(stylizedImage, data, targetOutput, config, metadata);

            })
            .catch(function (errMeta) {
              if (metaretry > 0) {
                //Launch the docker container
                startmeta();
                metaretry = metaretry - 1;
                console.log("\t Retrying to launch this function to do the work with the Meta hopefully started");
                doTheWork(cFile, config, portnum, callurl, callurlmeta, targetOutput, x1, x2, x3, autosuffix);

              }
              else {

                console.log("There was error with meta server (your file might save right anyway");
                console.log("---------------------------------------------------");
                console.log(errMeta.message);
                console.log("---------------------------------------------------");

                console.log("---------------------------------------------------");
                console.log("---------TRYING TO SAVE  WITHOUT META SERVER DATA----------");
                console.log("---------------------------------------------------");
                console.log("---------Make this faster by DISABLE astusemetasvr=false in .env ------");
                console.log("---------Or start the server ------");
                console.log("--");
                console.log("---------------------------------------------------");

                saveStylizedResult(stylizedImage, data, targetOutput, config);
                process.exit(3);
              }
            });

          //@a then save result
          // saveStylizedResult(stylizedImage, targetOutput, config);
        }




        //console.log(stylizedImage);
      })
      .catch(function (err) {
        console.log("There was error");
        console.log(err.message);
        console.log("---------arrrr 2 - Calling ast servers");
        process.exit(2);
      });


    //-----------------------


  } catch (error) {
    console.log("something went wrong doing the work: ");
    console.log(error);
    console.log(error.message);
    console.log("---------arrrr 1 - doing the work went wrong");
    process.exit(1);
  }
}


function saveStylizedResult(stylizedImage, data, targetOutput, config, metaData = null) {
  //console.log("targetOutput:" + targetOutput);
  //console.log("stylizedImage:" +  stylizedImage);
  giaenc.dec64_StringToFile(stylizedImage, targetOutput);

  data.stylizedImage = null;
  if (metaData) data.meta = metaData;

  if (config.savemeta) {
    var outdir = ".";
    if (config.astmetaoutputdir == ".") outdir = __dirname;
    else
      try {
        fs.mkdirSync(config.astmetaoutputdir, { recursive: true });
        outdir = config.astmetaoutputdir;
      } catch (error) {

      }
    var metaoutputfile = path.join(outdir, targetOutput + ".json");
    fs.writeFileSync(metaoutputfile, JSON.stringify(data));
  }
  if (!config.savemeta) {

  }

  console.log("A stylizedImage should be available at that path :\n    feh " + targetOutput);
}




function startmeta() {

  const { exec } = require("child_process");

  exec("docker start ast_meta_server", (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
}

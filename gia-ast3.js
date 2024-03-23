#!/usr/bin/env node

//@STCGoal A command with two positional args
var cnf = new Object();
var _cnfLoaded = false;

const envListHelp = `
vi ~/.bash_env
export asthostname="orko.guillaumeisabelle.com"
export astoutsuffix="__stylized__"
export astportbase=90
export astcallprotocol="http"
export astcallmethod="stylize"
export dihostname=$asthostname
export diport=80
export astportrange=90

`;

// const fetch = require('node-fetch');
const http = require("http");
const https = require('https');

const axios = require('axios').default;

const Buffer = require('safer-buffer').Buffer;
const fs = require('fs');
const tempfile = require('tempfile');
const sharp = require('sharp');



var url = "http://jgwill.com/data/dkrunningcontainerports.txt";
const urlexist = require("url-exists");
const dns = require('dns');

//const process = require("process").process;

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

var list = "";
var prettyList = "";
var servers = new Object();
var ports = new Object();

var arrComplete = [
  'ast',
  'list',
  'ls',
  'stylize',
  'completion'
];

//var ver = yargs.version();
var mode = "NONE";
var appStartMessage =
  `Mastery Yargs - GIA Ast
By Guillaume Descoteaux-Isabelle, 2020-2021
version 
----------------------------------------`;
const { argv, exit } = require('process');
// const { exit } = require("node-process");

// const { hideBin } = require('yargs/helpers')
//const argv = yargs(process.argv)
// .scriptName("gia-ast2")
// .usage(appStartMessage)   
yargs(hideBin(process.argv))

  .scriptName("gia-ast2")
  .usage(appStartMessage)
  .epilogue('for more information, find our manual at http://guillaumeisabelle.com')

  .command('list [dihostname] ', 'List available model from the hub',
    (yargs) => listSetupCLI(yargs), (argv) => listArgsParsing(argv))
  .command('ls [dihostname] ', 'List available model from the hub',
    (yargs) => listSetupCLI(yargs), (argv) => listArgsParsing(argv))

  .option('pretty', {
    default: false,
    type: 'boolean',
    description: 'Changes the output'
  })
  .option('diport', {
    alias: 'dip',
    type: 'string',
    default: '80',
    description: 'diport to look for getting data we would use'
  })


  .command('stylize [file] [astport]', 'Stylize a file using the selected AST Port', (yargs) => stylizeSetupCLI(yargs), (argv) => stylizeArgsParsing(argv)).alias("ast", 'stylize')
  .example("$0 ast sample.jpg 98", "# Stylize using model id 98")

  .command('ast [file] [astport]', '# Stylize using model id 98 ', (yargs) => stylizeSetupCLI(yargs), (argv) => stylizeArgsParsing(argv))


  .option('asthostname', {
    alias: 'ah',
    type: 'string',
    default: '#ENV',
    description: 'HostNamed the main model server'
  })
  
  .option('astportbase', {
    alias: 'apb',
    type: 'string',
    default: '#ENV',
    description: 'default port base on main model server'
  })

  .option('verbose', {
    alias: 'v',
    default: false,
    type: 'boolean',
    description: 'Run with verbose logging'
  })
  .option('showargs', {
    alias: 'sa',
    default: false,
    type: 'boolean',
    description: 'dev - Show the arguments'
  })
  .option('showcnf', {
    alias: 'showconf',
    default: false,
    type: 'boolean',
    description: 'dev - Show the conf'
  })
  .option('label', {
    alias: 'l',
    type: 'boolean',
    default: false,
    description: 'Label using last digit in filename (used for parsing inference result that contain checkpoint number)'
  })

  // .completion('completion', function (current, argv, done) {

  //   // return ["ast_xfp","compo_eou"];
  //   setTimeout(function () {

  //     if (argv._[0] == "ast") {
  //       listing(function (r) {
  //         // console.log(r.ports);
  //         var o = "";
  //         count = 0;
  //         arr = [];
  //         for (const [key, value] of Object.entries(r.ports)) {
  //           //console.log(`${key}: ${value}`);
  //           o += `${key}: ${value}\n`;
  //           arr[count] = value;
  //           count++;
  //         }
  //         done(arr);
  //       });
  //     }
  //     else return arrComplete;

  //   }, 500);
  //   return arrComplete;
  // })
  .argv;


// var config = null;
  
// try {
//   //console.log("Do we have a dot env ??");
//   var tst = require('dotenv').config()
//   if (tst.parsed) {
//     //console.log("We do :)");
//     config = new Object()
//     var { asthostname, astoutsuffix, astportbase, astcallprotocol, astcallmethod, astdebug, astsavemeta, astusemetasvr, astmetaportnum, astappendmodelid } = tst.parsed;

//     config.hostname = asthostname; config.outsuffix = astoutsuffix; config.portbase = astportbase; config.callmethod = astcallmethod; config.callprotocol = astcallprotocol; 
//     config.debug = astdebug == "true"; config.savemeta = astsavemeta == "true";
//     config.usemetasvr = astusemetasvr == "true"; config.metaportnum = astmetaportnum;
//     config.appendmodelid = astappendmodelid == "true";
//     config.src = ".env";
    
//     //Taking Env var if commented or absent from .env
//     if (!astoutsuffix) config.outsuffix = process.env.astoutsuffix;
//   }
  
  
// } catch (error) {
//   console.log("An error with .env");
//   console.log("Hum, it might not be good, make sure you have one : cp env_sample .env ; vi .env");

//  }


function showAstCompletion() {
  // console.log("ast FILE ModelPort");
}
// console.log(argv._);
// console.log(argv);
//console.log(argv.label ? "Labels":"");

function getAstHosts() {
  return ['orko',
    'as',
    'gaia',
    'custom'];
}

function ast(_cnf, cb = null) {
  loadcnf(_cnf, function (_cnf, err) {
    cnf = _cnf;
    //console.log(_cnf);
    try {
      var { file, astport } = cnf.options;

    } catch (error) {

    }
    //console.log("->"+argv[2]+"<-");
    //console.log("->"+argv[1]+"<-");
    if (argv[2] == "--get-yargs-completions") {
      setTimeout(function () {
        listingAsArray(cnf, (r) => {
          //console.log(r);
          if (cb && typeof cb === "function")
            cb(r);
          //exit();
          //return;
        });
      }, 444);
    }
    else {

      console.log("Stylizing using port : " + astport + " for file: " + file);

    }
  });

}

/** Preprocess before parsing Command Arguments
 * 
 * @param {*} argv 
 */
function preProcessCommandArgs(argv, cb = null) {

  if (!_cnfLoaded)
    cnf = loadcnf(cnf, function (_cnf, err) {
      if (err) {
        // console.error(err);
        if (cb && typeof cb === "function")
          cb(cnf, err);
      }
      else {

        // if (argv.pretty) {cnf.pretty=true;console.log("Pretty switch on");}
        //  if (argv.verbose) {cnf.verbose=true;console.info(`Infering on :${argv.port} for file: ${argv.file}`);}
        // if (argv.label) {cnf.label=true;console.log("Label switch on");}
        // if (argv.showargs) {cnf.showargs=true;console.log(argv);}

        var { pretty, verbose, label, showargs, file, astport, asthostname, dihostname, callmethod, showcnf, diport, port_only,port_id } = argv;

        if (!asthostname || asthostname == '#ENV') {
          try {
            if (process.env.asthostname) asthostname = process.env.asthostname;
          } catch (error) { }
        }
        if (!dihostname || dihostname == '#ENV') {
          try {
            if (process.env.dihostname) dihostname = process.env.dihostname;
            else dihostname = asthostname;
          } catch (error) { }
        }
        cnf.options = { pretty, verbose, label, showargs, file, astport, asthostname, dihostname, callmethod, diport, port_only,port_id };

        // console.log(cnf)

        if (showcnf) console.log(cnf);

        if (cb && typeof cb === "function")
          cb(cnf, null);

      }
    });


}

function loadcnf(cnf, cb = null) {

  if (!cnf || cnf["options"] == null) {
    try {
      if (fs.existsSync(__dirname + '/cnf.js'))
        cnf = require(__dirname + '/cnf.js');
      else if (fs.existsSync(process.env.HOME + '/astcnf.js'))
        cnf = require(process.env.HOME + '/astcnf.js');
      else {
        _cnfLoaded = loadCNFFromEnv(cnf) < 1 ? true : false;
      }

    } catch (error) {
      // console.error("cnf.js NOT FOUND.  ");
      //console.log("Read from ENV VAR");
      try {
        if (cnf == null) cnf = new Object();

        _cnfLoaded = loadCNFFromEnv(cnf) < 1 ? true : false;
        //----grab-the-env

      } catch (error) {
        console.error("Require astcnf.js in $HOME or cnf.js in " + __dirname + " or env var to be set. \n see bellow:");
        console.log(envListHelp);
        if (cb && typeof cb === "function")
          cb(cnf, err);
        process.exit(1);

      }
    }
  }
  if (cb && typeof cb === "function")
    cb(cnf, null);
  // return cnf;
}

function loadCNFFromEnv(cnf) {
  var envErr = 0;

  //----grab-the-env
  console.log("//@STCIssue cleanup double  var astportrange and astportbass");

  if (process.env.asthostname)
    cnf.asthostname = process.env.asthostname;
  else envErr++;
  if (process.env.astoutsuffix)
    cnf.outsuffix = process.env.astoutsuffix;
  else envErr++;
  if (process.env.astportbase)
    cnf.portbase = process.env.astportbase;
  else envErr++;
  if (process.env.astportrange)
    {cnf.portrange = process.env.astportrange;
  }
  else envErr++;
  if (process.env.astcallprotocol)
    cnf.callprotocol = process.env.astcallprotocol;
  else envErr++;
  if (process.env.astcallmethod)
    cnf.callmethod = process.env.astcallmethod;
  else envErr++;
  if (process.env.diport)
    cnf.diport = process.env.diport;
  else envErr++;
  if (process.env.dihostname)
    cnf.dihostname = process.env.dihostname;
  else envErr++;

  if (envErr > 0) {
    console.log("Env require setup");
    console.log(envListHelp);
    _cnfLoaded = false;
  }
  else _cnfLoaded = true;
  return envErr;
}

/** Parse Stylize CMD Args
 * 
 * @param {*} argv 
 * @param {*} cb 
 */
function stylizeArgsParsing(argv, cb = null) {

  preProcessCommandArgs(argv, function (_cnf, err) {



    ast(_cnf, function (arr) {
      //console.log(arr);
      //console.log("aléo")

      if (cb && typeof cb === "function")
        cb(arr);

    });
  });
}

/** Stylize Setup CLI yargs
 * 
 * @param {*} yargs 
 * @returns 
 */
function stylizeSetupCLI(yargs) {


  mode = "AST";
  // .alias('ast [file] [port]')
  return yargs.positional('file', {
    describe: 'file to stylize.',
    type: 'string',
    default: '.'
  })
    .example('$0 s sample.jpg 98', 'Would stylize sample.jpg using astport 98.')
    .example('$0 s .jpg 98', 'Would stylize all jpgs.')
    .positional('astport', {
      describe: 'ast of the model port',
      default: 52
    })
    .option('callmethod', {
      alias: 'cm',
      type: 'string',
      default: '/stylize',
      description: 'Stylization method on the server'
    })
    .option('save_dir', {
      alias: 'o',
      type: 'string',
      default: "_aststylized",
      description: 'Name the output '
    })
    .option('file_suffix', {
      alias: 'o',
      type: 'string',
      default: "_stylized",
      description: 'specify file suffix '
    })

    .option('image_size', {
      alias: 'image_size',
      type: 'Number',
      default: 768,
      description: `For training phase: will crop out images of this particular size.
     For inference phase: each input image will have the smallest side of this size. 
     For inference recommended size is 1280.`
    })

    .option('ckpt_nmbr',
      {
        alias: 'chk',
        type: 'Number',
        default: '300',
        description: `CheckpoNumber number we want to use for inference.  Might be null(unspecified), then the latest available will be used.`
      })

    .option('model_name', {
      alias: 'model_name',
      default: 'model1',
      description: `Name of the model.  
      //@STCGoal Might use this to call the service for a model that might not be hydrated on a port.  It would take care of giving us inference from the model we specified.`
    })
    .example('$0 s.jpg --model_name "model_gia-ds-daliwill-210123-v01_new"', ' Load latest chkpoint or otherwise spec --ckpt_nmbr 105')
    .example('$0 s.jpg --ckpt_nmbr 105 --model_name "model_gia-ds-daliwill-210123-v01_new"', ' Load spec chkpoint ')
    // .deprecateOption('ast')
    // .option('s')

    .completion('completion', function (current, argv2, done) {

      //console.log("Current-" + current);
      // console.log("1:"+argv2._[1]);
      // console.log("2:"+argv2._[2]);
      var gotFile = false;
      try {
        if (fs.existsSync(argv2._[2])) gotFile = true;

      } catch (error) {

      }
      //if (gotFile)console.log("Got a file");

      if (current == "list" || current == "ls" || argv2._[1] == "list") {
        //console.log("Going in LIST")
        done(getAstHosts());
      }


      if (current != "ast" && current != "stylize" && argv2._[1] != "ast" && argv2._[1] != "stylize") done(arrComplete);

      // else console.log("Going in ast")
      setTimeout(function () {
        // console.log("--" + current);
        if (argv2._[1] == "ast" || argv2._[1] == "stylize") {
          ast(cnf, (r) => {
            //console.log(r);
            done(r);
          });
        }
        else {

          // console.log("->"+argv[2]+"<-");
          //console.log(current);
          if (argv2._[2] != "--get-yargs-completions" && argv2._[1] != "ast") {

            mode = "NONE";
            console.log('mode:NONE');
            done(arrComplete);
          }
        }


      }, 444);
      // return arrComplete;
      return ['ast',
        'list',
        'ls',
        'stylize',
        'complete'];
    })





    ;
}
/** Parse the list CMD args
 * 
 * @param {*} argv 
 * @param {*} cb 
 */
function listArgsParsing(argv, cb = null) {
  preProcessCommandArgs(argv, function (_cnf, err) {



    listing(_cnf, function (r, err) {
      if (err) {
        console.log("Some error occured");
        exit(1);
      }
      if (cb && typeof cb === "function")
        cb(r);

    });

  });
}

/** Setup List Command for the CLI
 * 
 * @param {*} yargs 
 * @returns 
 */
function listSetupCLI(yargs) {
  mode = "LIST";
  // .alias('ast [file] [port]')
  return yargs.positional('dihostname', {
    describe: 'dihostname',
    type: 'string',
    default: '#ENV'
  })
    // .positional('diport', {
    //   describe: 'diport to look for getting data we would use',
    //   default: 80
    // })

    .option('port_id', {
      alias: 'pid',
      default: false,
      type: 'boolean',
      description: 'Show ports id for available model'
    })
    .option('port_only', {
      alias: 'po',
      default: false,
      type: 'boolean',
      description: 'Show ports only for available model'
    })

    .example("$0 list as.jgwill.com", "#List the models being served at that host")
    ;
}

function listingAsArray(cnf, cb = null, dihostname = "ENV", port = 80) {
  listing(cnf, function (r) {
    if (r.error) exit(1);

    var o = "";
    count = 0;
    arr = [];
    for (const [key, value] of Object.entries(r.ports)) {
      //console.log(`${key}: ${value}`);
      if (key != "") {
        o += `${key}: ${value}\n`;
        arr[count] = value;
      }
      count++;
    }
    //console.log(arr);
    if (cb && typeof cb === "function")
      cb(arr);

  });
}
function makeCallURL(cnf, cb = null) {
  //console.log(cnf);

  loadcnf(cnf, function (_cnf, err) {
    // console.log(_cnf);

    var { diport, dihostname } = _cnf;
    var urlreturn = "http://" + dihostname + ":" + diport + "/data/dkrunningcontainerports.txt";
   // console.log(urlreturn);

    if (cb && typeof cb === "function")
      cb(urlreturn);
  });
}

function checkDNSHost(dihostname, cb = null) {
  dns.lookup(dihostname, function (err, result) {
    //console.log(result);
    if (err) {
      console.log("BAD Host or unaccessible");
      if (cb && typeof cb === "function") cb(err, result);
      exit(1);
    }
    else {
      if (cb && typeof cb === "function") cb(err, result);

    }
  });//DNS resolved
}

/** List the available agent
 * 
 * @param {*} cnf 
 * @param {*} cb 
 */
function listing(cnf, cb = null) {
  //console.log("Listing available model. ");
  //var callurl = url;

  makeCallURL(cnf, (callurl) => {

    // "http://" + dihostname + ":" + port + "/data/dkrunningcontainerports.txt";

    // console.log(dihostname);
    // console.log(port);
    // console.log(callurl);

    checkDNSHost(cnf.dihostname, function (err1, results) {


      urlexist(url, function (err2, exists) {
        //console.log(exists); // true
        if (!exists || err2 || err1) {
          console.log("BAD URL or unaccessible.");
          exit(1);
        }
        try {

          http.get(callurl, res => {
            res.setEncoding("utf8");
            let body = "";
            res.on("error", err => {
              // console.log(err.message);
              var errO = new Object();
              errO.message = err.message;
              errO.name = err.name;
              errO.error = 1;

              if (cb && typeof cb === "function") cb(null, errO);
              return;
            });
            res.on("data", data => {
              body += data;
            });
            res.on("end", () => {
              // body = JSON.parse(body);
              list = "";
              prettyList = "";

              servers = new Object();
              ports = new Object();
              //console.debug(body);
              var arr = body.split(" ");
              arr.forEach(a => {
                var iarr = a.replace("\n", "").split(":");
                var p = iarr[0];
                var c = iarr[1];
                servers[c] = p;
                ports[p] = c;
                var l = `${p}\t ${c}`;
                list += a + " ";
                prettyList += l + "\n";

              });
              var r = new Object();
              //r.ports = ports;
              //r.servers = servers;
              r = { ports, servers, list, body };

              if (mode == "LIST") {
                console.log();
                if (cnf.options.pretty)
                  console.info(prettyList);
                else  if (cnf.options.port_only || cnf.options.port_id)   
                {
                  var sub_port_id= cnf.options.port_only ? 0:2;

//@STCgoal Get only ports so we can use in loops
                  var arr = list.split(" ");
                  var ports = "";
                  arr.forEach(e => {
                    var p= "";var n = "";
                    try {
                      p = e.split(":")[0];
                      n = e.split(":")[1];                      
                    } catch (error) {     }
                    //console.log(p);
                    try {
                      if (n.indexOf("ast") > -1)
                             ports += p.substr(sub_port_id) + " ";
                      
                    } catch (error) { }
                  });
                   console.info(ports );
                  }

                else
                console.info(list );

              }
              //else               console.log(list);

              if (cb && typeof cb === "function") cb(r);
            });
          });
        } catch (error) {
          // console.log(error.message)
          var errO = new Object();
          errO.message = error.message;
          errO.name = error.name;
          errO.error = 1;

          if (cb && typeof cb === "function") cb(null, errO);
        }

        // fetch(url)
        //   .then(res => res.text())
        //   .then(text => console.log(text));

        // console.log("done")

      });//URL Exist

    });
  });
}
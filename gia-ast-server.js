#!/usr/bin/env node

var fs = require('fs');

//Run server hosted on HuggingFace

//load .env in $HOME
var tst = require('dotenv').config({ path: process.env.HOME + '/.env' });



//docker rm astpicasso --force
var valid_choices_are = "picasso,van-gogh,roerich,pollock,peploe,munch,monet,kirchner,gauguin,el-greco,cezanne,morisot,pikawill02b,pikawill02b-285ik,ap2404_v1-90ik,ap2404_v1-105ik,ap2404_v1-120ik,ap2404_v1-135ik,ap2404_v1-150ik,ap2404_v1-165ik,ap2404_v1-180ik,ap2404_v1-195ik,ap2404_v1-210ik,ap2404_v1-225ik,ap2404_v1-240ik,ap2404_v1-255ik";

//if env var AST_SERVER_CHOICES is set, use that instead
if (process.env.AST_SERVER_CHOICES) {
  valid_choices_are = process.env.AST_SERVER_CHOICES;
}
var max_retries = 50;
//if env var AST_SERVER_RETRY_MAX is set, use that instead
if (process.env.AST_SERVER_RETRY_MAX) {
  max_retries = process.env.AST_SERVER_RETRY_MAX;
}

var starting_base_port = 7860;
//if env var AST_SERVER_BASE_PORT is set, use that instead as starting_base_port
if (process.env.AST_SERVER_STARTING_BASE_PORT) {
  starting_base_port = process.env.AST_SERVER_STARTING_BASE_PORT;
}


//AST_META_SERVER_ROOT $HOME/.gia/ast/www/astia
var ast_meta_server_root = process.env.HOME + "/.gia/ast/www/meta";

if (process.env.AST_META_SERVER_ROOT) {
  ast_meta_server_root  = process.env.AST_META_SERVER_ROOT;
}

//mkdir
if (!fs.existsSync(ast_meta_server_root)) {
  fs.mkdirSync(ast_meta_server_root, { recursive: true });
}


//AST_NS guillaumeai
var ast_ns = "guillaumeai";
if (process.env.AST_NS) {
  ast_ns = process.env.AST_NS;
}

//sregistry = "registry.hf.space"
var sregistry = "registry.hf.space";
if (process.env.AST_SREGISTRY) {
  sregistry = process.env.AST_SREGISTRY;
}



const { exec } = require('child_process');

function main() {
  var keep_going = false;
  console.log(process.argv[2] );
  if (process.argv[2] && (process.argv[2] == "--list" || process.argv[2] == "-l")){
    exec("docker ps|grep ast-", (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        process.exit(1);
        
      }
      console.log(stdout);
      process.exit(1);
    });
  }
  else {
    keep_going = true;
  }

  //if cli called with "--picasso", run command above
  if (process.argv[2] && keep_going) {
  

    model_name = process.argv[2].replace("--", "").replace("ast-", "").replace("ast", "");
    var container_name = "ast-" + model_name;

    //if the argument is not in the list of valid choices, exit
    if (!valid_choices_are.includes(model_name)) {
      show_valid_choices();
      process.exit(1);
    }

    if (process.argv[3] == "--rm" || process.argv[3] == "--pull") {
      //remove the container
      var repo_tag = get_huggingface_repo_tag(model_name, ast_ns, sregistry);
      if (process.argv[3] == "--pull") {
        exec("docker pull " + repo_tag, (err, stdout, stderr) => {
          if (err) {
            console.error(err);
            return;
          }
          console.log(stdout);
          console.log("Container " + container_name + " pulled");
          //exit the process
          process.exit(1);
        });
      }
      if (process.argv[3] == "--rm") {
        exec("docker rm " + container_name + " --force", (err, stdout, stderr) => {
          if (err) {
            console.error(err);
            return;
          }
          console.log("container " + container_name + " stopped and removed");
          //exit the process


        });
      }
    }
    else {



      var local_port = starting_base_port;
      if (process.argv[3]) {
        //local port to run the server on
        local_port = process.argv[3];
      }


      run_container_exit_if_running(container_name, local_port)



    }

  }
  else {
    if (keep_going){
    show_valid_choices();
    process.exit(1);}
  }
}

function launch_server(local_port, container_name = "ast-picasso", ns = "guillaumeai") {

  var cmd_launcher = create_docker_run(ast_model = container_name, local_port = local_port, ns = ns);
  var retryCount = 0;

  function launchServerWithRetry() {
    exec(cmd_launcher, (err, stdout, stderr) => {
      if (err) {
        if (retryCount > max_retries) console.error(err);
        if (retryCount < max_retries) {
          retryCount++;
          local_port++;
          cmd_launcher = create_docker_run(ast_model = container_name, local_port = local_port, ns = ns);
          launchServerWithRetry();

          //console.log("container_name: " + container_name + " local_port: " + local_port);
        } else {
          console.error("Failed to launch server after maximum retries.");
        }
        return;
      }

      post_launch_output(stdout, local_port,container_name,ns);
    });
  }

  launchServerWithRetry();

  return local_port;
}

function post_launch_output(stdout, local_port,container_name,ns="guillaumeai",sregistry="registry.hf.space") {
  console.log(stdout + "\n---------------\n>docker container named: " + container_name + " launched on port :" + local_port);
  const cname = container_name.replace("ast", "");
  
  //console.log("docker stop " + container_name + " --force #to remove");
  console.log(">  to stop the container, run : gia-ast-server --" + cname + " --rm");
  console.log(">  the likely url for the API is http://localhost:" + local_port + "/stylize" + "\n>     gia-ast sample.jpg " + local_port);
  
  
  // //@STCGoal MetaData for the server
  // const checkpoint_no = get_ik_from_container_name(cname);
  // const cname_no_ik = cname.replace("-"+checkpoint_no+"ik", "");
  // const repo_tag = get_huggingface_repo_tag(ast_model, ns, sregistry);

  // const metadata = createMetaData(
  //   modelname= cname,
  //   fname= cname_no_ik,
  //   containername= cname,
  //   containertag= repo_tag,
  //   checkpointno= checkpoint_no,
  //   svrtype= "s1",
  //   mtype= "ast",
  //   type= "singleone",
  //   autoabc= "",
  //   callurl= "http://localhost:"+local_port+"/stylize",
  //   PASS1IMAGESIZE= "2048",
  //   getmetaurl= "http://localhost/"+local_port+".json",
  //   created= new Date().toUTCString()
  // );
  // saveMetadata(local_port, metadata);
  // console.log("Metadata saved to " + ast_meta_server_root + "/" + local_port + ".json");
}

function show_valid_choices() {
  console.log("valid choices are :");
  for (let choice of valid_choices_are.split(",")) {
    console.log("gia-ast-server --" + choice);
  }

  const DOT_ENV_SERVER = `
# dotenv for AST Server
AST_SERVER_CHOICES="picasso,van-gogh,roerich,pollock,peploe,munch,monet,kirchner,gauguin,el-greco,cezanne,morisot,pikawill02b"
AST_SERVER_RETRY_MAX=60
AST_SERVER_STARTING_BASE_PORT=7860 

#default is $HOME/.gia/ast/www/meta
#AST_META_SERVER_ROOT=/www/astia/info
  `;
}

function create_docker_run(ast_model = "ast-picasso", local_port = 7860, ns = "guillaumeai", sregistry = "registry.hf.space") {

  //check if local port is available, if not, increment by 1 until one is available
  //docker ps  -f publish=$port|grep $port
  //t_port = get_available_port(local_port); //@STCIssue Bugged
  t_port = local_port;
  if (t_port != local_port) {
    console.log("port " + local_port + " is taken, using " + t_port + " instead");
  }

  repo_tag = get_huggingface_repo_tag(ast_model, ns, sregistry);

  result = "docker run -d --rm --name " + ast_model + " -p " + t_port + ":7860 --platform=linux/amd64 " + repo_tag;
  //console.log(result);
  return result;
}

function get_huggingface_repo_tag(ast_model, ns = "guillaumeai",sregistry = "registry.hf.space") {
  
  res = sregistry + "/" + ns + "-ast-" + ast_model + ":latest ";

  return res.replace("ast-ast-", "ast-");
}

function run_container_exit_if_running(container_name, local_port, callback_not_running, verbose = true) {

  var cmd_launcher = "echo $(for i in $(docker ps|grep " + container_name + ");do echo $i|grep \"0.0.0.0:\";done)|tr \":\" \" \"|tr \"-\" \" \"|awk '{print $2}'"
  //console.log("cmd_launcher: " + cmd_launcher);

  exec(cmd_launcher, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return false;
    }
    else {
      if (stdout == "" || stdout == " " || stdout.length < 3) {
        if (verbose) console.log("Launching container..." + container_name + "");

        local_port = launch_server(local_port, container_name);

        if (callback_not_running) callback_not_running()

        return false;
      }
      //console.log("stdout: " + stdout);
      //console.log("stderr: " + stderr);
      if (verbose) console.log("Container " + container_name + " already running on port:" + stdout);

      process.exit(1);
      return true;
    }
  }
  );
}


// function get_available_port(local_port) {
//   //check if local port is available, if not, increment by 1 until one is available
//   //docker ps  -f publish=$port|grep $port
//   used = true;
//   while (used) {
//     //var cmd = "bash -c \"tst=$(docker ps -q -f publish=" + local_port + ");if [ ! -n \"$tst\" ];then echo not used;else echo used;fi\"";// + "|grep " + local_port;
//     // var cmd = "docker ps -q -f publish=" + local_port;// + "|grep " + local_port;
//     var cmd = "docker ps|grep \":" + local_port + "\"";// + "|grep " + local_port;
//     //console.log(cmd);

//     var stdout = exec(cmd, (err, stdout, stderr) => {
//       if (err) {
//         console.error(err);
//         return;
//       }
//       console.log(stdout);
//       return stdout;
//     });

//     if (stdout == "") {
//       used = false;
//     }
//     else {
//       local_port++;
//     }


//   }
// }


function get_ik_from_container_name(cname) {
  if (cname.includes( 'ik')) {
    console.log('contains ik');
    var ik = cname.match(/-(\d+)ik/);
    if (ik[1]) {
      return ik[1];
    } else {
      return 0;
    }
  }
  return 0;
}


// function createMetaData(modelname, fname, containername, containertag, checkpointno, svrtype, mtype, type, autoabc, callurl, PASS1IMAGESIZE, getmetaurl, created) {
//   return {
//     modelname,
//     fname,
//     containername,
//     containertag,
//     checkpointno,
//     svrtype,
//     mtype,
//     type,
//     autoabc,
//     callurl,
//     PASS1IMAGESIZE,
//     getmetaurl,
//     created
//   };
// }


// function saveMetadata(local_port, data) {
//   const { toASTMetaServer, aSTMetaServerToJson } = require('./AstMetaServer.js');
//   var filename = local_port + ".json";
//   const astMetaServerObject = toASTMetaServer(JSON.stringify(data));
//   const json = aSTMetaServerToJson(astMetaServerObject);
//   var full_path = ast_meta_server_root + "/" + filename;
//   fs.writeFileSync(full_path, json);
// }

main();

#!/usr/bin/env node

//Run server hosted on HuggingFace

//load .env in $HOME
var tst = require('dotenv').config({ path: process.env.HOME + '/.env' });



//docker rm astpicasso --force
var valid_choices_are = "picasso,van-gogh,roerich,pollock,peploe,munch,monet,kirchner,gauguin,el-greco,cezanne,morisot,pikawill02b";
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


const { exec } = require('child_process');

function main() {

  //if cli called with "--picasso", run command above
  if (process.argv[2]) {

    model_name = process.argv[2].replace("--", "").replace("ast-", "").replace("ast", "");
    container_name = "ast-" + model_name;

    //if the argument is not in the list of valid choices, exit
    if (!valid_choices_are.includes(model_name)) {
      show_valid_choices();
      process.exit(1);
    }

    if (process.argv[3] == "--rm" || process.argv[3] == "--pull") {
      //remove the container
      repo_tag = get_huggingface_repo_tag(model_name);
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


      exit_if_is_container_running(container_name, local_port)



    }

  }
  else {
    show_valid_choices();
    process.exit(1);
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

      post_launch_output(stdout, local_port);
    });
  }

  launchServerWithRetry();

  return local_port;
}

function post_launch_output(stdout, local_port) {
  console.log(stdout + "\n---------------\n>docker container named: " + container_name + " launched on port :" + local_port);
  //console.log("docker stop " + container_name + " --force #to remove");
  console.log(">  to stop the container, run : gia-ast-server --" + container_name.replace("ast", "") + " --rm");
  console.log(">  the likely url for the API is http://localhost:" + local_port + "/stylize" + "\n>     gia-ast my_image.jpg " + local_port);
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
  `;
}

function create_docker_run(ast_model = "ast-picasso", local_port = 7860, ns = "jgwill") {

  //check if local port is available, if not, increment by 1 until one is available
  //docker ps  -f publish=$port|grep $port
  //t_port = get_available_port(local_port); //@STCIssue Bugged
  t_port = local_port;
  if (t_port != local_port) {
    console.log("port " + local_port + " is taken, using " + t_port + " instead");
  }

  repo_tag = get_huggingface_repo_tag(ast_model, ns);

  result = "docker run -d --rm --name " + ast_model + " -p " + t_port + ":7860 --platform=linux/amd64 " + repo_tag;
  //console.log(result);
  return result;
}

function get_huggingface_repo_tag(ast_model, ns = "guillaumeai") {
  res = "registry.hf.space/" + ns + "-ast-" + ast_model + ":latest ";

  return res.replace("ast-ast-", "ast-");
}

function exit_if_is_container_running(container_name, local_port, callback_not_running, verbose = true) {

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


function get_available_port(local_port) {
  //check if local port is available, if not, increment by 1 until one is available
  //docker ps  -f publish=$port|grep $port
  used = true;
  while (used) {
    //var cmd = "bash -c \"tst=$(docker ps -q -f publish=" + local_port + ");if [ ! -n \"$tst\" ];then echo not used;else echo used;fi\"";// + "|grep " + local_port;
    // var cmd = "docker ps -q -f publish=" + local_port;// + "|grep " + local_port;
    var cmd = "docker ps|grep \":" + local_port + "\"";// + "|grep " + local_port;
    //console.log(cmd);

    var stdout = exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(stdout);
      return stdout;
    });

    if (stdout == "") {
      used = false;
    }
    else {
      local_port++;
    }


  }
}


main();

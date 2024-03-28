#!/usr/bin/env node

//Run server hosted on HuggingFace

//docker rm astpicasso --force
const valid_choices_are = "picasso,van-gogh,roerich,pollock,peploe,munch,monet,kirchner,gauguin,el-greco,cezanne,morisot";

function main() {

  const { exec } = require('child_process');
  //if cli called with "--picasso", run command above
  if (process.argv[2]) {

    model_name = process.argv[2].replace("--", "").replace("ast", "");
    container_name = "ast" + model_name;

    //if the argument is not in the list of valid choices, exit
    if (!valid_choices_are.includes(model_name)) {
      show_valid_choices();
      process.exit(1);
    }

    if (process.argv[3] == "--rm") {
      //remove the container
      exec("docker rm " + container_name + " --force", (err, stdout, stderr) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log("container " + container_name + " stopped and removed");
        //exit the process


      });
    }
    else {



      var local_port = 7860;
      if (process.argv[3]) {
        //local port to run the server on
        local_port = process.argv[3];
      }

      var cmd_launcher = create_docker_run(ast_model = container_name, local_port = local_port)


      exec(cmd_launcher, (err, stdout, stderr) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(stdout + "\n docker container named" + container_name + " running on port " + local_port);
        //console.log("docker stop " + container_name + " --force #to remove");
        console.log("  to stop the container, run : gia-ast-server --" + container_name.replace("ast","") + " --rm");
        console.log("  the likely url for the API is http://localhost:" + local_port + "/stylize");

      });
    }

  }
  else {
    show_valid_choices();
    process.exit(1);
  }
}

function show_valid_choices() {
  console.log("valid choices are :");
  for (let choice of valid_choices_are.split(",")) {
    console.log("gia-ast-server --" + choice);
  }
}

function create_docker_run(ast_model = "astpicasso", local_port = 7860) {
  result = "docker run -d --name " + ast_model + " -p " + local_port + ":7860 --platform=linux/amd64 registry.hf.space/jgwill-" + ast_model + ":latest ";
  console.log(result);
  return result;
}



main();


//Run server hosted on HuggingFace

//docker rm astpicasso --force

const { exec } = require('child_process');
//if cli called with "--picasso", run command above
if (process.argv[2]) {

  const valid_choices_are = "picasso,van-gogh,roerich,pollock,peploe,munch,monet,kirchner,gauguin,el-greco,cezanne,morisot"
  //if the argument is not in the list of valid choices, exit
  if (!valid_choices_are.includes(process.argv[2])) {
    console.log("valid choices are :" );
    for (let choice of valid_choices_are.split(",")) {
      console.log("gia-ast-server --"+choice);
    }
    return;
  }
  tmp_arg = process.argv[2].replace("--", "").replace("ast", "");
  container_name = "ast" + tmp_arg;

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
      console.log("docker stop " + container_name + " --force #to remove");
      console.log("  the likely url for the API is http://localhost:" + local_port + "/stylize");

    });
  }
}

function create_docker_run(ast_model = "astpicasso", local_port = 7860) {
  result = "docker run -d --name " + ast_model + " -p " + local_port + ":7860 --platform=linux/amd64 registry.hf.space/jgwill-" + ast_model + ":latest ";
  console.log(result);
  return result;
}

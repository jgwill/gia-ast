
//
const fs = require('fs');
var json = fs.readFileSync("package.json");
var data = JSON.parse(json);
var mainScript = "gia-ast.js";
try {
   fs.copyFileSync(mainScript,mainScript+".prepublish");
      
   var script =  String(fs.readFileSync(mainScript));

   fs.writeFileSync(mainScript,script.replace("VERSIONFLAG",data.version));

   console.log("Version file: " + data.version + " was created");

} catch (error) {
   console.log("Error backing up file and versionning the file");
}

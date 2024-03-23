//
const Buffer = require('safer-buffer').Buffer;
const path = require('path');
const fs = require('fs');


module.exports = {
	dec64_ObjPropToFile:
		/**
		 * decode a Obj or JSON base64 property to file 
		 * @param {*} json 
		 * @param {*} targetFile 
		 * @param {*} sourceProperty 
		 */
		function (json, targetFile, sourceProperty = "stylizedImage") {
			var data = json;
			try {
				data = JSON.parse(json);

			} catch (error) {
				data = json;
			}
			var base64str = data[sourceProperty];
			this.dec64_StringToFile(base64str, targetFile);
		},
	dec64_StringToFile:
		/**
		 * Decode a base64 to a file
		 * @param  {string} base64str
		 * @param  {string} filename
		 */
		function (base64str, filename) {

			fs.writeFileSync(filename,
				this.dec64_StringToBuffer(base64str)
			);

		},

	dec64_StringToBuffer:
		/**
		 * @param  {string} base64str
		 */
		function (base64str) {

			if (base64str.indexOf("png;base64") > -1)
				base64str = base64str
					.replace(/^data:image\/png;base64,/, "");

			if (base64str.indexOf("jpeg;base64") > -1) {
				base64str = base64str
					.replace(/^data:image\/jpeg;base64,/, "");
			}

			return Buffer.from(base64str, 'base64');
		},

	//---Import from gia-ast-img2stylize-requests...

	enc64ToJSONPropToFile:
		/**
		 * Encode an image file into base64 prop of a JSON file 
		 * @param {*} filename 
		 * @param {*} targetJsonFile 
		 * @param {*} targetProp 
		 */
		function (filename, targetJsonFile, targetProp = "contentImage") {

			var jsonData = this.encFileToJSONStringifyBase64Prop(filename, targetProp);

			fs.writeFileSync(targetJsonFile, jsonData);
			//console.log("Should have saved :" + targetJsonFile);

		},
	//Try to encode and return string data

	encFileToBase64String:
		/**
		 * Encode an image file into base64 string
		 * @param  {string} filename
		 */
		function (filename) {
			var base64Raw = fs.readFileSync(filename, 'base64');

			var base64 = base64Raw;
			var ext = path.extname(filename).replace(".", "");
			if (ext == "jpg" || ext == "JPG" || ext == "JPEG") ext = "jpeg";
			if (ext == "pneg" || ext == "PNG" || ext == "Png") ext = "png";


			if (base64Raw.indexOf("data:") == -1) //fixing the string
				base64 = `data:image/${ext};base64,`
					+ base64Raw;

			return base64;

		},
	//Try to encode and return string data

	encFileToJSONStringifyBase64Prop:
		/**
		 * Encode an image file into base64 JSON file under a target property 
		 * @param  {string} filename
		 * @param  {string} targetProp
		 */
		function (filename, targetProp) {
			var base64 = this.encFileToBase64String(filename);

			//console.log(base64);
			var jsonRequest = new Object();
			jsonRequest[targetProp] = base64;
			var jsonData = JSON.stringify(jsonRequest);

			return jsonData;

		},
	//Try to encode and return string data

	encFileToJSONStringifyBase64PropWithOptionalResolutions:
		/**
		 * Encode an image file into base64 JSON file under a target property 
		 * @param  {string} filename
		 * @param  {string} targetProp
		 */
		function (filename, targetProp, x1 = -1, x2 = -1, x3 = -1) {
			var base64 = this.encFileToBase64String(filename);

			//console.log(base64);
			var jsonRequest = new Object();
			jsonRequest[targetProp] = base64;

			jsonRequest.x1 = x1;
			jsonRequest.x2 = x2;
			jsonRequest.x3 = x3;

			var jsonData = JSON.stringify(jsonRequest);

			return jsonData;

		}

}

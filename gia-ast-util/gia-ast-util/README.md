# Cross Platform AST Util

CLI wrapper for AST Util


# Install

```sh
npm i gia-ast-util --g

```
# Run from directory where all your files are
```sh
gia-ast-cat-contentImage request.json

# generated a request.json
gia-ast-img2stylize-request sample.jpg request.json
gia-ast-img2stylize-request sample.jpg request.json myProp --quiet
gia-ast-img2stylize-request sample.jpg request.json myProp --verbose

#from a response, create a file
gia-ast-response-stylizedImage2file response.json mystylizedresult.jpg myProp --verbose

```

# Dependencies

* NODEJS (obviously)


----

# Further research

* One wrapper for all

>gia-ast-util img2request sample.jpg request.json
>gia-ast-util catcontentimage request.json
>gia-ast-util stylized2file result.json myresult.jpg

## for this see: yargs
```sh
npm i yargs --save
```


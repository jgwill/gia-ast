

# --@STCGoal migrating from : https://github.com/GuillaumeAI/x__etch-a-sketch__210224




# AStia Project


Basically, it connects to the Astia Server.


## Install

```sh
npm i gia-ast gia-ast-util --g
```

## Use sample
```sh
gia-ast sample.jpg 9098


```

## Run a Server

### From HuggingFace

```sh
docker run -it -p 7860:7860 --platform=linux/amd64 \
	registry.hf.space/jgwill-astpicasso:latest 

gia-ast sample.jpg 7860

```

## dot Env conf example

```dotenv
asthostname=localhost
astoutsuffix=__stylized__
astportbase=78
astcallprotocol=https
astcallmethod=/stylize

```

### more elaborated .env (with meta server)

```dotenv
#asthostname=osiris.astia.xyz
asthostname=localhost
astoutsuffix=__stylized__
astportbase=90
astcallprotocol=http
astcallmethod=/stylize
astmetaportnum=8999
astusemetasvr=true
astdebug=false
astsavemeta=true
astappendmodelid=true
dihostname=localhost
echocmd=false
devmode=false
astmetaoutputdir=.astmeta

```
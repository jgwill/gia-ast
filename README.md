#  Work in progress CLI for my AStia Project

(there will be more here some day)

Basically, it connects to the Astia Server.


## Install

```sh
npm i gia-ast gia-ast-util --g
```

## Use sample
```sh
gia-ast sample.jpg 98
gia-ast-meta sample.jpg 2000 -1 -a

```

## dot Env conf example

```dotenv
asthostname=orko.guillaumeisabelle.com
astoutsuffix=__stylized__
astportbase=91
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
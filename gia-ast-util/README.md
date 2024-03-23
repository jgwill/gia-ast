# gia-ne
GuillaumeAI Neural Enhancement


--Imported from nad.previz https://github.com/jgwill/nad.previz/blob/master/x/x__enhance_neural__2010270143/README.md#L3-L28


## Usage

for windows see : [docker-windows-run.md](docker-windows-run.md)

```sh
# When installed in .bashrc
enhance --zoom=4 result/my_image.jpg
enhance --zoom=1 result/my_image.jpg
```

## INSTALL

### A Bash alias running the container

```sh

alias enhance1='function ne() { docker run --rm -v "$(pwd)/`dirname ${@:$#}`":/ne/input -it alexjc/neural-enhance ${@:1:$#-1} "input/`basename ${@:$#}`"; }; ne'

alias enhance='function ne() { docker run --rm -v "$(pwd)/`dirname ${@:$#}`":/ne/input -it jgwill/neuz ${@:1:$#-1} "input/`basename ${@:$#}`"; }; ne'

```

--@STCGoal Migrated to a Bash Script I can run
see: https://github.com/jgwill/gia-ne


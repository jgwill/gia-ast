export container_tag=guillaumeai/ast:util

builddir=build
rm -rf $builddir
mkdir -p $builddir
# Copy what we will use in the image
cp ../util*.js $builddir
cp ../img2stylizationRequest.js $builddir

docker build -t $container_tag .
#docker push $container_tag

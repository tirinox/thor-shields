#!/bin/bash
TARGETPATH="../github-io-tirinox/"

# VERSION INCREMENT
python3 tools/inc_version.py
VERSION=`cat public/version.txt`
echo "Version is $VERSION."

# BUILD
yarn build
cp -R dist/* "$TARGETPATH"
cd "$TARGETPATH" || exit

# UPLOAD to GITHub.io
git add * || exit
git status || exit
git commit -m "Auto-Update ${VERSION}" || exit
git push origin master || exit
echo "DONE!"

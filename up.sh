#!/bin/bash
TARGETPATH="../github-io-tirinox/"
yarn build
cp -R dist/* "$TARGETPATH"
cd "$TARGETPATH" || exit
git status || exit
git add *
git commit -m "Auto-Update"
git push origin master
mkdir -p .bundle

cd .bundle
cp -a ../controllers/ controllers
cp -a ../definitions/ definitions
cp -a ../schemas/ schemas
cp -a ../public/ public
cp -a ../modules/ modules
cp -a ../plugins/ plugins
cp -a ../views/ views

# cd ..
total4 --bundle app.bundle
cp app.bundle ../app.bundle

cd ..
rm -rf .bundle
echo "DONE"
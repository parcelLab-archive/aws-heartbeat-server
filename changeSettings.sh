

echo Change Settings
echo Changing secret to:$1 
echo Changing baseUrl to:$2 
echo Changing SlackUrl to:$3 
sed -i _backup 's/test/'$1'/g; s/https:\/\/www.example.com\/api\/baseUrl\/heartbeat/'$2'/g' dashboard/dashboard.js
sed -i _backup 's/test/'$1'/g; s/https:\/\/www.example.com\/api\/baseUrl\/heartbeat/'$2'/g' edit/post/editPost.js
sed -i _backup 's/test/'$1'/g; s/https:\/\/www.example.com\/api\/baseUrl\/heartbeat/'$2'/g' edit/get/editGet.js
sed -i _backup 's/test/'$1'/g; s/https:\/\/www.example.com\/api\/baseUrl\/heartbeat/'$2'/g; s/https:\/\/hooks.slack.com\/services\/exampleHook'$3'/g' monitor/monitor.js

echo DONE

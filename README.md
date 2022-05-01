# TextTranslator

## Prerequisites

- Node.js
- Microsoft Azure subscription

```sh
https://azure.microsoft.com/en-us/free/cognitive-services
```

- You can use the free pricing tier (F0) to try the service, and upgrade later to a paid tier for production.
- Create a translation resource

```sh
https://portal.azure.com/#create/Microsoft.CognitiveServicesTextTranslation
```

## Set subscription key

Replace the below tag in the config with your text translation key which you created in the translation resource.

```sh
<your-text-translation-key-here>
```

## Install dependencies

```sh
npm init -y
npm i express
npm install --save express-validator
npm i swagger-jsdoc
npm i swagger-ui-express
npm i cors
npm i axios
npm i uuid
```

## Run the application

```sh
npm start
```

You can also run `node .` to skip the build step.

Open http://localhost:3000 in your browser.

## Digital Ocean dependencies

```sh
yum install firewalld -y
systemctl start firewalld
systemctl enable firewalld
firewall-cmd --permanent --zone=public --add-service=http
firewall-cmd --permanent --zone=public --add-service=https
firewall-cmd --zone=public --add-port=3000/tcp --permanent
firewall-cmd --zone=public --add-port=3001/tcp --permanent
firewall-cmd --zone=public --add-port=3002/tcp --permanent
firewall-cmd --zone=public --add-port=3003/tcp --permanent
firewall-cmd --reload
yum makecache
yum install git -y
curl -sL https://rpm.nodesource.com/setup_12.x | sudo bash -
yum install nodejs -y
git --version
node --version
npm install -g pm2
pm2 start index.js --watch
```

## Swagger Playground

```sh
http://137.184.210.75:3000/swaggerFinalProjDoc
```
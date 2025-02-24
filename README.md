# Connected Fields Extension App Reference Implementation
## Introduction
This reference implementation models the implementation of data input and output functionalities in an [extension app](https://developers.docusign.com/extension-apps/).

To test this reference implementation, modify the `manifest.json` file.

## Choose your setup: local or cloud deployment
If you want to run the app locally using Node.js and ngrok, follow the [Local setup instructions](#local-setup-instructions) below.

If you want to deploy the app to the cloud using Docker and Terraform, see [Deploying an extension app to the cloud with Terraform](terraform/README.md). This includes cloud-specific setup instructions for the following cloud providers:
- [Amazon Web Services](https://aws.amazon.com/)
- [Microsoft Azure](https://azure.microsoft.com/)
- [Google Cloud Platform](https://cloud.google.com/)

## Local setup instructions

### Video Walkthrough
[![Reference implementation videos](https://img.youtube.com/vi/_4p7GWK5aoA/0.jpg)](https://youtube.com/playlist?list=PLXpRTgmbu4orBQrYWPAXa4EBXv0IGGzID&feature=shared)

### 1. Clone the repository
Run the following command to clone the repository: 
```bash
git clone https://github.com/docusign/extension-app-connected-fields-reference-implementation.git
```

### 2. Generate secret values
- If you already have values for `JWT_SECRET_KEY`, `OAUTH_CLIENT_ID`, `OAUTH_CLIENT_SECRET`, and `AUTHORIZATION_CODE`, you may skip this step.

The easiest way to generate a secret value is to run the following command:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'));"
```

You will need values for `JWT_SECRET_KEY`, `OAUTH_CLIENT_ID`, `OAUTH_CLIENT_SECRET`, and `AUTHORIZATION_CODE`.

### 3. Set the environment variables for the cloned repository
- If you're running this in a development environment, create a copy of `example.development.env` and save it as `development.env`.
- If you're running this in a production environment, create a copy of `example.production.env` and save it as `production.env`.
- Replace `JWT_SECRET_KEY`, `OAUTH_CLIENT_ID`, `OAUTH_CLIENT_SECRET`, and `AUTHORIZATION_CODE` in `development.env` or `production.env` with your generated values. These values will be used to configure the sample proxy's mock authentication server. 
- Set the `clientId` value in the manifest file to the same value as `OAUTH_CLIENT_ID`.
- Set the `clientSecret` value in the manifest file to the same value as `OAUTH_CLIENT_SECRET`.
### 4. [Install and configure Node.js and npm on your machine.](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
### 5. Install dependencies
Run the following command to install the necessary dependencies:
```bash
npm install
```
### 6. Running the proxy server
#### Development mode:
Start the proxy server in development mode by running the command:
```bash
npm run dev
```

This will create a local server on the port in the `development.env` file (port 3000 by default) that listens for local changes that trigger a rebuild.

#### Production mode:
Start the proxy server in production mode by running the following commands:
```bash
npm run build
npm run start
```

This will start a production build on the port in the `production.env` file (port 3000 by default). 
## Setting up ngrok
### 1. [Install and configure ngrok for your machine.](https://ngrok.com/docs/getting-started/)
### 2. Start ngrok
Run the following command to create a public accessible tunnel to your localhost:

```bash
ngrok http <PORT>
```

Replace `<PORT>` with the port number in the `development.env` or `production.env` file.

### 3. Save the forwarding address
Copy the `Forwarding` address from the response. You’ll need this address in your manifest file.

```bash
ngrok                                                    

Send your ngrok traffic logs to Datadog: https://ngrok.com/blog-post/datadog-log

Session Status                online
Account                       email@domain.com (Plan: Free)
Update                        update available (version 3.3.1, Ctrl-U to update)
Version                       3.3.0
Region                        United States (us)
Latency                       60ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://bbd7-12-202-171-35.ngrok-free.app -> http:

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

In this example, the `Forwarding` address to copy is `https://bbd7-12-202-171-35.ngrok-free.app`.
## Create an extension app
### 1. Prepare your app manifest
Replace `<PROXY_BASE_URL>` in your manifest file with the ngrok forwarding address in the following sections:
- `connections.params.customConfig.profile.url`
- `connections.params.customConfig.tokenUrl`
- `connections.params.customConfig.authorizationUrl`
- `actions.params.uri`
    * Replace this value for all of the actions.

### 2. Navigate to the [Developer Console](https://devconsole.docusign.com/apps)
Log in with your Docusign developer credentials and create a new app.

### 3. Upload your manifest and create the connected fields app
To [create your extension app](https://developers.docusign.com/extension-apps/build-an-extension-app/create/), open the [Developer Console](https://devconsole.docusign.com/apps) and select **+New App.** In the app manifest editor that opens, upload your manifest file or paste into the editor itself; then select Validate. Once the editor validates your manifest, select **Create App.** 

### 4. Test the extension app
This reference implementation uses mock data to simulate how data can be verified against a database. [Test your extension](https://developers.docusign.com/extension-apps/build-an-extension-app/test/) using the sample data in [fileDB.ts](https://github.com/docusign/extension-app-data-io-reference-implementation/blob/main/src/db/fileDB.ts). Extension app tests include [integration tests](https://developers.docusign.com/extension-apps/build-an-extension-app/test/integration-tests/) (connection tests and extension tests), [functional tests](https://developers.docusign.com/extension-apps/build-an-extension-app/test/functional-tests/), and [App Center preview](https://developers.docusign.com/extension-apps/build-an-extension-app/test/app-center-preview/). 


### Extension tests
The Developer Console offers five extension tests to verify that a connected fields extension app can connect to and exchange data with third-party APIs (or an API proxy that in turn connects with those APIs). 

**Note:** These instructions only apply if you use the [mock data](https://github.com/docusign/extension-app-data-io-reference-implementation/blob/main/src/db/fileDB.ts) in the reference implementation. If you use your own database, you’ll need to construct your requests based on your own schema. Queries for extension tests in the Developer Console are built using [IQuery](https://developers.docusign.com/extension-apps/extension-app-reference/extension-contracts/custom-query-language/) structure. 




#### Verify extension test
The `typeName` property in the sample input maps to the name of a concept in the `model.cto` file. Any valid record ID can be used in this field.

The `idempotencyKey` property in the sample input can be left as is.

The `data` property in the sample input are the key-value pairs of the properties of the `typeName` that is being verified, where the key is the name of the property within the concept, and the value is the input to verify. For example, if the Concept is defined like so:

```
@VerifiableType
@Term('Email Address')
concept VerifyEmailInput {
    @IsRequiredForVerifyingType
    @Term('Email Address')
    o String email length=[,256]
}
```

Then the `data` property in the request body would be:
```
{ "email": "test@gmail.com" }
```


Running the test should return the following properties in the response `{ "success": true, "verificationResultCode": "SUCCESS" }`.

Example:



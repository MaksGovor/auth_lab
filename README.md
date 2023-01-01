# Auth examples lab

## Labs
- [Lab1](https://github.com/MaksGovor/auth_lab/tree/main/jwt_auth)
- [Lab2+3](https://github.com/MaksGovor/auth_lab/tree/main/auth0_requests)
- [Lab4+5](https://github.com/MaksGovor/auth_lab/tree/main/auth0_auth)
- [Lab6](https://github.com/MaksGovor/auth_lab/tree/feature/lab6-implementation/auth0_auth)

## How to run

- You need [node.js](https://nodejs.org/en/) 18.12.0 or higher
- Package manager [yarn](https://classic.yarnpkg.com/lang/en/docs/install/#windows-stable)
  You can install it by running the following command, or by another convenient method:
  ```bash
  $ npm i --global yarn
  ```

- To start each application you need to do the following:
  - Install dependencies:
  ```bash
  $ yarn
  ```
  - Change working directory (for lab6 change branch before this step `git checkout feature/lab6-implementation`):
   ```bash
  $ cd {LAB_DIRECTORY}
  ```
  - Add an .env file that is identical to .env.example and contains your environment variables (auth0 credentials):
  ```bash
  $ cat .env.example > .env # and then edit
  ```
  - Run server for labs 1,4-6:
  ```bash
  $ node index.js
  ```
  - Open in browser:
  ```
  http://localhost:3000
  ```
  - For lab 2,3, run the *-example.js script with the node.JS and look at the output. E.g.:
  ```bash
  $ node create-user-example.js
  ...
  $ node change-password-example.js
  ```

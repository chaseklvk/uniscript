# Blockathon2019

## UniScript BlockChain Solution:
Using Oracle Blockchain Platform to deploy a blockchain platform for universities and employers. 

## Team Members:
- Chase Zimmerman: web application and database management
- Charlie Pyle: API and product management
- Cameron Durham: university chaincode development
- John Tanner: student chaincode development

## Documentation:
# Deploying Chaincode
- Deploy chaincode to Oracle Blockchain Cloud by uploading `chaincode/node.zip`
- Select node and instantiate chaincode on a new channel
- Full create, read, and update functionality

# Running Demo Web Application
- Clone the repository
- Pull dependencies using npm:
```
npm install
```
- Run the web server using node:
```
node index.js
```
- Note: You'll need to set the following environment variables to connect to MongoDB and 
the Oracle REST API:
    * DB_URI
    * ORACLE_API_URL

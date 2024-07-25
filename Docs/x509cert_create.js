
// This code generates a self-signed X.509 certificate and writes it to a file. 
//The certificate is created using the Node.js module node-forge, which provides a way to work with cryptographic functions in JavaScript. The code generates a key pair, creates a new X.509 certificate, sets the subject and issuer attributes, self-signs the certificate, and then writes the certificate and public key to files. The certificate is written in PEM format, which is a common format for certificates and keys.
import forge from 'node-forge';
import fs from 'fs';
//const forge = require('node-forge');

// generate a keypair
const keys = forge.pki.rsa.generateKeyPair(2048);

// create a new X.509 certificate
const cert = forge.pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

const attrs = [{
  name: 'commonName',
  value: 'inproted.org'
}, {
  name: 'countryName',
  value: 'Romania'
}, {
  shortName: 'ST',
  value: 'Prahova'
}, {
  name: 'localityName',
  value: 'Sinaia'
}, {
  name: 'organizationName',
  value: 'Test'
}, {
  shortName: 'OU',
  value: 'Test'
}];
cert.setSubject(attrs);
cert.setIssuer(attrs);

// self-sign certificate
cert.sign(keys.privateKey);

// convert a Forge certificate to PEM
const pem = forge.pki.certificateToPem(cert);

// write the certificate and public key to files
fs.writeFileSync('certificateJuly25.pem', pem);
fs.writeFileSync('publicKeyJuly25.pem', forge.pki.publicKeyToPem(keys.publicKey));

console.log('Code Sinaia 2024 Success: Certificate and public key have been written to files.');
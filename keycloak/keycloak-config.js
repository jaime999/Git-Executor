var session = require('express-session')
var Keycloak = require('keycloak-connect')
let _keycloak
var keycloakConfig = {
    clientId: 'server',
    bearerOnly: false,
    serverUrl: process.env.KEYCLOAK_SERVER,
    realm: 'my_realm',
    //realmPublicKey: 'MIICnzCCAYcCBgGF9JIuvzANBgkqhkiG9w0BAQsFADATMREwDwYDVQQDDAhteV9yZWFsbTAeFw0yMzAxMjcxODQ5NTlaFw0zMzAxMjcxODUxMzlaMBMxETAPBgNVBAMMCG15X3JlYWxtMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAkfQGrzqMHwNiJB9n1wQ+ApzYBzTF890xMmGsaisIfjUisgUbDqigdZ5J8RPSuscYWvjSL5YRho843a6u8PAkx36s51qaLF+ePNYKm2HS6HW2ScEDaabKAz/6Osex7RnbWvOWHyLy7H2FkEwiSqEDD7fFOl5ebGmAxL5uBxPINfzyxFwO0bh34AY9Ad1kDVBrfyyyRGtoKkTN+rvmDQvbv/x11ruRQg68qG34E9TG/04TkzgMfGc9zzAirq+SdGutTDABLf025+X9LIDWV+zt3Ew5+civ3pZ0zJfO/4HTPbiZhw52NQiQDksE/IwEM2CnfMNr6cHB/o32KJAe6JUZCQIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQA3jMsLC6WaIHfbGeOJ3tzsjvDw6YKLQ0jHlcapl9HxHtZQui2sb5s4tahLO0r3v8Z9XjxpWXeJZ61cRMuFDOgCwiphSRfX22La1nz+vMaghy5scV+cKA4bzH4ek6ovPwo9Y3EirzAJi1a9i/+ZQzp080x1RpS0gjTU+nW1vxlnGJTBDhiyixGGMnWwd2fnkAG1rflibrKkNCb3Tl+UzBBtWL6Ke7LlAOSVjSl2pW1bGESMP/rO02LVnk6RL7+WCg4s60F+Q9m1R3PYDOb/vahciOKff3c8pYKMr9PTtZ6bPh8wvgOB51CSCrFE8ps+2M+UUagGGlJeFBYHv2AYYBxJ'
    credentials: {
        secret: 'TREsL7e4ZzMfr2BB0ofDuztv691fBSP5'
    }
}

function initKeycloak() {
    if (_keycloak) {
        console.warn("Trying to init Keycloak again!");
        return _keycloak;
    } 
    else {
        console.log("Initializing Keycloak...");
        var memoryStore = new session.MemoryStore();
        _keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);
        return _keycloak;
    }
}
function getKeycloak() {
    if (!_keycloak){
        console.error('Keycloak has not been initialized. Please called init first.');
    } 
    return _keycloak;
}
module.exports = {
    initKeycloak,
    getKeycloak
}

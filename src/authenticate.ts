export const authenticate = (challenge: string) => {
  var credentialId = new Uint8Array([
    183, 148,
    245 /* more random bytes previously generated by the authenticator */,
  ]);
  var options = {
    challenge: new TextEncoder().encode(challenge),
    timeout: 300000, // 5 minutes
    // allowCredentialsってどういう意味や？
    // allowCredentials: [
    //   { type: "public-key" as PublicKeyCredentialType, id: credentialId },
    // ],
  };

  return navigator.credentials
    .get({ publicKey: options })
    .then((assertion) => {
      console.log(assertion);

      // clientDataJSONはこうなる
      // new TextDecoder().decode(assertion.response.clientDataJSON)
      // '{"type":"webauthn.get","challenge":"BGUP","origin":"http://localhost:5173","crossOrigin":false}'
      debugger;
      // Send assertion to server for verification
    })
    .catch((err) => {
      console.log(err);
      // No acceptable credential or user refused consent. Handle appropriately.
    });
};

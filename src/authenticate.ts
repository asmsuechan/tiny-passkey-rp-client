export const authenticate = (challenge: string) => {
  const options = {
    challenge: new TextEncoder().encode(challenge),
    // allowCredentialは、既にユーザーがRP側で特定されている場合にそのユーザーのcredentialIdを指定する
    // 指定しなければChromeはCredential一覧を出してユーザーに選ばせる
    // * Client-side discoverable Credential
    // * Server-side Credential
    // どちらもAuthentication ceremonyで使う。allowCredentialに食わせるCredentialのこと。シンプルにAuthenticationセレモニーで使う鍵の保存場所と対応している。
    // > the Relying Party invokes navigator.credentials.get() with an empty allowCredentials argument. This means that the Relying Party does not necessarily need to first identify the user.
    // ユーザーがAuthentication Ceremony以前に特定できている場合は、allowCredentialsにユーザーと対応するCredentialIdを指定する
    allowCredentials: [
      // {
      //   type: "public-key" as PublicKeyCredentialType,
      //   id: credentialId,
      //   transports: ["internal"] as AuthenticatorTransport[],
      // },
    ],
  };

  return navigator.credentials
    .get({ publicKey: options })
    .then((assertion) => {
      console.log(assertion);
      // TypeScriptが推測する型はCredentialだが実際はPublicKeyCredential
      return assertion as PublicKeyCredential;
    })
    .catch((err) => {
      console.log(err);
      return err;
    });
};

export const login = async (
  userName: string,
  pubKeyCred: PublicKeyCredential
) => {
  // NOTE: TypeScriptとしてはAuthenticatorResponseと判断されるが、実際はAuthenticatorAssertionResponse
  const response = pubKeyCred.response as AuthenticatorAssertionResponse;
  const hexSignature = [...new Uint8Array(response.signature)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
  console.log(response);
  const hexAuthData = [...new Uint8Array(response.authenticatorData)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
  const hexClientDataJson = [...new Uint8Array(response.clientDataJSON)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");

  const params = {
    id: pubKeyCred.id,
    type: pubKeyCred.type,
    rawId: pubKeyCred.rawId,
    userName,
    hexSignature,
    hexClientDataJson,
    hexAuthData,
  };
  return fetch("http://localhost:4000/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
    credentials: "include",
  }).then((res) => res.json());
};

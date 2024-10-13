import { User } from "./user";

// 新しい認証情報の作成/登録
export const register = async (user: User, challenge: Challenge) => {
  // RelyingPartyの名前
  // https://w3c.github.io/webauthn/#dom-publickeycredentialcreationoptions-rp
  const rp = {
    name: "mypasskey-rp",
  };

  // IDは今後もuint8arrayで取り扱う
  // const randomUint8Array = new Uint8Array([
  //   0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0, 0x11, 0x22, 0x33, 0x44,
  //   0x55, 0x66, 0x77, 0x88, 0x99, 0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff, 0x00,
  //   0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef,
  // ]);
  // これは入力させる
  // 認証器で作る(?)公開鍵の情報。これもサーバーから取得する？
  // > This Relying Party will accept either an ES256 or RS256 credential, but
  // > prefers an ES256 credential.
  const pubKeyCredParams = [
    {
      type: "public-key",
      alg: -7,
    } as PublicKeyCredentialParameters,
    {
      type: "public-key",
      alg: -257,
    } as PublicKeyCredentialParameters,
  ];
  // NOTE: directのみ実装。
  // const attestation = "direct" as AttestationConveyancePreference;
  // サーバーから取得したChallenge。ランダムな値である必要がある
  // const challenge = new Uint8Array([
  //   0x8c, 0x0a, 0x26, 0xff, 0x22, 0x91, 0xc1, 0xe9, 0xb9, 0x4e, 0x2e, 0x17,
  //   0x1a, 0x98, 0x6a, 0x73, 0x71, 0x9d, 0x43, 0x48, 0xd5, 0xa7, 0x6a, 0x15,
  //   0x7e, 0x38, 0x94, 0x52, 0x77, 0x97, 0x0f, 0xef,
  // ]).buffer;

  const createCredentialDefaultArgs = {
    publicKey: {
      rp,
      user: {
        id: new TextEncoder().encode(user.userHandle),
        name: user.name,
        displayName: user.displayName,
      },
      pubKeyCredParams,
      // attestation,
      challenge: new TextEncoder().encode(challenge.challenge),
      // timeout: 60000,
      // authenticatorSelection: {
      //   authenticatorAttachment: "platform",
      //   requireResidentKey: true,
      // },
      // ERROR DOMException: The 'appid' extension is only valid when requesting an assertion for a pre-existing credential that was registered using the legacy FIDO U2F API.
      // appidを使えるのは、過去にlegacy FIDO U2F JavaScript APIで登録されている場合のみ
      // extensions: {
      //   // appid: "hoge",
      //   hmacCreateSecret: true,
      // },
    },
  };
  return navigator.credentials
    .create(createCredentialDefaultArgs)
    .then((cred) => {
      // NOTE: create()関数の返り値はPublicKeyCredentialだが、lib.dom.d.tsではCredentialとして定義されている
      const credential = cred as PublicKeyCredential;
      return credential;
    })
    .catch((err) => {
      console.log("ERROR", err);
      return err;
    });
};

export const postCredential = async (
  credential: PublicKeyCredential,
  userId: string
) => {
  const response = credential.response as AuthenticatorAttestationResponse;
  const hexAttestationObject = [...new Uint8Array(response.attestationObject)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
  const hexClientDataJson = [...new Uint8Array(response.clientDataJSON)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
  const registerParams = {
    id: credential.id,
    credentialId: [...new Uint8Array(credential.rawId)]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join(""),
    userId,
    transports: response.getTransports(),
    hexAttestationObject,
    hexClientDataJson,
    type: credential.type,
  };
  return fetch("http://localhost:4000/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(registerParams),
    credentials: "include",
  }).then((res) => res.json());
};

type Challenge = {
  challenge: string;
};

export const getChallenge = async (): Promise<Challenge> => {
  return fetch("http://localhost:4000/auth/challenge", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  }).then((res) => res.json());
};

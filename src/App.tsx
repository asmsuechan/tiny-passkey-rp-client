import "./App.css";
import { authenticate } from "./authenticate";
import { getChallenge, postCredential, register } from "./register";
import { useState } from "react";
import { createUser } from "./user";

function App() {
  const [name, setName] = useState("");
  return (
    <div className="card border">
      <div>
        <h2>Passkey RP Client</h2>
      </div>
      <div className="mb-1rem">
        <input
          className="w-full py-0-5rem"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="mb-1rem">
        <button
          className="w-full"
          onClick={async () => {
            const user = await createUser(name);
            console.log(user);
            const challenge = await getChallenge();
            const cred = await register(user, challenge);
            await postCredential(cred, user.id);
          }}
        >
          Register
        </button>
      </div>
      <div className="mb-1rem">
        <button
          className="w-full"
          onClick={async () => {
            const challenge = await getChallenge();
            authenticate(challenge.challenge);
            console.log("auth");
          }}
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default App;

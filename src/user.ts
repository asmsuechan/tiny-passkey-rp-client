export type User = {
  id: string;
  name: string;
  displayName: string;
  userHandle: string;
};

export const createUser = (name: string): Promise<User> => {
  const userParams = {
    name,
  };
  return fetch("http://localhost:4000/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userParams),
  }).then((res) => res.json());
};

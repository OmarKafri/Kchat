export type UserInfromation = {
  id: number;
  email: string;
  username: string;
  image: string | null;
};

export type UserWithoutId = Omit<UserInfromation, "id">;

export type RegisterationEntred = {
  email: string;
  username: string;
  password: string;
};

export type LoginInfoEntred = {
  email: string;
  password: string;
};

export type messages = {
  content: string;
  createdAt: string;
  senderId: string;
  convoId: string;
};

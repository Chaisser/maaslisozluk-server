import generateToken from "./../../utils/generateToken";
import hashPassword from "./../../utils/hashPassword";
import bcrypt from "bcryptjs";
import generateCode from "./../../utils/generateCode";
import getUserId from "./../../utils/getUserId";
import { sendWelcomeEmail } from "./../../email/email";

const userMutation = {
  async loginUser(parent, args, { prisma }, info) {
    const { email, password } = args.data;

    const user = await prisma.query.user(
      {
        where: {
          email,
        },
      },
      null
    );

    if (!user) {
      throw new Error("LOGIN_ERROR");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error("LOGIN_ERROR");
    }

    const token = generateToken(user.id, user.userType);

    return {
      user,
      token,
    };
  },
  async createUser(parent, args, { prisma, request }, info) {
    args.data.password = await hashPassword(args.data.password);

    const emailActivationCode = generateCode(100000, 999999);
    const twoFactorCode = generateCode(100000, 999999);
    const phoneNumberActivationCode = generateCode(100000, 999999);

    const userType = "USER";
    const theme = "LIGHT";

    const user = await prisma.mutation.createUser(
      {
        data: {
          ...args.data,
          userType,
          phoneNumberActivation: false,
          phoneNumberActivationCode,
          emailActivationCode,
          emailActivation: false,
          twoFactorCode,
          twoFactorActivation: false,
          theme,
          budget: 0,
          agreement: "",
          agreementVersion: 0,
        },
      },
      null
    );
    const sendWelcome = sendWelcomeEmail(args.data.email, emailActivationCode);

    return {
      user,
      token: generateToken(user.id, user.userType),
    };
  },
  async updateUser(parent, args, { prisma, request }, info) {
    const userId = args.id;

    if (typeof args.data.password === "string") {
      args.data.password = await hashPassword(args.data.password);
    }

    if (args.data.password === null) {
      delete args.data.password;
    }

    return prisma.mutation.updateUser(
      {
        where: {
          id: userId,
        },
        data: {
          ...args.data,
        },
      },
      info
    );
  },
  async deleteUser(parent, args, { prisma, request }, info) {
    return prisma.mutation.deleteUser(
      {
        where: {
          id: args.id,
        },
      },
      info
    );
  },
};

export default userMutation;

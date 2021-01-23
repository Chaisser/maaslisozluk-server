import generateToken from "./../../utils/generateToken";
import hashPassword from "./../../utils/hashPassword";
import bcrypt from "bcryptjs";
import generateCode from "./../../utils/generateCode";
import getUserId from "./../../utils/getUserId";
import { sendWelcomeEmail, sendActivationEmail, sendResetPasswordEmail } from "./../../email/email";
import {} from "./../../email/email";
import axios from "axios";

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
  async changePassword(parent, args, { prisma, request }, info) {
    const user = getUserId(request);
    const userId = user.userId;
    const userInformation = await prisma.query.user(
      {
        where: {
          id: userId,
        },
      },
      `{
      id 
      password
    }`
    );
    const isMatch = await bcrypt.compare(args.data.currentPassword, userInformation.password);

    if (!isMatch) {
      throw new Error("hatalı şifre");
    }

    args.data.password = await hashPassword(args.data.password);

    return prisma.mutation.updateUser(
      {
        where: {
          id: userId,
        },
        data: {
          password: args.data.password,
        },
      },
      `{
      id
    }`
    );
  },
  async createUser(parent, args, { prisma, request }, info) {
    args.data.password = await hashPassword(args.data.password);

    if (args.data.username.length < 4 || args.data.username.length > 24) {
      throw new Error("Kullanıcı adı en az 4 en fazla 24 karakter olabilir");
    }

    if (args.data.phoneNumber) {
      args.data.phoneNumber = args.data.phoneNumber.replace(/[^\d]/g, "");
    }

    const forbiddenUsernames = [
      "admin",
      "administrator",
      "interaktifis",
      "maaslisozluk",
      "mod",
      "moderator",
      "owner",
      "root",
      "superadmin",
      "supermoderator",
      "superuser",
    ];

    const isUsernameValid = forbiddenUsernames.find((u) => u === args.data.username);

    if (isUsernameValid) {
      throw new Error("Bu kullanıcı adı alınamaz");
    }

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
    const user = getUserId(request);
    const userId = user.userId;

    const userInformation = await prisma.query.user(
      {
        where: {
          id: userId,
        },
      },
      `{
      id
      emailActivation
      phoneNumberActivation
    }`
    );

    if (args.data.phoneNumber) {
      args.data.phoneNumber = args.data.phoneNumber.replace(/[^\d]/g, "");
    }
    if (userInformation.emailActivation) {
      delete args.data.email;
    }

    if (userInformation.phoneNumberActivation) {
      delete args.data.phoneNumber;
    }

    if (args.data.phoneNumber || args.data.email) {
      const isExist = await prisma.exists.User({
        AND: [
          {
            id_not: userId,
          },
          {
            phoneNumber_not: null,
          },
        ],
        OR: [
          {
            email: args.data.email,
          },
          {
            phoneNumber: args.data.phoneNumber,
          },
        ],
      });

      if (isExist) {
        throw new Error("e-posta veya telefon numarası mevcut");
      }
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
    const user = getUserId(request);
    const userId = user.userId;

    const checkUser = await prisma.query.users({
      where: {
        AND: [
          {
            id: userId,
          },
          {
            userType: "ADMIN",
          },
        ],
      },
    });

    if (checkUser.length !== 1) {
      throw new Error("auth error!");
    }

    return prisma.mutation.deleteUser(
      {
        where: {
          id: args.id,
        },
      },
      info
    );
  },
  async sendForgetPasswordCode(parent, args, { request, prisma }, info) {
    const user = await prisma.query.user({
      where: {
        email: args.email,
      },
    });
    if (!user) {
      return {
        result: "success",
      };
    }

    const emailActivationCode = generateCode(100000, 999999);

    const updateUser = await prisma.mutation.updateUser({
      where: {
        email: args.email,
      },
      data: {
        emailActivationCode,
      },
    });

    const sendResetPassword = sendResetPasswordEmail(args.email, emailActivationCode, user.id);

    return {
      result: "success",
    };
  },
  async checkPasswordActivationCode(parent, args, { request, prisma }, info) {
    const { emailActivationCode, email, id } = args;
    const result = await prisma.query.user({ where: { id } });
    if (!result) {
      throw new Error("Hatalı Kod");
    }

    if (emailActivationCode !== result.emailActivationCode || email !== result.email) {
      throw new Error("Hatalı Kod");
    }
    return {
      result: "success",
    };
  },
  async resetPassword(parent, args, { request, prisma }, info) {
    const { emailActivationCode, email, id, password } = args;

    const result = await prisma.query.user({ where: { id } });
    if (!result) {
      throw new Error("Hatalı Kod");
    }

    if (emailActivationCode !== result.emailActivationCode || email !== result.email) {
      throw new Error("Hatalı Kod");
    }

    const createemailActivationCode = generateCode(100000, 999999);
    const userPassword = await hashPassword(password);
    const updateUser = await prisma.mutation.updateUser({
      where: {
        id,
      },
      data: {
        password: userPassword,
        emailActivation: true,
        emailActivationCode: createemailActivationCode,
      },
    });
    return {
      result: "success",
    };
  },
  async sendPhoneActivationCode(parent, args, { request, prisma }, info) {
    const user = getUserId(request);
    const userData = await prisma.query.user({
      where: {
        id: user.userId,
      },
    });

    if (!userData.phoneNumber) {
      throw new Error("Telefon numarası bulunamadı");
    }

    const username = process.env.NETGSM_USERNAME;
    const password = process.env.NETGSM_PASSWORD;
    const phoneNumber = userData.phoneNumber;
    const message = encodeURI(
      `${userData.phoneNumberActivationCode} kodu ile maasli sozluk hesabınızı doğrulayabilirsiniz.`
    );
    const url = `https://api.netgsm.com.tr/sms/send/get/?usercode=${username}&password=${password}&gsmno=${phoneNumber}&message=${message}&msgheader=INTERAKTFIS`;
    const sendMessage = await axios.get(url);

    if (sendMessage.data.split(" ")[0] === "00") {
      return {
        result: "success",
      };
    }
    throw new Error("SMS gönderilemedi");
  },
  async checkPhoneActivationCode(parent, args, { request, prisma }, info) {
    const user = getUserId(request);
    const userId = user.userId;
    const phoneNumberActivationCode = args.phoneActivationCode;
    const createPhoneActivationCode = generateCode(100000, 999999);

    const result = await prisma.query.users(
      {
        where: { id: userId, phoneNumberActivationCode, phoneNumberActivation: false },
      },
      `{
      id
    }`
    );
    if (result.length === 1) {
      const updateUser = await prisma.mutation.updateUser(
        {
          where: {
            id: userId,
          },
          data: {
            phoneNumberActivationCode: createPhoneActivationCode,
            phoneNumberActivation: true,
          },
        },
        `{
        id
      }`
      );
      if (updateUser.id) {
        return {
          result: "success",
        };
      }
    }
    throw new Error("Hatalı Kod");
  },
  async sendEmailActivationCode(parent, args, { request, prisma }, info) {
    const user = getUserId(request);
    const userId = user.userId;
    const result = await prisma.query.user({ where: { id: userId } });
    try {
      sendActivationEmail(result.email, result.emailActivationCode, result.id);
      return {
        result: "OK",
      };
    } catch (err) {
      return {
        result: err.message,
      };
    }
  },
  async checkEmailActivationCode(parent, args, { request, prisma }, info) {
    const { emailActivationCode, email, id } = args;
    const result = await prisma.query.user({ where: { id } });
    if (!result) {
      throw new Error("Hatalı Kod");
    }

    if (
      emailActivationCode !== result.emailActivationCode ||
      email !== result.email ||
      result.emailActivation === true
    ) {
      throw new Error("Hatalı Kod");
    }

    const createemailActivationCode = generateCode(100000, 999999);

    const updateUser = await prisma.mutation.updateUser({
      where: {
        id,
      },
      data: {
        emailActivation: true,
        emailActivationCode: createemailActivationCode,
      },
    });
    if (updateUser) {
      return {
        result: "OK",
      };
    }
  },
};

export default userMutation;

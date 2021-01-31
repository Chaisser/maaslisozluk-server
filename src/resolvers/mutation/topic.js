import getUser from "./../../utils/getUserId";
import getSlug from "speakingurl";
import moment from "moment";
import { Webhook, MessageBuilder } from "discord-webhook-node";
const hook = new Webhook(process.env.DISCORD_WEBHOOK);

const topicMutation = {
  async createTopic(parent, args, { request, prisma }, info) {
    const categoryId = args.category;
    const { title, description } = args.data;
    const user = getUser(request);
    const userId = user.userId;
    const slug = getSlug(title, { lang: "tr" });
    if (title.trim().length > 60) {
      throw new Error("başlık 60 karakteri geçemez");
    }
    const data = {
      title: title.trim(),
      slug,
      paidTimes: 0,
      status: true,
      category: {
        connect: {
          id: categoryId,
        },
      },
      user: {
        connect: {
          id: userId,
        },
      },
      posts: {
        create: {
          description,
          favoritesPaidTimes: 0,
          likesPaidTimes: 0,
          dislikesPaidTimes: 0,
          user: { connect: { id: userId } },
          status: "ACTIVE",
        },
      },
    };

    const result = await prisma.mutation.createTopic(
      {
        data,
      },
      info
    );

    if (result) {
      const embed = new MessageBuilder()
        .setTitle(title.trim())
        .setURL(`https://www.maaslisozluk.com/konu/${slug}`)
        .setColor("#00b0f4")
        .setDescription(`${title} konusu maaşlısözlük'te yerini aldı. hemen fikrini belirt!`)
        .setFooter("maaşlı haberci bildirdi", "https://storage.googleapis.com/cdn.maaslisozluk.com/maasli-sozluk.jpg")
        .setTimestamp();

      await hook.send(embed);
      return result;
    }
  },
  updateTopic(parent, args, { request, prisma }, info) {
    const user = getUser(request);
    const userType = user.userType;
    if (userType !== "ADMIN" && userType !== "MODERATOR") {
      throw new Error("Permission denied.");
    }

    return prisma.mutation.updateTopic({
      where: {
        id: args.id,
      },
      data: {
        title: args.data.title,
      },
    });
  },
  deleteTopic(parent, args, { request, prisma }, info) {
    const user = getUser(request);
    const userType = user.userType;
    if (userType !== "ADMIN" && userType !== "MODERATOR") {
      throw new Error("Permission denied.");
    }

    return prisma.mutation.deleteTopic(
      {
        where: {
          id: args.id,
        },
      },
      info
    );
  },
};

export default topicMutation;

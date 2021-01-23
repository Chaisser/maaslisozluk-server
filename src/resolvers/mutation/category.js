import getSlug from "speakingurl";

const categoryMutation = {
  createCategory(parent, args, { prisma, request }, info) {
    const { title, description } = args.data;
    const slug = getSlug(title, { lang: "tr" });
    return prisma.mutation.createCategory(
      {
        data: {
          title,
          description,
          order: 99,
          slug,
        },
      },
      info
    );
  },
  updateCategory(parent, args, { prisma, request }, info) {
    const { title, description } = args.data;
    const categoryId = args.id;
    const data = {};

    if (typeof title === "string") {
      data.title = title;
      data.slug = getSlug(title, { lang: "tr" });
    }

    if (typeof description === "string") {
      data.description = description;
    }

    return prisma.mutation.updateCategory(
      {
        where: {
          id: categoryId,
        },
        data,
      },
      info
    );
  },
  deleteCategory(parent, args, { prisma, request }, info) {
    const id = args.id;
    return prisma.mutation.deleteCategory({
      where: {
        id,
      },
    });
  },
};

export default categoryMutation;

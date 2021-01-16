import prisma from "./../prisma";
import axios from "axios";
const fetchCurrency = async () => {
  const url = "https://api.coindesk.com/v1/bpi/currentprice/TRY.json";
  const result = await axios.get(url);
  const usDollar = result.data.bpi.USD.rate_float;
  const turkishLira = result.data.bpi.TRY.rate_float;

  return prisma.mutation.createCurrency(
    {
      data: {
        usDollar,
        turkishLira,
      },
    },
    null
  );
};

export default fetchCurrency;

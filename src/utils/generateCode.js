const generateCode = (min = 1000000, max = 9999999) => {
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
};

export default generateCode;

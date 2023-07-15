export const errorManagement = (res, status, message) => {
  console.log("debug", message);
  // res.status(status).send({ message });
};

export default { errorManagement };

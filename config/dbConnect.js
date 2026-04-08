require("dotenv").config();
const mongoose = require("mongoose");
const dbConnect = () => {
  const cluster_url = process.env.MONGO_URL;

  mongoose
    .connect(cluster_url)
    .then(() => console.log("Database connected"))
    .catch((err) => console.log(err));
};
module.exports = { dbConnect };

// const mongoose = require("mongoose");

// const dbConnect = () => {
//   mongoose
//     .connect(process.env.MONGO_URL, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     })
//     .then(() => console.log("Database connected"))
//     .catch((err) => console.log("DB ERROR:", err));
// };

// module.exports = { dbConnect };

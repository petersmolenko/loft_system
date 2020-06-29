const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
let dbName;

switch (process.env.MODE) {
    case "dev":
        dbName = "loft_system-dev";
        break;
    case "prod":
        dbName = "loft_system";
        break;
    default:
        dbName = "loft_system-dev";
}
module.exports.connect = (clb) => {
    mongoose
        .connect(
            `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-cgbvb.azure.mongodb.net/${dbName}?retryWrites=true&w=majority`,
            {
                useNewUrlParser: true,
                useCreateIndex: true,
                useUnifiedTopology: true,
                useFindAndModify: false
            }
        )
        .then(() => {if(clb) clb()})
        .catch((err) => {
            if (err.message.indexOf("ECONNREFUSED") !== -1) {
                console.error(
                    "Error: The server was not able to reach MongoDB. Maybe it's not running?"
                );
                process.exit(1);
            } else {
                throw err;
            }
        });
};

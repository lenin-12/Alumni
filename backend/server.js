const http = require("http");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const app = require("./src/app");
const initSocket = require("./src/config/socket");

dotenv.config();

const PORT = process.env.PORT || 5001;
const MONGO_URI =
    process.env.MONGO_URI || "mongodb://localhost:27017/alumni_network";


const server = http.createServer(app);



const io = initSocket(server);

app.set("io", io);




mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected");

        server.listen(PORT, () => {
            console.log(
                `🚀 Server running at http://localhost:${PORT}`
            );
        });
    })
    .catch((err) => {
        console.error(" MongoDB Connection Failed");
        console.error(err.message);
        console.error(err);
        process.exit(1);
    });


process.on("unhandledRejection", (err) => {
    console.error("Unhandled Promise Rejection:", err);
    server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    process.exit(1);
});
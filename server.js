const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
dotenv.config();
const app = express()
app.use(cors({ origin: true }))
app.use(express.json())

// Connect to CockroachDB
const { Sequelize, DataTypes } = require("sequelize-cockroachdb");

const sequelize = new Sequelize(process.env.DATABASE_URL);

(async() => {
    try {
        const [results, metadata] = await sequelize.query("SELECT NOW()");
        console.log('the value of the results is: ', results);
    } catch (err) {
        console.error("error executing query:", err);
    }
})();

// Define the Banner model

const Banner = sequelize.define('banner', {
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    link: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    timer: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

});

// Sync database and initialize the Banner table
sequelize.sync();

app.get('/api/banner', async(req, res) => {
    const banner = await Banner.findOne({ where: { id: 1 } });
    if (banner == null) {
        res.json({ message: "Please save the banner" })
    } else res.json(banner);
});

app.post('/api/banner', async(req, res) => {

    const { description, link, timer } = req.body;
    if (!description || !link || !timer) res.sendStatus(404);
    await Banner.upsert({ id: 1, description, link, timer });
    res.sendStatus(200);
});
app.get("/", (req, res) => {
    res.send("<h1>Hello!</h1>");
})
app.listen(4000, () => {
    console.log('Server is running on port 4000');
});
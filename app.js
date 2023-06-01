import express from "express";
import { nanoid } from "nanoid"; // produce random URL-friendly key
import { pool1, getOriginalURL1 } from "./database/mysql-1.js";
import { pool2, getOriginalURL2 } from "./database/mysql-2.js";
import { pool3, getOriginalURL3 } from "./database/mysql-3.js";
import { redisClient, checkRedisConnected } from "./cache/redis.js";
import { checkCache } from "./middleware/checkCache.js";
// import { client, db } from "./database/mongodb.js";

const app = express();

app.use(express.urlencoded());
app.use(express.json());
app.use("/public", express.static("public"));

app.set("view engine", "ejs");
app.set("views", "./views");

const host_ip = "ctceth.com";

// test
// app.get("/", (req, res) => {
//   const randomKey = nanoid(5);
//   const lastkey = randomKey[randomKey.length - 1];
//   const key = randomKey + "1";
//   console.log(randomKey);
//   console.log(lastkey);
//   console.log(key);
//   res.send(randomKey);
// });

app.get("/", (req, res) => {
  res.render("short-url");
});

// POST API for creating short URL and checking collision
app.post("/", async (req, res) => {
  const originalURL = req.body.originalUrl;
  console.log(originalURL);
  const randomKey = nanoid(5);
  const lastNumber = "1";
  let finalKey = randomKey + lastNumber;

  const connection = await pool1.getConnection();
  try {
    await connection.beginTransaction();

    let result = "";

    // connect specified DB to check whether finalKey already exist
    const responseCheckFinalKey = await connection.query(
      `
          SELECT * FROM shorturl
          WHERE
          final_key = ?
      `,
      [finalKey]
    );
    result = responseCheckFinalKey[0][0];

    // if url
    while (result !== undefined) {
      const randomKeyBackup = nanoid(5);
      finalKey = randomKeyBackup + lastNumber;
      const responseCheckFinalKey = await connection.query(
        `
            SELECT * FROM shorturl
            WHERE
            final_key = ?
        `,
        [finalKey]
      );
      result = responseCheckFinalKey[0][0];
    }

    // store the finalKey and original URL to DB
    const responseStoreURL = await connection.query(
      `
          INSERT INTO shorturl (final_key, original_url)
          VALUES
          (?, ?)
      `,
      [finalKey, originalURL]
    );

    await connection.commit();

    // return short URL
    // res.send(`http://${host_ip}/${finalKey}`);
    res.send({
      status: "success",
      message: "建立成功",
      url: `http://${host_ip}/${finalKey}`,
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).send(error);
  } finally {
    connection.release();
  }

  // mongo
  // try {
  //   let shortUrl = finalKey;
  //   // console.log('---hit shorturl---' , shortUrl)

  //   const result = await db
  //     .collection("urls")
  //     .insertOne({ shortUrl, originalUrl });
  //   // console.log('result id -->',result);
  //   res.send({
  //     status: "success",
  //     message: "建立成功",
  //     url: `http://${host_ip}/${shortUrl}`,
  //   });
  // } catch (err) {
  //   console.log(err);
  //   res.status(500).send("發生錯誤");
  // }
});

// GET API for getting original URL and redirect to it
app.get("/:finalKey", checkCache, async (req, res) => {
  // const finalKey = req.params.finalKey;
  if (checkRedisConnected) {
    // mysql
    try {
      const finalKey = req.params.finalKey;
      const finalKeyLastNumber = finalKey[finalKey.length - 1];
      let originalURL = "";
      // check the short URL being stored at which DB
      if (finalKeyLastNumber === "1") {
        originalURL = await getOriginalURL1(finalKey);
      } else if (finalKeyLastNumber === "2") {
        originalURL = await getOriginalURL2(finalKey);
      } else if (finalKeyLastNumber === "3") {
        originalURL = await getOriginalURL3(finalKey);
      }
      await redisClient.set(finalKey, originalURL);
      // redirect to the original URL
      console.log("Redirect to", originalURL);
      res.redirect(originalURL);
    } catch (error) {
      res.status(500).send(error);
    }

    // mongodb
    // try {
    //   const db = client.db("urls");
    //   const result = await db
    //     .collection("urls")
    //     .findOne({ shortUrl: finalKey });
    //   if (result) {
    //     const originalUrl = result.originalUrl;
    //     console.log("original URL: ", originalUrl);
    //     await redisClient.set(finalKey, originalUrl);
    //     return res.status(200).redirect(originalUrl);
    //   } else {
    //     return res.status(404).send("URL not found");
    //   }
    // } catch (err) {
    //   console.log("err", err);
    //   return res.status(500).send("Error retrieving URL");
    // }
  } else {
    // mysql
    try {
      const finalKey = req.params.finalKey;
      const finalKeyLastNumber = finalKey[finalKey.length - 1];
      let originalURL = "";
      // check the short URL being stored at which DB
      if (finalKeyLastNumber === "1") {
        originalURL = await getOriginalURL1(finalKey);
      } else if (finalKeyLastNumber === "2") {
        originalURL = await getOriginalURL2(finalKey);
      } else if (finalKeyLastNumber === "3") {
        originalURL = await getOriginalURL3(finalKey);
      }
      // redirect to the original URL
      console.log("Redirect to", originalURL);
      res.redirect(originalURL);
    } catch (error) {
      res.status(500).send(error);
    }

    // mongodb
    // try {
    //   const db = client.db("urls");
    //   const result = await db
    //     .collection("urls")
    //     .findOne({ shortUrl: finalKey });
    //   if (result) {
    //     const originalUrl = result.originalUrl;
    //     console.log("original URL: ", originalUrl);
    //     return res.status(200).redirect(originalUrl);
    //   } else {
    //     return res.status(404).send("URL not found");
    //   }
    // } catch (err) {
    //   console.log("err", err);
    //   return res.status(500).send("Error retrieving URL");
    // }
  }
});

// listen on port:3000
app.listen("3000", () => {
  console.log("Server is running and listening on port:3000...");
});

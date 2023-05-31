//以下為mongodb的設定
import { MongoClient } from "mongodb";
const url = process.env.MONGODB_URL;
export const client = new MongoClient(url);
export let db;

async function main() {
  await client.connect();
  console.log("Connected successfully to server");
  db = client.db("urls");
  console.log("connect to db urls");
  return "done.";
}

main()
  .then((res) => {
    console.log(res);
  })
  .catch(console.error)
  .finally(() => console.log("run mongodb is running "));

//以上為mongodb的設定

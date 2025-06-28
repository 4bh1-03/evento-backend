const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());

// 🔐 Hardcoded Firebase service account key
const serviceAccount = {
  "type": "service_account",
  "project_id": "evento-venquest",
  "private_key_id": "f3546bdb49b23aac709cb0b5efd3d0b20d359062",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDA/2GbRUV12o64\nLHuk1fqNMm9bc5ytGcFg/S6ehyKecJ9HRpDXv9+w73ZlUxHXMzIBiGyHdcyQwT4/\nxN/3tKsYDXDXiKH2T5OrmwxFcUGuVjbcL+LAPM7LTamSH1o2MtORDuUfMYGmKrlm\nidkzGbr1er9HsPTc8yLLRvgLeN5BSLDBUEM4adIA5UR9EVO1UHf9oLz54EOAImEC\nsak3VPnlS1iukQPA8ZP6XOI11Jx1LJ3adUjG6iF/9pFgLCb5wp9e290pUaVRcIMD\nf7BDtxJjQ4kaASsY8BmCZq1144s0Lm/TPG4xykJkCDOLMhS1E7xoIMXea8GDiW5w\nDBRakIgPAgMBAAECggEANlQNlWhoF7d5AoZfHfUwTSv75eoDGkVMRvGufGi9CY3Z\ngHZwUpOMNCIMmZRLSuF5+618I5u5BKypSckxZOjiWuh5seqf8RbQkneYejnaC+nw\nEoaWVZgofFl12RDjU6t2G/jt7ZyBixWu0BsQ3c4p721oyBUbsNDuo/tr2srhAc4n\n1WEdjctqd0P4gB8l7AsahpTgbKbJqEQpYquAGmJCa48eBt1g7AtsKA6LvinN8Zrk\ngdIp49FyljhmVAcuWYf+KS6o/TxnRrioNj/Nau63nJxJeH33/OiXZYUgmokQPZNB\nec9fUL8z4qyosgyj9h4EWlyEGz3WZI1vjt0c0E6ifQKBgQDoCZyXWWBbrdO03K8s\nALMjpB2mpKNFnWPJmbMsxmIp3PzRxwCJFXVG2XiLUjX9b52GLzBABfgsnXBMG0PN\nPQ1sznEG63IjXX7xfpFHhxZW8e1bGrQVVOjMm5/dLBbtTAVODU4W0NhubZvATaU5\noG6/ZkV383ZCzcT7Dzn/K0QBTQKBgQDU7asKh+LgBN5fvpVfXkno/61a2P4LNpwE\nIK2vw9IWc3sql3Msz2ESp0FF3ByeNhEAnD00dv4l/AJBknTEqMiLq1/2WKnAAblQ\nbRIMa518B5epXnsLTfkvDTiVxqExiyrmhQ2/vClN487H1d4WphO8n0QkOrUyTQCf\n3Kw0WHGAywKBgQDTQvUMo7ZkolZPpGHlCVoQyDqq39k757nT8pm82X7EqMyS3sHx\nDdVyRUxIZPh9H+NnKY2frQ+w50M4N9a6hay0dR1ZdIK+CkEq9NanLio7zRcTTLPL\nfDxdFhAuWhchxIZL8zc29L0phag6JTeaySQsJZx4QvVYi2qePtXKKoVHPQKBgCjH\nJ3WJ1po+dHPzpNmxzgfQR1vZqLVvDOwBciHyJ57jGNhsTsNrJ9URsP93CwgFpLXw\nNgyBKWUO4UO7j59GD7on5OXhzwiVi+7qJIW6aluhfJsUHA5rLWikaIzOkHpTg7DI\nFHz+xQ5ErYo53CGMRsVd3wftMlxiwNbcxSH1Oi+HAoGAC8j3khTR2zBhRkft4WEt\nFdBlllj9zh92sjzs5mFqeZ9mdIgLKaT6e6F9iuGzD8fLWElvXv9ZXRK1En4sWnRd\ntXivGMwMMyYo3WKWWVKcTdrwmbEQah9oLDLi7ai5urn/dtdck8ojWHLMQLm75wGd\nGlJG51P+7tidD4E0mMJeRdw=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@evento-venquest.iam.gserviceaccount.com",
  "client_id": "108601278433367093613",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40evento-venquest.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://evento-venquest-default-rtdb.firebaseio.com"
});

const db = admin.database();

app.get("/", (req, res) => {
  res.send("✅ Webhook backend is up and running!");
});

app.post("/webhook", async (req, res) => {
  try {
    const intent = req.body.queryResult.intent.displayName;
    const city = req.body.queryResult.parameters["geo-city"];
    const type = req.body.queryResult.parameters["vendor-type"];

    console.log("Intent:", intent);
    console.log("City:", city);
    console.log("Vendor Type:", type);

    if (!city || !type) {
      return res.json({
        fulfillmentText: "Please provide both a city and vendor type.",
      });
    }

    const snapshot = await db
      .ref("Vendors")
      .orderByChild("location")
      .equalTo(city.toLowerCase())
      .once("value");

    const vendors = [];
    snapshot.forEach((child) => {
      const vendor = child.val();
      if (
        vendor.service &&
        vendor.service.toLowerCase().includes(type.toLowerCase())
      ) {
        vendors.push(`${vendor.companyName} (Phone: ${vendor.phone})`);
      }
    });

    if (vendors.length === 0) {
      return res.json({
        fulfillmentText: `Sorry, no ${type}s found in ${city}.`,
      });
    }

    const message = `Here are some ${type}s in ${city}:\n` + vendors.join("\n");
    return res.json({ fulfillmentText: message });

  } catch (err) {
    console.error("❌ Error in webhook:", err);
    return res.json({
      fulfillmentText: "Something went wrong. Please try again later.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
